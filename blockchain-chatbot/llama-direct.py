import sys
import os
import json
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# Check if we have the prompt input
if len(sys.argv) < 2:
    print("Usage: python llama_direct.py \"your prompt here\"")
    sys.exit(1)

# Get the prompt from command line argument
input_data = sys.argv[1]

try:
    # Parse the input JSON
    data = json.loads(input_data)
    system_prompt = data.get("system_prompt", "")
    user_query = data.get("query", "")
    
    # Load tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf")
    model = AutoModelForCausalLM.from_pretrained(
        "meta-llama/Llama-2-7b-chat-hf",
        torch_dtype=torch.float16,
        device_map="auto",
        load_in_8bit=True  # Use 8-bit quantization to reduce memory usage
    )
    
    # Format prompt for Llama 2 chat models
    prompt = f"<s>[INST] <<SYS>>\n{system_prompt}\n<</SYS>>\n\n{user_query} [/INST]"
    
    # Tokenize the prompt
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    # Generate
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_new_tokens=500,
            do_sample=True, 
            temperature=0.7,
            top_p=0.9,
            top_k=10,
        )
    
    # Decode the response
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Remove the prompt part to get only the model's reply
    if response.startswith(prompt):
        response = response[len(prompt):].strip()
    
    print(response)
    
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)