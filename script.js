// AB&J Instructions Data
const instructions = [
    {
        step: 1,
        title: "Get Your Station Ready",
        text: "Okay, first, let's get your station ready. Put the bread, almond butter, jam, cutting board, and your spreader all on the counter."
    },
    {
        step: 2,
        title: "Lay Out the Bread",
        text: "Now, lay your two slices of bread on the cutting board."
    },
    {
        step: 3,
        title: "Spread the Almond Butter",
        text: "Take a good scoop of almond butter with your spreader and spread it all the way to the edges of one slice of bread."
    },
    {
        step: 4,
        title: "Add the Raspberry Jam",
        text: "Great. Now use a clean spoon to put some raspberry jam on the other slice and spread it out."
    },
    {
        step: 5,
        title: "Combine the Slices",
        text: "Carefully put the two slices together. Don't press too hard!"
    },
    {
        step: 6,
        title: "Slice and Plate",
        text: "Ask a grown-up to help you slice it, then place it on your plate with some fresh raspberries on the side."
    },
    {
        step: 7,
        title: "Clean Up",
        text: "Last step, let's clean up! Put the lids back on the jars and wipe the counter."
    }
];

// DOM Elements
const stepNumberElement = document.getElementById('stepNumber');
const instructionTitleElement = document.getElementById('instructionTitle');
const instructionTextElement = document.getElementById('instructionText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const celebrationContainer = document.getElementById('storybook-celebration');

// Current step tracking
let currentStep = 0;

// Initialize the page
function init() {
    updateInstruction();
    setupEventListeners();
    setupChecklistInteractions();
    if (celebrationContainer) celebrationContainer.style.display = 'none';
}

// Update the instruction display
function updateInstruction() {
    const instruction = instructions[currentStep];
    
    // Add fade out effect
    const instructionContent = document.querySelector('.instruction-content');
    instructionContent.style.opacity = '0';
    instructionContent.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        // Update content
        stepNumberElement.textContent = instruction.step;
        instructionTitleElement.textContent = instruction.title;
        instructionTextElement.textContent = instruction.text;
        
        // Update button states
        prevBtn.disabled = currentStep === 0;
        nextBtn.textContent = currentStep === instructions.length - 1 ? 'Finish' : 'Next';
        
        // Add fade in effect
        instructionContent.style.opacity = '1';
        instructionContent.style.transform = 'translateY(0)';
    }, 200);
}

// Setup event listeners
function setupEventListeners() {
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateInstruction();
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentStep < instructions.length - 1) {
            currentStep++;
            updateInstruction();
        } else {
            // Show completion message
            showCompletionMessage();
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
            prevBtn.click();
        } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
            nextBtn.click();
        }
    });
}

// Setup checklist interactions
function setupChecklistInteractions() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const label = e.target.nextElementSibling;
            const item = e.target.closest('.checklist-item');
            
            if (e.target.checked) {
                // Add completion animation
                item.style.background = '#f0f8ff';
                setTimeout(() => {
                    item.style.background = '';
                }, 1000);
                
                // Update progress
                updateProgress();
            }
        });
    });
}

// Update progress indicator
function updateProgress() {
    const totalItems = document.querySelectorAll('input[type="checkbox"]').length;
    const checkedItems = document.querySelectorAll('input[type="checkbox"]:checked').length;
    const progressPercentage = (checkedItems / totalItems) * 100;
    
    // You could add a progress bar here if desired
    // console.log(`Progress: ${progressPercentage.toFixed(1)}%`);
}

