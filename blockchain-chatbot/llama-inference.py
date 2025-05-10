import sys
import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Check line arguments
if len(sys.argv) < 2:
    print("Usage: python llama_inference.py \"your prompt here\"")
    sys.exit(1)

# Get the input data
input_data = sys.argv[1]

try:
    # Parse the input JSON
    data = json.loads(input_data)
    system_prompt = data.get("system_prompt", "")
    user_query = data.get("query", "")
    
    # Format the prompt for Llama 2 chat models
    formatted_prompt = f"<s>[INST] <<SYS>>\n{system_prompt}\n<</SYS>>\n\n{user_query} [/INST]"
    
    # Load the model and tokenizer
    model_id = "meta-llama/Llama-2-7b-chat-hf"
    print(f"Loading model: {model_id}...", file=sys.stderr)
    
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        torch_dtype=torch.float16,
        device_map="auto",
        load_in_8bit=True  # Reduce memory usage
    )
    
    print("Model loaded successfully. Generating response...", file=sys.stderr)
    
    # Tokenize input
    inputs = tokenizer(formatted_prompt, return_tensors="pt").to(model.device)
    
    # Generate response
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_new_tokens=500,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            top_k=10
        )
    
    # Decode
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    if response.startswith(formatted_prompt):
        response = response[len(formatted_prompt):].strip()
    
    print(response)
    
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)