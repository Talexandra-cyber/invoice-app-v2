#!/usr/bin/env python3
"""
Mental Health Check-in Chatbot
A terminal-based chatbot that guides users through personalized mental health check-ins
using GAD-7 protocol and CBT techniques with ChromaDB vector search.
"""

import os
import sys
import chromadb
import openai
from dotenv import load_dotenv

def setup_environment():
    """Setup environment and load configurations"""
    print("🔧 Setting up mental health chatbot...")
    
    # Load environment variables from .env file
    try:
        load_dotenv()
        print("✓ Loaded .env file")
    except Exception as e:
        print(f"⚠️  Warning: Could not load .env file: {e}")
    
    # Get OpenAI API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OPENAI_API_KEY not found in environment variables or .env file.")
        print("Please add OPENAI_API_KEY=your-key-here to your .env file")
        sys.exit(1)
    
    print("✓ OpenAI API key loaded successfully")
    return api_key

def initialize_chromadb():
    """Initialize ChromaDB client and get the mental health support collection"""
    try:
        # Initialize persistent ChromaDB client
        client = chromadb.PersistentClient(path="./db")
        print("✓ ChromaDB client initialized successfully")
        
        # Get the existing mental health support collection
        try:
            collection = client.get_collection("mental_health_support")
            document_count = collection.count()
            print(f"✓ Connected to 'mental_health_support' collection ({document_count} documents)")
            return collection
        except Exception as e:
            print(f"❌ Error: Could not find 'mental_health_support' collection: {e}")
            print("Please run 'python build_database.py' first to create the vector database")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error initializing ChromaDB: {e}")
        sys.exit(1)

def initialize_openai_client(api_key):
    """Initialize OpenAI client"""
    try:
        client = openai.OpenAI(api_key=api_key)
        print("✓ OpenAI client initialized successfully")
        return client
    except Exception as e:
        print(f"❌ Error initializing OpenAI client: {e}")
        sys.exit(1)

def search_knowledge_base(collection, query, n_results=3):
    """Search the knowledge base for relevant information"""
    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results
        )
        return results
    except Exception as e:
        print(f"⚠️  Error searching knowledge base: {e}")
        return None

def generate_response(openai_client, user_input, context_documents):
    """Generate AI response using OpenAI with context from knowledge base"""
    try:
        # Prepare context from retrieved documents
        context = ""
        if context_documents and context_documents['documents']:
            for doc in context_documents['documents'][0][:2]:  # Use top 2 results
                context += f"Knowledge: {doc}\n\n"
        
        # Create the prompt
        system_prompt = f"""You are a compassionate mental health support assistant. Use the following knowledge base to provide helpful, empathetic responses. Always be supportive and encourage professional help when appropriate.

{context}

Guidelines:
- Be empathetic and understanding
- Provide practical, actionable advice
- Reference CBT techniques when relevant
- If discussing GAD-7 symptoms, be gentle and validating
- Always remind users that this is not a replacement for professional therapy
- Keep responses concise but meaningful"""

        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        print(f"⚠️  Error generating response: {e}")
        return "I apologize, but I'm having trouble processing your request right now. Please try again."

def stage1_journaling():
    """Stage 1: Journaling - Collect user's thoughts about their week"""
    print("\n" + "=" * 60)
    print("📝 Stage 1: Weekly Reflection & Journaling")
    print("=" * 60)
    print("Welcome to your personal mental health check-in!")
    print("This is a safe space for you to reflect on your week and share your thoughts.")
    print("\nTaking time to journal can help you process your experiences and emotions.")
    print("There's no right or wrong way to express yourself here.")
    print("\n" + "-" * 60)
    
    # Prompt for journal entry
    print("📖 Please take a few moments to write about your week...")
    print("You can share:")
    print("   • How you've been feeling emotionally")
    print("   • Any challenges or stressors you've faced")
    print("   • Positive moments or achievements")
    print("   • Anything else that's been on your mind")
    print("\nPress Enter twice when you're finished writing.")
    print("-" * 60)
    
    # Collect multi-line journal entry
    journal_lines = []
    print("✍️  Start writing (press Enter twice to finish):")
    
    empty_line_count = 0
    while True:
        try:
            line = input()
            if line.strip() == "":
                empty_line_count += 1
                if empty_line_count >= 2:
                    break
            else:
                empty_line_count = 0
                journal_lines.append(line)
        except KeyboardInterrupt:
            print("\n⚠️  Journaling interrupted. Let's continue with what you've shared so far.")
            break
    
    # Join the journal entry
    journal_entry = "\n".join(journal_lines).strip()
    
    # Provide feedback
    if journal_entry:
        word_count = len(journal_entry.split())
        print(f"\n✅ Thank you for sharing! You wrote {word_count} words.")
        print("📝 Your thoughts have been noted for our conversation.")
    else:
        print("\n💭 That's okay if you don't feel like writing much today.")
        print("Sometimes it's hard to put feelings into words.")
        journal_entry = "User chose not to write much today."
    
    print("\n🌱 Remember: Taking time to reflect is already a positive step for your mental health.")
    return journal_entry