// Show completion message
function showCompletionMessage() {
    const instructionCard = document.querySelector('.instruction-card');
    if (instructionCard) instructionCard.style.display = 'none';
    if (celebrationContainer) {
        celebrationContainer.innerHTML = `
            <div class="storybook-ending" style="text-align: center; padding: 2rem;">
                <div class="storybook-illustration" aria-hidden="true">
                    <!-- Hand-drawn style SVG: a star, sparkles, and berries -->
                    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="30" cy="60" r="10" fill="#bfae8e" stroke="#6b5c3e" stroke-width="2"/>
                        <circle cx="50" cy="65" r="7" fill="#e2d6c2" stroke="#6b5c3e" stroke-width="2"/>
                        <ellipse cx="90" cy="60" rx="12" ry="8" fill="#bfae8e" stroke="#6b5c3e" stroke-width="2"/>
                        <path d="M60 20 l6 18 l-15-10 h18 l-15 10 z" fill="#f6f3ee" stroke="#bfae8e" stroke-width="2"/>
                        <g stroke="#bfae8e" stroke-width="2">
                            <line x1="60" y1="10" x2="60" y2="0"/>
                            <line x1="60" y1="10" x2="65" y2="5"/>
                            <line x1="60" y1="10" x2="55" y2="5"/>
                        </g>
                    </svg>
                </div>
                <h2 style="color: #6b5c3e; margin-bottom: 1rem; font-family: 'EB Garamond', serif;">The End (for now!)</h2>
                <p style="font-size: 1.2rem; color: #4d3b1a; margin-bottom: 2rem; font-family: 'EB Garamond', serif;">
                    And so, with a little care and a lot of fun, Apple made a perfect AB&J sandwich.<br>
                    What will you make next?
                </p>
                <button class="btn btn-primary" onclick="resetInstructions()" style="margin-right: 1rem;">
                    Start Over
                </button>
                <button class="btn btn-secondary" onclick="showOriginalContent()">
                    Review Steps
                </button>
            </div>
        `;
        celebrationContainer.style.display = 'flex';
    }
}

// Reset instructions to beginning
function resetInstructions() {
    currentStep = 0;
    const instructionCard = document.querySelector('.instruction-card');
    if (instructionCard) instructionCard.style.display = '';
    if (celebrationContainer) celebrationContainer.style.display = 'none';
    instructionCard.innerHTML = `
        <div class="step-indicator">
            <span class="step-number" id="stepNumber">1</span>
            <span class="step-label">of 7</span>
        </div>
        <div class="instruction-content">
            <h2 class="instruction-title" id="instructionTitle">Get Your Station Ready</h2>
            <p class="instruction-text" id="instructionText">Okay, first, let's get your station ready. Put the bread, almond butter, jam, cutting board, and your spreader all on the counter.</p>
        </div>
        <div class="navigation">
            <button class="btn btn-secondary" id="prevBtn" disabled>Previous</button>
            <button class="btn btn-primary" id="nextBtn">Next</button>
        </div>
    `;
    // Re-initialize
    init();
    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Show original content (go back to last step)
function showOriginalContent() {
    currentStep = instructions.length - 1;
    const instructionCard = document.querySelector('.instruction-card');
    if (instructionCard) instructionCard.style.display = '';
    if (celebrationContainer) celebrationContainer.style.display = 'none';
    instructionCard.innerHTML = `
        <div class="step-indicator">
            <span class="step-number" id="stepNumber">7</span>
            <span class="step-label">of 7</span>
        </div>
        <div class="instruction-content">
            <h2 class="instruction-title" id="instructionTitle">Clean Up</h2>
            <p class="instruction-text" id="instructionText">Last step, let's clean up! Put the lids back on the jars and wipe the counter.</p>
        </div>
        <div class="navigation">
            <button class="btn btn-secondary" id="prevBtn">Previous</button>
            <button class="btn btn-primary" id="nextBtn">Finish</button>
        </div>
    `;
    // Re-initialize
    init();
}

// Add some fun interactive features
function addFunFeatures() {
    // Add storybook-style sparkles when all checkboxes are checked
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const totalCheckboxes = checkboxes.length;
    function checkAllCompleted() {
        const checkedCount = document.querySelectorAll('input[type="checkbox"]:checked').length;
        if (checkedCount === totalCheckboxes) {
            createStorybookSparkles();
        }
    }
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkAllCompleted);
    });
}

// Storybook-style sparkles effect
function createStorybookSparkles() {
    for (let i = 0; i < 18; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'storybook-sparkle';
        sparkle.style.position = 'fixed';
        sparkle.style.left = Math.random() * 100 + 'vw';
        sparkle.style.top = Math.random() * 80 + 'vh';
        sparkle.style.width = '18px';
        sparkle.style.height = '18px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '9999';
        sparkle.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 1 L10.5 7.5 L17 9 L10.5 10.5 L9 17 L7.5 10.5 L1 9 L7.5 7.5 Z" fill="#e2d6c2" stroke="#bfae8e" stroke-width="1.5"/></svg>`;
        document.body.appendChild(sparkle);
        setTimeout(() => {
            sparkle.style.opacity = '0';
            sparkle.style.transform = 'scale(1.5)';
        }, 1200);
        setTimeout(() => {
            document.body.removeChild(sparkle);
        }, 1800);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init();
    addFunFeatures();
}); 