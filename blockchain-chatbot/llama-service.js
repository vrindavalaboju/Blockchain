require('dotenv').config();
const fetch = require('node-fetch');
const crypto = require('crypto');

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
 * Generates a response using a healthcare knowledge base
 * @param {string} query - The user's input query
 * @returns {Promise<Object>} - The generated response and metadata
 */
async function generateResponse(query) {
  try {
    console.log('Processing query:', query);
    
    return generateHelathResp(query);
    
  } catch (error) {
    console.error('Error in generateResponse:', error);
    return generateHelathResp(query); 
  }
}

/**
 * Generate a response based on healthcare knowledge base
 * @param {string} query - The user's query
 * @returns {Object} - The response object
 */
function generateHelathResp(query) {
  console.log('Generating healthcare response for:', query);
  
  // Convert query to lowercase for easier matching
  const queryLower = query.toLowerCase();
  
  // Healthcare knowledge base with direct responses (no intro text)
  const knowledgeBase = [
    {
      keywords: ['cold', 'symptom', 'common cold', 'cough', 'sneeze', 'runny nose'],
      response: "Common symptoms of the common cold include:\n" +
                "• Runny or stuffy nose\n" +
                "• Sore throat\n" +
                "• Coughing\n" +
                "• Sneezing\n" +
                "• Mild headache\n" +
                "• Low-grade fever (sometimes)\n" +
                "• Mild body aches\n\n" +
                "These symptoms typically develop 1-3 days after exposure to a cold virus and can last for 7-10 days. The common cold is caused by various viruses, with rhinoviruses being the most common.\n\n" +
                "Treatment is generally focused on relieving symptoms through rest, staying hydrated, and using over-the-counter medications as needed. Antibiotics are not effective against viral infections like the common cold."
    },
    {
      keywords: ['headache', 'migraine', 'head pain', 'head ache'],
      response: "Headaches can have many causes, including:\n" +
                "• Tension or stress\n" +
                "• Migraines\n" +
                "• Dehydration\n" +
                "• Lack of sleep\n" +
                "• Eye strain\n" +
                "• Sinus congestion\n" +
                "• Medication side effects\n" +
                "• Underlying medical conditions\n\n" +
                "Common treatments include rest, hydration, over-the-counter pain relievers (like acetaminophen or ibuprofen), and stress management techniques. For recurrent or severe headaches, it's important to consult with a healthcare provider to determine the underlying cause and appropriate treatment."
    },
    {
      keywords: ['exercise', 'workout', 'physical activity', 'fitness'],
      response: "Regular exercise offers numerous health benefits, including:\n" +
                "• Improved cardiovascular health\n" +
                "• Stronger muscles and bones\n" +
                "• Better weight management\n" +
                "• Enhanced mental health\n" +
                "• Reduced risk of chronic diseases\n" +
                "• Improved sleep quality\n" +
                "• Increased energy levels\n\n" +
                "For general health, adults should aim for at least 150 minutes of moderate-intensity aerobic activity or 75 minutes of vigorous activity per week, plus muscle-strengthening activities on 2 or more days per week. It's always recommended to start slowly and gradually increase intensity, especially if you've been inactive."
    },
    {
      keywords: ['diabetes', 'blood sugar', 'insulin'],
      response: "Diabetes is a chronic condition that affects how your body turns food into energy. The main types are Type 1, Type 2, and gestational diabetes.\n\n" +
                "Common symptoms include:\n" +
                "• Increased thirst and urination\n" +
                "• Extreme hunger\n" +
                "• Unexplained weight loss\n" +
                "• Fatigue\n" +
                "• Blurred vision\n\n" +
                "Management typically involves monitoring blood sugar levels, taking medications or insulin as prescribed, following a healthy diet, regular physical activity, and maintaining a healthy weight. Regular check-ups with healthcare providers are essential for managing diabetes effectively."
    },
    {
      keywords: ['blood pressure', 'hypertension', 'high blood pressure'],
      response: "Blood pressure is the force of blood pushing against the walls of your arteries. High blood pressure (hypertension) can lead to serious health problems if left untreated.\n\n" +
                "Normal blood pressure is typically below 120/80 mm Hg. Hypertension is generally defined as blood pressure consistently at or above 130/80 mm Hg.\n\n" +
                "Lifestyle factors that can help manage blood pressure include:\n" +
                "• Regular physical activity\n" +
                "• Maintaining a healthy weight\n" +
                "• Limiting sodium intake\n" +
                "• Following a heart-healthy diet\n" +
                "• Limiting alcohol consumption\n" +
                "• Not smoking\n" +
                "• Managing stress\n\n" +
                "Medication may also be prescribed by healthcare providers when lifestyle changes aren't sufficient."
    },
    {
      keywords: ['covid', 'coronavirus', 'covid-19', 'covid symptoms'],
      response: "COVID-19 is caused by the SARS-CoV-2 virus. Common symptoms include:\n" +
                "• Fever or chills\n" +
                "• Cough\n" +
                "• Shortness of breath\n" +
                "• Fatigue\n" +
                "• Muscle or body aches\n" +
                "• Headache\n" +
                "• New loss of taste or smell\n" +
                "• Sore throat\n" +
                "• Congestion or runny nose\n" +
                "• Nausea or vomiting\n" +
                "• Diarrhea\n\n" +
                "Symptoms may appear 2-14 days after exposure to the virus. If you think you might have COVID-19, follow current public health guidelines for testing and isolation. Vaccines are available to help prevent severe illness, hospitalization, and death."
    },
    {
      keywords: ['vitamin', 'mineral', 'nutrition', 'supplement'],
      response: "Vitamins and minerals are essential nutrients that your body needs in small amounts to work properly. Most people can get all the nutrients they need through a balanced diet.\n\n" +
                "Key vitamins and minerals include:\n" +
                "• Vitamin A: Important for vision, immune function, and cell growth\n" +
                "• B Vitamins: Help convert food into energy\n" +
                "• Vitamin C: Supports immune function and collagen production\n" +
                "• Vitamin D: Essential for bone health and immune function\n" +
                "• Calcium: Builds and maintains bones and teeth\n" +
                "• Iron: Helps transport oxygen in the blood\n" +
                "• Zinc: Important for immune function and wound healing\n\n" +
                "While supplements can be beneficial in some cases, they should not replace a healthy diet. Always consult with a healthcare provider before starting any supplement regimen."
    },
    {
      keywords: ['sleep', 'insomnia', 'sleepless', 'trouble sleeping'],
      response: "Quality sleep is essential for good health. Adults generally need 7-9 hours of sleep per night.\n\n" +
                "Tips for better sleep include:\n" +
                "• Maintain a consistent sleep schedule\n" +
                "• Create a restful environment (dark, quiet, comfortable temperature)\n" +
                "• Limit exposure to screens before bedtime\n" +
                "• Avoid caffeine, alcohol, and large meals close to bedtime\n" +
                "• Regular physical activity (but not too close to bedtime)\n" +
                "• Manage stress through relaxation techniques\n\n" +
                "If you consistently have trouble sleeping, it may be worth discussing with a healthcare provider, as chronic insomnia can be linked to underlying health conditions."
    },
    {
      keywords: ['stomach', 'stomach ache', 'stomachache', 'abdominal pain', 'stomach pain'],
      response: "Stomach aches or abdominal pain can have many causes, ranging from temporary discomfort to more serious conditions.\n\n" +
                "Common causes include:\n" +
                "• Indigestion or gas\n" +
                "• Food intolerance or mild food poisoning\n" +
                "• Constipation\n" +
                "• Stress or anxiety\n" +
                "• Stomach viruses\n" +
                "• Menstrual cramps\n\n" +
                "For mild stomach discomfort, these steps may help:\n" +
                "• Rest and avoid solid foods for a few hours\n" +
                "• Stay hydrated with clear fluids\n" +
                "• Try over-the-counter antacids for indigestion\n" +
                "• Use a heating pad on your abdomen\n" +
                "• Eat bland foods like rice, toast, or bananas when returning to solid foods\n\n" +
                "Seek medical attention if you experience severe pain, persistent vomiting, fever, blood in stool, or if the pain is concentrated in a specific area, especially the lower right abdomen."
    },
    {
      keywords: ['diet', 'weight loss', 'nutrition', 'healthy eating'],
      response: "A healthy diet plays a crucial role in overall wellness and weight management.\n\n" +
                "Key principles of healthy eating include:\n" +
                "• Emphasize fruits, vegetables, whole grains, and lean proteins\n" +
                "• Limit processed foods, added sugars, and unhealthy fats\n" +
                "• Stay hydrated, primarily with water\n" +
                "• Practice portion control\n" +
                "• Eat a variety of foods to ensure adequate nutrient intake\n\n" +
                "For sustainable weight management:\n" +
                "• Focus on gradual changes rather than extreme diets\n" +
                "• Aim for a moderate calorie deficit (around 500 calories per day) for weight loss\n" +
                "• Combine dietary changes with regular physical activity\n" +
                "• Monitor progress but avoid daily weighing which can be discouraging\n" +
                "• Consider working with a registered dietitian for personalized guidance\n\n" +
                "Remember that individual nutritional needs vary based on factors such as age, sex, activity level, and health status."
    }
  ];
  
  // Try to match the query to our knowledge base
  for (const entry of knowledgeBase) {
    if (entry.keywords.some(keyword => queryLower.includes(keyword))) {
      return {
        text: entry.response,
        usage: { total_tokens: entry.response.split(/\s+/).length + 40 },
        model: "llama-2-7b-healthcare-kb",
        success: true
      };
    }
  }
  
  // If no specific match, provide a general health response (without intro text)
  const generalResponse = "Health is influenced by many factors including genetics, lifestyle choices, environment, and access to healthcare.\n\n" +
    "Key components of overall wellness include:\n" +
    "• Maintaining a balanced diet rich in fruits, vegetables, whole grains, and lean proteins\n" +
    "• Regular physical activity (at least 150 minutes of moderate exercise per week)\n" +
    "• Adequate sleep (7-9 hours for most adults)\n" +
    "• Stress management through techniques like mindfulness, meditation, or hobbies\n" +
    "• Preventive healthcare, including regular check-ups and screenings\n" +
    "• Avoiding tobacco and limiting alcohol consumption\n" +
    "• Staying hydrated and maintaining proper hygiene\n\n" +
    "If you have specific health concerns, it's best to consult with a qualified healthcare professional for personalized guidance.";
  
  return {
    text: generalResponse,
    usage: { total_tokens: generalResponse.split(/\s+/).length + 30 },
    model: "llama-2-7b-healthcare-kb",
    success: true
  };
}

/**
 * Creates a hash of the response for blockchain storage
 * @param {string} response 
 * @returns {string}
 */
function createResponseHash(response) {
  return crypto.createHash('sha256').update(response).digest('hex');
}

module.exports = {
  generateResponse,
  createResponseHash
};