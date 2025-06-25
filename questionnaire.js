// Simple Questionnaire Logic
// ---------------------------

// ---------------------------
// Questionnaire + Invoice Logic
// ---------------------------

// Define the questions and metadata
const questions = [
  { id: "businessName", text: "Create invoice for (business name)", placeholder: "e.g. Acme Corporation", type: "text" },
  { id: "contactName", text: "Company Contact (name)", placeholder: "e.g. Jane Doe", type: "text" },
  { id: "sendEmailTo", text: "Email (send invoice to)", placeholder: "e.g. billing@acme.com", type: "email" },
  { id: "description", text: "What did you do?", placeholder: "e.g. Website development and design", type: "text" },
  { id: "hours", text: "How many hours?", placeholder: "e.g. 40", type: "number" },
  { id: "hourlyRate", text: "How much per hour?", placeholder: "e.g. 75", type: "number" },
  { id: "additionalCosts", text: "Any other costs?", placeholder: "e.g. 250 (0 if none)", type: "number" },
  { id: "yourEmail", text: "Email copy (your email)", placeholder: "e.g. you@example.com", type: "email" },
];

let currentIndex = 0;
const answers = {};

// DOM Elements
const questionElement = document.getElementById("question");
const answerInput = document.getElementById("answerInput");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");

// Invoice Elements
const invoicePreview = document.getElementById("invoicePreview");
const invoiceFields = {
  invoiceNumber: document.getElementById("invoiceNumber"),
  invoiceDate: document.getElementById("invoiceDate"),
  customerId: document.getElementById("customerId"),
  billTo: document.getElementById("billTo"),
  invoiceDescription: document.getElementById("invoiceDescription"),
  invoiceHours: document.getElementById("invoiceHours"),
  invoiceRate: document.getElementById("invoiceRate"),
  invoiceAmount: document.getElementById("invoiceAmount"),
  invoiceCosts: document.getElementById("invoiceCosts"),
  invoiceTotal: document.getElementById("invoiceTotal"),
};

const savePdfBtn = document.getElementById("savePdfBtn");
const emailBtn = document.getElementById("emailBtn");
const reminderModal = document.getElementById("reminderModal");
const continueBtn = document.getElementById("continueBtn");

// Render the current question and update UI
function render() {
  const q = questions[currentIndex];
  questionElement.textContent = q.text;
  answerInput.type = q.type || "text";
  answerInput.placeholder = q.placeholder || "";
  answerInput.value = answers[q.id] || "";

  // Button labels
  backBtn.disabled = currentIndex === 0;
  nextBtn.textContent = currentIndex === questions.length - 1 ? "Make My Invoice!" : "Next";
  // Focus input for better UX
  setTimeout(() => answerInput.focus(), 0);
}

function saveCurrentAnswer() {
  const currentQuestion = questions[currentIndex];
  answers[currentQuestion.id] = answerInput.value.trim();
}

// Event Listeners
backBtn.addEventListener("click", () => {
  saveCurrentAnswer();
  if (currentIndex > 0) {
    currentIndex--;
    render();
  }
});

nextBtn.addEventListener("click", () => {
  // Basic validation: ensure something is entered
  if (!answerInput.value.trim()) {
    answerInput.focus();
    return;
  }

  saveCurrentAnswer();

  if (currentIndex < questions.length - 1) {
    currentIndex++;
    render();
  } else {
    // Finished: show reminder modal first
    reminderModal.style.display = "flex";
    continueBtn.onclick = () => {
      reminderModal.style.display = "none";
      buildInvoice();
    };
  }
});

function buildInvoice() {
  // Hide quiz, show invoice section
  document.querySelector(".quiz-container").style.display = "none";
  invoicePreview.style.display = "block";

  // Populate invoice fields
  // Generate invoice number: initials + YYYYMMDD
  const initials = answers.businessName
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .join("")
    .slice(0, 3); // up to 3 letters
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, "");
  const invoiceNum = `${initials}-${datePart}`;

  const todayStr = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const hours = parseFloat(answers.hours) || 0;
  const rate = parseFloat(answers.hourlyRate) || 0;
  const costs = parseFloat(answers.additionalCosts) || 0;
  const amount = hours * rate;
  const total = amount + costs;

  invoiceFields.invoiceNumber.textContent = invoiceNum;
  invoiceFields.invoiceDate.textContent = todayStr;
  invoiceFields.customerId.textContent = answers.businessName.replace(/[^A-Z0-9]/gi, "").substring(0, 10).toUpperCase() || "-";

  invoiceFields.billTo.innerHTML = `${answers.businessName}<br/>Attn: ${answers.contactName}`;

  invoiceFields.invoiceDescription.textContent = answers.description;
  invoiceFields.invoiceHours.textContent = hours.toFixed(1);
  invoiceFields.invoiceRate.textContent = `$${rate.toFixed(2)}`;
  invoiceFields.invoiceAmount.textContent = `$${amount.toFixed(2)}`;
  invoiceFields.invoiceCosts.textContent = `$${costs.toFixed(2)}`;
  invoiceFields.invoiceTotal.textContent = `$${total.toFixed(2)}`;

  // Attach button listeners safely
  if (savePdfBtn) savePdfBtn.onclick = generatePdf;
  if (emailBtn) emailBtn.onclick = sendGmail;
}

function generatePdf() {
  if (typeof html2canvas === "undefined" || !window.jspdf) {
    alert("PDF libraries failed to load. Please try reloading the page.");
    return;
  }
  // Wait a moment to ensure fonts/styles are rendered
  setTimeout(() => {
    html2canvas(invoicePreview, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

      // Use jsPDF UMD global (window.jspdf.jsPDF)
      const jsPDFConstructor = window.jspdf?.jsPDF || window.jsPDF;
      if (!jsPDFConstructor) {
        alert("jsPDF failed to load. Try refreshing the page.");
        return;
      }
      const pdf = new jsPDFConstructor("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth;
      let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add image, splitting pages if needed
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);

      // If content overflows, add pages
      while (pdfHeight > pageHeight) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        pdfHeight -= pageHeight;
      }

      pdf.save(`invoice_${invoiceFields.invoiceNumber.textContent}.pdf`);
    });
  }, 300);
}

function sendGmail() {
  const base = "https://mail.google.com/mail/?view=cm&fs=1&tf=1";
  const params = new URLSearchParams({
    to: answers.sendEmailTo,
    cc: answers.yourEmail,
    su: "Invoice from Verity Investigative Group Inc.",
    body: `Hi ${answers.contactName}, please find your invoice attached. Thanks!`,
  });
  window.open(`${base}&${params.toString()}`, "_blank");
}

// Kick things off
render(); 