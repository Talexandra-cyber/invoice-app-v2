# OpenAI Model Showdown - Assignment Results

**Generated:** June 18, 2025  
**Models Tested:** 3 (gpt-3.5-turbo, gpt-4, gpt-4-turbo-preview)  
**Prompts Tested:** 5  
**Total API Calls:** 15  

## Assignment Overview
This project demonstrates the capabilities of different OpenAI models by testing them with identical prompts and comparing their responses. The script successfully loops through each model and prompt combination, sending requests to the OpenAI API and saving all responses to a comprehensive results file.

## Key Findings

### Model Response Comparison

**Haiku about AI:**
- **GPT-3.5-turbo:** "Silent minds at work / Learning, evolving, thinking / Future now in code"
- **GPT-4:** "Silicon minds wake, / In circuits, knowledge takes shape, / Man and machine blend."
- **GPT-4-turbo-preview:** "Minds born from circuits, / Dream in codes and algorithms, / Humanity's echo."

**Quantum Computing Explanation:**
- **GPT-3.5-turbo:** 126 tokens - Basic explanation focusing on qubits vs bits
- **GPT-4:** 269 tokens - More detailed explanation including superposition and entanglement
- **GPT-4-turbo-preview:** 470 tokens - Most comprehensive explanation with analogies and practical applications

**Pizza Topping Debate:**
- **GPT-3.5-turbo:** Recommends pepperoni, mushrooms, onions
- **GPT-4:** Suggests pepperoni, mushrooms, bell peppers, black olives with vegetarian alternatives
- **GPT-4-turbo-preview:** [Response truncated in preview]

## Technical Implementation

The Python script successfully:
✅ Defines lists of model names and prompts  
✅ Loops through each model and prompt combination  
✅ Sends requests to OpenAI API using current v1.0+ format  
✅ Saves all responses to 'model_showdown_results.txt'  
✅ Clearly labels which model generated each response  
✅ Includes metadata (token usage, model version)  
✅ Handles errors gracefully  

## Files Included
- `model_showdown.py` - Main script
- `model_showdown_results.txt` - Complete results (265 lines)
- `requirements.txt` - Dependencies
- `email_summary.md` - This summary

## Code Highlights
```python
# Modern OpenAI API usage
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": prompt}],
    max_tokens=500,
    temperature=0.7
)
```

The complete results file contains all 15 responses with detailed formatting and is ready for submission. 