def get_gad7_score(openai_client, user_answer):
    """Use OpenAI to classify user's answer into GAD-7 score (0-3)"""
    try:
        prompt = f"""Based on the GAD-7 scoring rules, classify the user's answer: "{user_answer}" into a score of 0, 1, 2, or 3. 

Scoring rules:
- 0 = Not at all, never, nope
- 1 = Several days, sometimes, a little bit, a few days
- 2 = More than half the days, often, a lot
- 3 = Nearly every day, constantly, all the time

Return only the number (0, 1, 2, or 3)."""

        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a clinical assessment tool. Only return the numeric score (0, 1, 2, or 3)."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1,
            temperature=0
        )
        
        score_text = response.choices[0].message.content.strip()
        score = int(score_text) if score_text.isdigit() and score_text in ['0', '1', '2', '3'] else 0
        return score
    
    except Exception as e:
        print(f"⚠️  Error getting GAD-7 score: {e}")
        return 0

def stage2_gad7_assessment(collection, openai_client):
    """Stage 2: GAD-7 Assessment - Conduct anxiety screening"""
    print("\n" + "=" * 60)
    print("🧠 Stage 2: Anxiety Assessment (GAD-7)")
    print("=" * 60)
    print("Now I'd like to ask you some questions about how you've been feeling lately.")
    print("This helps me understand your current mental state so I can provide better support.")
    print("\nPlease answer honestly - there are no right or wrong answers.")
    print("Your responses will help me offer you the most relevant coping strategies.")
    print("-" * 60)
    
    # GAD-7 questions search terms
    gad7_questions = [
        "feeling nervous, anxious, or on edge",
        "being able to stop or control your worrying",
        "worrying too much about different things",
        "trouble relaxing",
        "feeling so restless that it's hard to sit still",
        "becoming easily annoyed or irritable",
        "feeling afraid, as if something awful might happen"
    ]
    
    scores = []
    total_score = 0
    
    for i, question_topic in enumerate(gad7_questions, 1):
        print(f"\n📋 Question {i} of 7:")
        print("-" * 30)
        
        # Query ChromaDB for the specific question
        try:
            question_results = collection.query(
                query_texts=[f"Question {question_topic}"],
                n_results=1
            )
            
            # Extract the question from results
            if question_results['documents'] and question_results['documents'][0]:
                # Search for the actual question in the document
                doc_content = question_results['documents'][0][0]
                lines = doc_content.split('\n')
                
                question_text = f"Over the last couple of weeks, how often have you been {question_topic}?"
                
                # Try to find the actual question in the document
                for line in lines:
                    if f"Question:" in line and question_topic.split()[0] in line:
                        # Extract the question text
                        question_start = line.find('"') + 1
                        question_end = line.rfind('"')
                        if question_start > 0 and question_end > question_start:
                            question_text = line[question_start:question_end]
                        break
                
                print(f"💭 {question_text}")
                
            else:
                # Fallback question format
                question_text = f"Over the last couple of weeks, how often have you been {question_topic}?"
                print(f"💭 {question_text}")
                
        except Exception as e:
            print(f"⚠️  Error retrieving question: {e}")
            question_text = f"Over the last couple of weeks, how often have you been {question_topic}?"
            print(f"💭 {question_text}")
        
        # Get user's answer
        user_answer = input("\n🗣️  Your answer: ").strip()
        
        if not user_answer:
            user_answer = "no response"
        
        # Get GAD-7 score from OpenAI
        print("🔍 Analyzing your response...")
        score = get_gad7_score(openai_client, user_answer)
        scores.append(score)
        total_score += score
        
        # If score is high (2 or 3), show empathetic response
        if score >= 2:
            try:
                empathy_results = collection.query(
                    query_texts=[f"Empathetic Response {question_topic} scores 2 or 3"],
                    n_results=1
                )
                
                if empathy_results['documents'] and empathy_results['documents'][0]:
                    doc_content = empathy_results['documents'][0][0]
                    lines = doc_content.split('\n')
                    
                    # Find the empathetic response
                    for line in lines:
                        if "Empathetic Response" in line and "scores 2 or 3" in line:
                            # Extract the empathetic response
                            response_start = line.find('"') + 1
                            response_end = line.rfind('"')
                            if response_start > 0 and response_end > response_start:
                                empathy_text = line[response_start:response_end]
                                print(f"\n💙 {empathy_text}")
                                break
                    else:
                        # Fallback empathetic response
                        print(f"\n💙 I can hear that this has been challenging for you. Thank you for sharing.")
                else:
                    print(f"\n💙 I can hear that this has been challenging for you. Thank you for sharing.")
                    
            except Exception as e:
                print(f"⚠️  Error retrieving empathetic response: {e}")
                print(f"\n💙 I can hear that this has been challenging for you. Thank you for sharing.")
        
        # Brief pause between questions
        if i < 7:
            print("\n" + "." * 20)
    
    # Assessment complete
    print(f"\n" + "=" * 60)
    print("📊 Assessment Complete")
    print("=" * 60)
    
    # Interpret total score
    if total_score <= 4:
        severity = "Minimal"
        emoji = "😊"
    elif total_score <= 9:
        severity = "Mild"
        emoji = "😐"
    elif total_score <= 14:
        severity = "Moderate"
        emoji = "😟"
    else:
        severity = "Severe"
        emoji = "😰"
    
    print(f"Your anxiety level appears to be: {emoji} {severity}")
    print(f"Total score: {total_score} out of 21")
    
    if total_score >= 10:
        print("\n💡 Based on your responses, you might benefit from professional support.")
        print("Consider reaching out to a mental health professional for personalized guidance.")
    
    print("\n✨ Remember: This assessment helps me provide you with more targeted support.")
    print("Let's now explore some coping strategies that might help you feel better.")
    
    return scores, total_score

