const natural = require('natural');
const nlp = require('compromise');

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Train the classifier with examples
function trainClassifier() {
  // Health-related examples (sensitive)
  classifier.addDocument('What medication should I take for headache?', 'sensitive');
  classifier.addDocument('I need a diagnosis for these symptoms', 'sensitive');
  classifier.addDocument('Show me my patient records', 'sensitive');
  classifier.addDocument('What treatment is recommended for diabetes?', 'sensitive');
  classifier.addDocument('Are there side effects for this medicine?', 'sensitive');
  classifier.addDocument('My doctor prescribed antibiotics', 'sensitive');
  classifier.addDocument('I have a medical condition', 'sensitive');
  classifier.addDocument('What does my blood test result mean?', 'sensitive');
  
  // Non-health examples (safe)
  classifier.addDocument('What is the weather today?', 'safe');
  classifier.addDocument('How do I cook pasta?', 'safe');
  classifier.addDocument('Tell me about the history of France', 'safe');
  classifier.addDocument('What time is it in Tokyo?', 'safe');
  classifier.addDocument('Recommend a good movie', 'safe');
  classifier.addDocument('How do I fix my wifi?', 'safe');
  classifier.addDocument('What are good vacation spots?', 'safe');
  
  // Train the classifier
  classifier.train();
}

// Initialize during module load
trainClassifier();

// Medical and sensitive healthcare terms dictionary
const medicalTerms = {
  conditions: ['diabetes', 'cancer', 'hypertension', 'asthma', 'arthritis', 'depression', 'anxiety'],
  medications: ['antibiotic', 'vaccine', 'insulin', 'opioid', 'painkiller', 'prescription'],
  procedures: ['surgery', 'operation', 'treatment', 'therapy', 'examination', 'scan', 'test'],
  roles: ['doctor', 'nurse', 'patient', 'physician', 'practitioner', 'specialist'],
  bodyParts: ['heart', 'lung', 'liver', 'kidney', 'brain', 'blood'],
  symptoms: ['pain', 'fever', 'cough', 'headache', 'nausea', 'fatigue', 'ache', 'dizziness'],
  general: ['medical', 'health', 'illness', 'disease', 'diagnosis', 'prognosis', 'hospital', 'clinic']
};

// Flatten the medical terms for easier checking
const allMedicalTerms = Object.values(medicalTerms).flat();

// Primary filter function
function filterSensitiveContent(query) {
  // 1. Basic keyword-based filtering
  const tokens = tokenizer.tokenize(query.toLowerCase());
  for (const token of tokens) {
    if (allMedicalTerms.includes(token)) {
      console.log(`Blocked due to medical term: ${token}`);
      return {
        allowed: false,
        reason: `Contains sensitive medical term: "${token}"`
      };
    }
  }
  
  // 2. Pattern recognition with compromise.js
  const doc = nlp(query);
  
  // Check for health-related patterns
  if (doc.has('(my|your|their|his|her) (health|condition|doctor)') || 
      doc.has('(I|you|they|he|she) (feel|feeling|felt) (sick|ill|pain)') ||
      doc.has('(take|taking|took) (medication|medicine|pill|drugs)')) {
    console.log('Blocked due to health-related pattern');
    return {
      allowed: false,
      reason: 'Contains health-related discussion patterns'
    };
  }
  
  // 3. Classification-based detection
  const classification = classifier.classify(query);
  if (classification === 'sensitive') {
    console.log('Blocked due to classifier determination');
    return {
      allowed: false,
      reason: 'Message classified as potentially containing sensitive health information'
    };
  }
  
  // If passes all filters, allow the query
  return {
    allowed: true,
    reason: 'No sensitive content detected'
  };
}

module.exports = {
  filterSensitiveContent
};

const { filterSensitiveContent } = require('./nlp-filter');

// In your query processing endpoint
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log('Received query:', query);
    
    // Step 1: Off-chain NLP filtering
    const filterResult = filterSensitiveContent(query);
    if (!filterResult.allowed) {
      return res.json({ 
        status: 'blocked',
        message: `Query blocked: ${filterResult.reason}`
      });
    }
    
    // Continue with blockchain validation and LLM processing
    // ...
  } catch (error) {
    // Error handling
  }
});