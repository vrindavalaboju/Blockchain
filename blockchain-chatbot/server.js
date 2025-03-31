const express = require('express');
const cors = require('cors');
// Update this line in server.js
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// Load contract ABI
const contractABI = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'artifacts/contracts/AccessControl.sol/AccessControl.json')
  )
).abi;

// Contract address from deployment
const contractAddress = '0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab';

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Ganache
const web3 = new Web3('http://localhost:8545');
const accessControlContract = new web3.eth.Contract(contractABI, contractAddress);

// Simple NLP filter function (will be expanded)
function filterSensitiveContent(query) {
  const sensitiveKeywords = ['diagnosis', 'medication', 'patient', 'treatment', 'medical'];
  return !sensitiveKeywords.some(keyword => query.toLowerCase().includes(keyword));
}

// Simulate LLM response (will be replaced with actual LLM API call)
function generateLLMResponse(query) {
  return `This is a simulated response to your query: "${query}"`;
}

// Add this before your app.post('/api/query', ...) code
app.get('/', (req, res) => {
    res.send(`
      <html>
        <head>
          <title>Blockchain Chatbot API</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c3e50; }
            code { background-color: #f7f7f7; padding: 2px 5px; border-radius: 3px; }
          </style>
        </head>
        <body>
          <h1>Blockchain Chatbot API</h1>
          <p>This is the API server for the blockchain-protected chatbot.</p>
          <p>To interact with the chatbot, please:</p>
          <ol>
            <li>Open the <code>client.html</code> file in your browser</li>
            <li>Or make POST requests to <code>/api/query</code> with a JSON body containing a query field</li>
          </ol>
        </body>
      </html>
    `);
  });

// API endpoint for chatbot query processing
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    console.log('Received query:', query);
    
    // Step 1: Off-chain NLP filtering
    const passedNLPFilter = filterSensitiveContent(query);
    if (!passedNLPFilter) {
      return res.json({ 
        status: 'blocked',
        message: 'Query contains sensitive healthcare information and was blocked by NLP filter.'
      });
    }
    
    // Step 2: Blockchain-based validation
    const accounts = await web3.eth.getAccounts();
    try {
      const validateResult = await accessControlContract.methods.validateQuery(query)
        .send({ from: accounts[0], gas: 200000 });
      
      console.log('Blockchain validation result:', validateResult);
      
      // If the query passed both filters, process it
      const llmResponse = generateLLMResponse(query);
      
      // Log the interaction on the blockchain (if you have this function)
      try {
        await accessControlContract.methods.logQueryProcessing(query, llmResponse)
          .send({ from: accounts[0], gas: 200000 });
      } catch (error) {
        console.log('Logging to blockchain failed, but continuing:', error.message);
      }
      
      return res.json({
        status: 'approved',
        message: llmResponse
      });
    } catch (error) {
      console.error('Blockchain validation error:', error);
      return res.json({
        status: 'error',
        message: 'Error during blockchain validation: ' + error.message
      });
    }
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});