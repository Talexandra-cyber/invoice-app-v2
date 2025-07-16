// Mental Health Chatbot Web Interface
class MentalHealthChatbot {
    constructor() {
        this.currentStage = 1;
        this.stages = ['journal', 'assessment', 'support'];
        this.journalEntry = '';
        this.gad7Scores = [];
        this.gad7Questions = [
            "To start, over the last couple of weeks, how often have you been feeling nervous, anxious, or on edge?",
            "How about being able to stop or control your worrying? How often has that been a challenge?",
            "And what about worrying too much about different things? How often has that been happening?",
            "Have you had much trouble relaxing over the past two weeks?",
            "How often have you been feeling so restless that it's hard to sit still?",
            "What about becoming easily annoyed or irritable? Has that been happening often?",
            "And lastly, how often have you felt afraid, as if something awful might happen?"
        ];
        this.currentQuestionIndex = 0;
        this.waitingForResponse = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startWelcomeSequence();
    }
    
    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.statusText = document.getElementById('statusText');
        this.charCount = document.getElementById('charCount');
        this.loadingOverlay = document.getElementById('loadingOverlay');
    }
    
    setupEventListeners() {
        // Send button click
        this.sendButton.addEventListener('click', () => {
            if (!this.sendButton.disabled) {
                this.handleSendMessage();
            }
        });
        
        // Enter key to send (with Shift+Enter for new line)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!this.sendButton.disabled) {
                    this.handleSendMessage();
                }
            }
        });
        
        // Input changes
        this.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.updateSendButton();
        });
        
        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
        });
    }
    
    async startWelcomeSequence() {
        // Display welcome messages as bot messages
        await this.delay(500);
        this.addMessage("🌟 Welcome to Your Mental Health Check-in", 'bot');
        
        await this.delay(2000);
        this.addMessage("📝 <strong>Personal Journaling:</strong> We'll start with a reflection space where you can share your thoughts about your week in a judgment-free environment.", 'bot');
        
        await this.delay(3000);
        this.addMessage("🧠 <strong>Mental Health Assessment:</strong> Next, I'll ask you some questions about your wellbeing to help me understand your current mental state and needs.", 'bot');
        
        await this.delay(3000);
        this.addMessage("💙 <strong>Personalized Support:</strong> Finally, you'll receive tailored coping strategies and mental health resources based on your responses.", 'bot');
        
        await this.delay(3000);
        this.addMessage("⚠️ <strong>Important:</strong> This is a supportive tool, not a replacement for professional therapy. If you're experiencing a crisis, please contact emergency services or a crisis hotline.", 'bot');
        
        await this.delay(3000);
        this.startJournalingStage();
    }
    
    async startJournalingStage() {
        this.addMessage("📝 Let's begin with your personal reflection.", 'system');
        
        await this.delay(1500);
        this.addMessage("This is a safe space for you to share your thoughts about your week. You can write about how you've been feeling emotionally, any challenges or stressors you've faced, positive moments or achievements, or anything else that's been on your mind.", 'bot');
        
        await this.delay(2000);
        this.addMessage("📖 Please take a few moments to write about your week. There's no right or wrong way to express yourself here.", 'bot');
        
        this.updateStatus("Journaling stage - Share your thoughts");
    }
    
    updateCharCount() {
        const count = this.messageInput.value.length;
        this.charCount.textContent = count;
        
        if (count > 1800) {
            this.charCount.style.color = '#ef4444';
        } else if (count > 1500) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = '#64748b';
        }
    }
    
    updateSendButton() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.waitingForResponse;
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 150) + 'px';
    }
    
    updateProgress(stage) {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNumber < stage) {
                step.classList.add('completed');
            } else if (stepNumber === stage) {
                step.classList.add('active');
            }
        });
    }
    
    updateStatus(text) {
        this.statusText.textContent = text;
    }
    
    showLoading() {
        this.loadingOverlay.classList.add('show');
        this.waitingForResponse = true;
        this.updateSendButton();
    }
    
    hideLoading() {
        this.loadingOverlay.classList.remove('show');
        this.waitingForResponse = false;
        this.updateSendButton();
    }
    
    addMessage(content, type = 'bot', timestamp = true) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // Create content wrapper to handle HTML safely
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;
        messageDiv.appendChild(contentDiv);
        
        if (timestamp) {
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-timestamp';
            timeDiv.textContent = new Date().toLocaleTimeString();
            messageDiv.appendChild(timeDiv);
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    clearInput() {
        this.messageInput.value = '';
        this.updateCharCount();
        this.updateSendButton();
        this.autoResizeTextarea();
    }
    
    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.clearInput();
        
        // Process based on current stage
        if (this.currentStage === 1) {
            await this.handleJournalStage(message);
        } else if (this.currentStage === 2) {
            await this.handleAssessmentStage(message);
        } else if (this.currentStage === 3) {
            await this.handleSupportStage(message);
        }
    }
    
    async handleJournalStage(message) {
        this.journalEntry = message;
        this.showLoading();
        
        // Simulate processing time
        await this.delay(2000);
        
        this.hideLoading();
        this.addMessage("✅ Thank you for sharing!", 'bot');
        this.addMessage("📝 Your reflections have been noted for our conversation.", 'system');
        
        await this.delay(1500);
        this.startAssessmentStage();
    }
    
    async handleAssessmentStage(message) {
        this.showLoading();
        
        // Simulate AI scoring
        const score = this.simulateGAD7Scoring(message);
        this.gad7Scores.push(score);
        
        await this.delay(1500);
        this.hideLoading();
        
        // Show empathetic response for high scores
        if (score >= 2) {
            const empathyResponses = [
                "I can hear that this has been challenging for you. Thank you for sharing.",
                "That sounds really difficult. It takes courage to acknowledge these feelings.",
                "I appreciate you being open about this. These experiences can be really tough.",
                "It's understandable to feel this way. Thank you for trusting me with this.",
                "That must be exhausting. I'm glad you're taking steps to address this.",
                "These feelings are valid. Thank you for sharing something so personal.",
                "I can sense this has been weighing on you. Your awareness is a strength."
            ];
            
            this.addMessage(`💙 ${empathyResponses[this.currentQuestionIndex]}`, 'bot');
            await this.delay(2000);
        }
        
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.gad7Questions.length) {
            this.askNextQuestion();
        } else {
            this.completeAssessment();
        }
    }
    
    async handleSupportStage(message) {
        this.showLoading();
        
        // Simulate AI response
        await this.delay(2000);
        
        this.hideLoading();
        this.addMessage("Thank you for continuing to share. Based on our conversation, I'm here to provide ongoing support and resources.");
        
        await this.delay(1000);
        this.addMessage("Would you like to explore more coping strategies or discuss anything else that's on your mind?");
    }
    
    simulateGAD7Scoring(response) {
        const lowerResponse = response.toLowerCase();
        
        // Score 0: Not at all
        if (lowerResponse.includes('not at all') || lowerResponse.includes('never') || 
            lowerResponse.includes('nope') || lowerResponse.includes('no ')) {
            return 0;
        }
        
        // Score 3: Nearly every day
        if (lowerResponse.includes('every day') || lowerResponse.includes('constantly') || 
            lowerResponse.includes('all the time') || lowerResponse.includes('always')) {
            return 3;
        }
        
        // Score 2: More than half the days
        if (lowerResponse.includes('most days') || lowerResponse.includes('often') || 
            lowerResponse.includes('a lot') || lowerResponse.includes('frequently')) {
            return 2;
        }
        
        // Score 1: Several days (default for other responses)
        return 1;
    }
    
    async startAssessmentStage() {
        this.currentStage = 2;
        this.updateProgress(2);
        this.updateStatus("Assessment in progress");
        
        await this.delay(1000);
        this.addMessage("🧠 Now I'd like to ask you some questions about how you've been feeling lately.", 'system');
        
        await this.delay(1500);
        this.addMessage("This helps me understand your current mental state so I can provide better support.");
        
        await this.delay(1500);
        this.addMessage("Please answer honestly - there are no right or wrong answers.");
        
        await this.delay(2000);
        this.askNextQuestion();
    }
    
    askNextQuestion() {
        const questionNumber = this.currentQuestionIndex + 1;
        const question = this.gad7Questions[this.currentQuestionIndex];
        
        this.addMessage(`📋 Question ${questionNumber} of 7:`, 'system');
        this.addMessage(`💭 ${question}`);
        
        this.updateStatus(`Question ${questionNumber} of 7`);
    }
    
    async completeAssessment() {
        const totalScore = this.gad7Scores.reduce((sum, score) => sum + score, 0);
        
        this.addMessage("📊 Assessment Complete", 'system');
        
        await this.delay(1000);
        
        let severity, emoji;
        if (totalScore <= 4) {
            severity = "Minimal";
            emoji = "😊";
        } else if (totalScore <= 9) {
            severity = "Mild";
            emoji = "😐";
        } else if (totalScore <= 14) {
            severity = "Moderate";
            emoji = "😟";
        } else {
            severity = "Severe";
            emoji = "😰";
        }
        
        this.addMessage(`Your anxiety level appears to be: ${emoji} ${severity}`);
        this.addMessage(`Total score: ${totalScore} out of 21`);
        
        if (totalScore >= 10) {
            await this.delay(1500);
            this.addMessage("💡 Based on your responses, you might benefit from professional support. Consider reaching out to a mental health professional for personalized guidance.");
        }
        
        await this.delay(2000);
        this.startSupportStage(totalScore);
    }
    
    async startSupportStage(totalScore) {
        this.currentStage = 3;
        this.updateProgress(3);
        this.updateStatus("Generating personalized support");
        
        this.showLoading();
        
        // Simulate AI processing
        await this.delay(3000);
        
        this.hideLoading();
        
        this.addMessage("🎯 Your Personalized Mental Health Summary", 'system');
        
        await this.delay(1500);
        
        // Generate personalized response
        const response = this.generatePersonalizedResponse(totalScore);
        this.addMessage(response);
        
        await this.delay(2000);
        this.showFinalSupport();
    }
    
    generatePersonalizedResponse(totalScore) {
        const highestScore = Math.max(...this.gad7Scores);
        const highestSymptomIndex = this.gad7Scores.indexOf(highestScore);
        
        const symptoms = [
            "feeling nervous or anxious",
            "uncontrollable worrying",
            "worrying about different things",
            "trouble relaxing",
            "restlessness",
            "irritability",
            "feeling afraid"
        ];
        
        const strategies = [
            "When you feel that anxious energy, try the '5-4-3-2-1' grounding technique. Look around and name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
            "Try scheduling a 'worry time'. Set aside 15 minutes each day to let yourself worry about everything on your mind. When a worry pops up outside that time, jot it down and tell yourself you'll deal with it during your scheduled time.",
            "When your mind is racing with different worries, grab a piece of paper and do a 'brain dump'. Write down every single thing you're worried about, big or small. Often, just getting them out of your head and onto paper can make them feel more manageable.",
            "Try 'progressive muscle relaxation'. Starting with your toes, tense a muscle group for five seconds, then release it for thirty seconds. Work your way up your body. This physical release can lead to mental relaxation.",
            "Channel that restless energy into a simple, repetitive physical activity. This could be walking around the room, tidying up a small space, or stretching. Giving the energy a purpose can help it dissipate.",
            "When you feel irritation rising, focus on your breath. Take a slow, deep breath in through your nose for four counts, hold it for four counts, and exhale slowly through your mouth for six counts. Repeat this a few times to calm your nervous system.",
            "When you feel that sense of dread, gently challenge the thought. Ask yourself: 'What is the evidence for this awful thing happening? What is a more likely outcome?' This technique, called cognitive restructuring, can help break the cycle of catastrophic thinking."
        ];
        
        const highestSymptom = symptoms[highestSymptomIndex];
        const strategy = strategies[highestSymptomIndex];
        
        return `Thank you for sharing your thoughts and taking the time for this assessment. I can see that ${highestSymptom} has been particularly challenging for you lately. 

Here's a personalized strategy that might help: ${strategy}

Remember, you're taking positive steps by being mindful of your mental health. These feelings are manageable, and you have the strength to work through them.`;
    }
    
    async showFinalSupport() {
        this.addMessage("🌟 Final Words of Support", 'system');
        
        await this.delay(1000);
        
        const supportMessages = [
            "🌈 You've taken a brave and important step by checking in with your mental health today.",
            "🌱 Remember that healing and growth are ongoing processes - be patient with yourself.",
            "💪 You have the strength to work through these challenges, and support is available.",
            "🔄 Consider making this check-in a regular part of your self-care routine.",
            "📞 If you're struggling, don't hesitate to reach out to a mental health professional."
        ];
        
        for (let i = 0; i < supportMessages.length; i++) {
            await this.delay(1500);
            this.addMessage(supportMessages[i]);
        }
        
        await this.delay(2000);
        this.addMessage("💙 Take care of yourself. You matter, and your wellbeing is important.");
        
        this.updateStatus("Check-in complete - You did great!");
        
        // Enable continued conversation
        this.messageInput.placeholder = "Feel free to continue sharing or ask questions...";
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize chatbot immediately
    console.log('Mental Health Chatbot Web Interface Ready');
    
    // Start the chatbot
    const chatbot = new MentalHealthChatbot();
}); 