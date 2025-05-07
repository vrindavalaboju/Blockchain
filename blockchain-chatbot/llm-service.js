require('dotenv').config();
const fetch = require('node-fetch');

// Add your Hugging Face token here
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;
 // Replace with your actual token


// System prompt for healthcare chatbot
const SYSTEM_PROMPT = `
You are an AI assistant integrated with a privacy-focused blockchain system designed for healthcare.
You can provide general medical information with the following privacy safeguards:

1. You MAY provide general medical information, educational content about conditions, and standard treatment approaches
2. You MAY discuss medications and their general effects based on publicly available information
3. You MAY explain medical concepts and procedures in an educational context

However, to maintain HIPAA compliance:
1. You must NEVER store or repeat any Personal Health Information (PHI) shared by users
2. You must NEVER connect previous conversations with current ones (each interaction is isolated)
3. You must NEVER pretend to be a licensed healthcare professional
4. Always include a disclaimer that you're providing general information, not personalized medical advice
5. Remind users to consult healthcare professionals for specific medical concerns

The blockchain system ensures your responses are privacy-preserving while still being helpful.
`;

/**
 * Generates a response using Hugging Face's inference API
 * @param {string} query - The user's input query
 * @returns {Promise<Object>} - The generated response and metadata
 */
async function generateResponse(query) {
  try {
    console.log('Processing query with Hugging Face API:', query);
    
    // Try a different model that's more likely to be accessible
    const model = "gpt2"; // Simple but reliable model
    const apiUrl = `https://api-inference.huggingface.co/models/${model}`;
    
    console.log(`Calling Hugging Face API at: ${apiUrl}`);
    
    // Use Hugging Face's inference API with authentication
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${HF_TOKEN}`
      },
      body: JSON.stringify({
        inputs: SYSTEM_PROMPT + "\n\nUser Query: " + query
      })
    });

    // Log detailed response information for debugging
    console.log(`API Response Status: ${response.status} ${response.statusText}`);

    // If there's an error, get the full error message
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API returned ${response.status}: ${response.statusText}. Details: ${errorText}`);
    }

    // Parse the successful response
    const result = await response.json();
    console.log("API Response:", JSON.stringify(result).substring(0, 100) + "...");
    
    // Format the result based on the model's response structure
    let responseText;
    if (Array.isArray(result) && result.length > 0) {
      responseText = result[0].generated_text;
    } else if (typeof result === 'object' && result.generated_text) {
      responseText = result.generated_text;
    } else {
      responseText = typeof result === 'string' ? result : JSON.stringify(result);
    }

    // Add healthcare disclaimer
    responseText += "\n\nRemember: This is general information only and not a substitute for professional medical advice. Please consult a healthcare provider for personalized recommendations.";
    
    return {
      text: responseText,
      usage: { total_tokens: responseText.length },
      model: model,
      success: true
    };
  } catch (error) {
    console.error('Error calling Hugging Face API:', error);
    throw error; // Re-throw the error for proper handling in the server
  }
}

/**
 * Creates a hash of the response for blockchain storage
 * @param {string} response - The full response text
 * @returns {string} - A hash representation of the response
 */
function createResponseHash(response) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(response).digest('hex');
}

module.exports = {
  generateResponse,
  createResponseHash
};