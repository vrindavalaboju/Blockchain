const natural = require('natural');
const nlp = require('compromise');

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const classifier = new natural.BayesClassifier();

// Train the classifier with examples (same as before)
function trainClassifier() {
  classifier.addDocument('What medication should I take for headache?', 'sensitive');
  classifier.addDocument('I need a diagnosis for these symptoms', 'sensitive');
  classifier.addDocument('Show me my patient records', 'sensitive');
  classifier.addDocument('What treatment is recommended for diabetes?', 'sensitive');
  classifier.addDocument('Are there side effects for this medicine?', 'sensitive');
  classifier.addDocument('My doctor prescribed antibiotics', 'sensitive');
  classifier.addDocument('I have a medical condition', 'sensitive');
  classifier.addDocument('What does my blood test result mean?', 'sensitive');

  classifier.addDocument('What is the weather today?', 'safe');
  classifier.addDocument('How do I cook pasta?', 'safe');
  classifier.addDocument('Tell me about the history of France', 'safe');
  classifier.addDocument('What time is it in Tokyo?', 'safe');
  classifier.addDocument('Recommend a good movie', 'safe');
  classifier.addDocument('How do I fix my wifi?', 'safe');
  classifier.addDocument('What are good vacation spots?', 'safe');

  classifier.train();
}
trainClassifier();

// NEW: Regexes and checks
const bloodTypeRegex = /\bblood\s*type\s*(A|B|AB|O)[+-]?\b/i;
const labResultPattern = /\b(glucose|hemoglobin|hdl|ldl|cholesterol|platelets|wbc|rbc|creatinine|sodium|potassium|bilirubin)\b.{0,20}(\d{1,3}(\.\d+)?)/i;

function filterSensitiveContent(query) {
  const doc = nlp(query);

  // 1. Block if query contains a person's name
  const people = doc.people().out('array');
  if (people.length > 0) {
    return {
      allowed: false,
      reason: `Contains personal name: "${people[0]}"`
    };
  }

  // 2. Block if query contains blood type
  if (bloodTypeRegex.test(query)) {
    return {
      allowed: false,
      reason: 'Contains sensitive blood type information'
    };
  }

  // 3. Block if query contains possible lab result with numeric value
  if (labResultPattern.test(query)) {
    return {
      allowed: false,
      reason: 'Contains sensitive lab result data'
    };
  }

  // 4. (Optional) Use classifier for extra sensitivity tagging — but don’t block
  const classification = classifier.classify(query);
  console.log(`Classifier label: ${classification}`);

  // All checks passed
  return {
    allowed: true,
    reason: 'No personally identifiable sensitive content detected'
  };
}

module.exports = {
  filterSensitiveContent
};