def get_highest_scoring_symptom(scores):
    """Identify the highest-scoring GAD-7 symptom"""
    gad7_symptoms = [
        "feeling nervous, anxious, or on edge",
        "uncontrollable worrying",
        "worrying about different things",
        "trouble relaxing",
        "restlessness",
        "being annoyed or irritable",
        "feeling afraid"
    ]
    
    # Find the highest score and corresponding symptom
    max_score = max(scores)
    highest_symptom_index = scores.index(max_score)
    highest_symptom = gad7_symptoms[highest_symptom_index]
    
    return highest_symptom, max_score

def stage3_personalized_response(collection, openai_client, journal_entry, gad7_scores, total_gad7_score):
    """Stage 3: Generate personalized response with CBT strategies"""
    print("\n" + "=" * 60)
    print("🎯 Stage 3: Personalized Mental Health Support")
    print("=" * 60)
    print("Creating your personalized mental health summary and recommendations...")
    
    # Get highest-scoring symptom
    highest_symptom, highest_score = get_highest_scoring_symptom(gad7_scores)
    
    print(f"🔍 Analyzing your responses...")
    print(f"📊 Your highest concern appears to be: {highest_symptom} (score: {highest_score})")
    
    # Query ChromaDB for the most relevant CBT tip for highest-scoring symptom
    print("🔍 Searching for targeted coping strategies...")
    try:
        cbt_results = collection.query(
            query_texts=[f"Strategy for {highest_symptom}"],
            n_results=1
        )
        
        relevant_cbt_tip = ""
        if cbt_results['documents'] and cbt_results['documents'][0]:
            doc_content = cbt_results['documents'][0][0]
            lines = doc_content.split('\n')
            
            # Find the specific strategy for this symptom
            for line in lines:
                if f"Strategy for {highest_symptom.split()[0]}" in line or f"**Strategy for {highest_symptom.split()[0]}" in line:
                    relevant_cbt_tip = line.strip()
                    break
            
            # If not found, look for any strategy line that might be relevant
            if not relevant_cbt_tip:
                for line in lines:
                    if "Strategy for" in line and any(word in line.lower() for word in highest_symptom.split()):
                        relevant_cbt_tip = line.strip()
                        break
            
            # If still not found, use the first strategy from the results
            if not relevant_cbt_tip and cbt_results['documents'][0]:
                for line in lines:
                    if line.strip().startswith("- **Strategy for"):
                        relevant_cbt_tip = line.strip()
                        break
        
        if not relevant_cbt_tip:
            relevant_cbt_tip = "- **General Strategy:** When feeling overwhelmed, try the 5-4-3-2-1 grounding technique. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste."
            
    except Exception as e:
        print(f"⚠️  Error retrieving CBT strategy: {e}")
        relevant_cbt_tip = "- **General Strategy:** When feeling overwhelmed, try the 5-4-3-2-1 grounding technique. Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste."
    
    print("🤖 Generating your personalized response...")
    
    # Create the complex prompt as specified
    final_prompt = f"""You are an empathetic mental health assistant. Based on the user's journal entry, their GAD-7 score, and their most difficult symptom, write a brief, supportive summary. Then, retrieve the single most relevant coping strategy from the knowledge base for their highest-scoring symptom and present it to them.

User's Journal Entry:
{journal_entry}

GAD-7 Total Score: {total_gad7_score} out of 21

Highest-Scoring Symptom: {highest_symptom} (score: {highest_score})

Most Relevant CBT Strategy from Knowledge Base:
{relevant_cbt_tip}

Please provide a warm, supportive response that:
1. Acknowledges what they shared in their journal
2. Validates their assessment results without being clinical
3. Presents the CBT strategy in an encouraging, actionable way
4. Offers hope and reminds them that these feelings are manageable

Keep your response compassionate, personal, and around 150-200 words."""

    try:
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a compassionate mental health support assistant. Be warm, empathetic, and supportive while providing practical guidance."},
                {"role": "user", "content": final_prompt}
            ],
            max_tokens=250,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # Display the personalized response
        print("\n" + "=" * 60)
        print("💝 Your Personalized Mental Health Summary")
        print("=" * 60)
        print(ai_response)
        
    except Exception as e:
        print(f"⚠️  Error generating personalized response: {e}")
        print("\n" + "=" * 60)
        print("💝 Your Personalized Mental Health Summary")
        print("=" * 60)
        print(f"Thank you for sharing your thoughts and taking the time for this assessment. ")
        print(f"Your concerns about {highest_symptom} are valid and manageable. ")
        print(f"Here's a strategy that might help: {relevant_cbt_tip}")
        print("Remember, you're taking positive steps by being mindful of your mental health.")
    
    # Supportive closing message
    print("\n" + "=" * 60)
    print("🌟 Final Words of Support")
    print("=" * 60)
    print("🌈 You've taken a brave and important step by checking in with your mental health today.")
    print("🌱 Remember that healing and growth are ongoing processes - be patient with yourself.")
    print("💪 You have the strength to work through these challenges, and support is available.")
    print("🔄 Consider making this check-in a regular part of your self-care routine.")
    print("📞 If you're struggling, don't hesitate to reach out to a mental health professional.")
    print("\n💙 Take care of yourself. You matter, and your wellbeing is important.")
    print("=" * 60)

def main():
    """Main function to run the mental health chatbot"""
    
    # Setup and initialization
    print("=" * 60)
    print("🧠 Mental Health Check-in Chatbot")
    print("=" * 60)
    
    # Step 1: Setup environment
    api_key = setup_environment()
    
    # Step 2: Initialize ChromaDB and get collection
    collection = initialize_chromadb()
    
    # Step 3: Initialize OpenAI client
    openai_client = initialize_openai_client(api_key)
    
    print("\n" + "=" * 60)
    print("🌟 Setup Complete!")
    print("=" * 60)
    
    # Stage 1: Journaling
    journal_entry = stage1_journaling()
    
    # Stage 2: GAD-7 Assessment
    gad7_scores, total_gad7_score = stage2_gad7_assessment(collection, openai_client)
    
    # Stage 3: Personalized Response with CBT Strategies
    stage3_personalized_response(collection, openai_client, journal_entry, gad7_scores, total_gad7_score)

if __name__ == "__main__":
    main() 