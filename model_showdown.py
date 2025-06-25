import os
from openai import OpenAI
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv('EXACTLY.env')

# Set up OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def run_model_showdown():
    """
    Run a showdown between different OpenAI models using various prompts.
    Save all responses to a text file with clear labeling.
    """
    
    # Define the models to test
    models = [
        "gpt-3.5-turbo",
        "gpt-4",
        "gpt-4-turbo-preview"
    ]
    
    # Define the prompts to test
    prompts = [
        "Write a haiku about artificial intelligence.",
        "Explain quantum computing in simple terms.",
        "What would be the best pizza topping combination and why?",
        "Write a short story about a robot learning to paint.",
        "What's the most underrated invention of the 20th century?"
    ]
    
    # Create results file
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    with open('model_showdown_results.txt', 'w', encoding='utf-8') as f:
        f.write(f"OpenAI Model Showdown Results\n")
        f.write(f"Generated on: {timestamp}\n")
        f.write("=" * 50 + "\n\n")
        
        # Loop through each model
        for model in models:
            f.write(f"MODEL: {model}\n")
            f.write("-" * 30 + "\n\n")
            
            # Loop through each prompt
            for i, prompt in enumerate(prompts, 1):
                f.write(f"PROMPT {i}: {prompt}\n")
                f.write("-" * 20 + "\n")
                
                try:
                    # Send request to OpenAI API using new format
                    response = client.chat.completions.create(
                        model=model,
                        messages=[
                            {"role": "user", "content": prompt}
                        ],
                        max_tokens=500,
                        temperature=0.7
                    )
                    
                    # Extract the response content
                    response_content = response.choices[0].message.content
                    
                    # Write the response to file
                    f.write(f"RESPONSE:\n{response_content}\n")
                    
                    # Add some metadata
                    f.write(f"\nTokens used: {response.usage.total_tokens}\n")
                    f.write(f"Model: {response.model}\n")
                    
                except Exception as e:
                    f.write(f"ERROR: {str(e)}\n")
                
                f.write("\n" + "=" * 40 + "\n\n")
            
            f.write("\n" + "=" * 50 + "\n\n")
    
    print(f"Model showdown completed! Results saved to 'model_showdown_results.txt'")
    print(f"Tested {len(models)} models with {len(prompts)} prompts each.")

if __name__ == "__main__":
    # Check if API key is available
    if not os.getenv('OPENAI_API_KEY'):
        print("Error: OPENAI_API_KEY not found in environment variables.")
        print("Please make sure your .env file contains the API key.")
    else:
        run_model_showdown() 