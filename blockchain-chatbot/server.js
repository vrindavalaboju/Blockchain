const express = require('express');
const cors = require('cors');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const uploadToPinata = require('./pinataUploader'); // ✅ NEW
// const { generateResponse, createResponseHash } = require('./llm-service');
const { generateResponse, createResponseHash } = require('./llama-service');

require('dotenv').config(); // Make sure to load your .env

// Load contract ABI
const contractABI = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'artifacts/contracts/AccessControl.sol/AccessControl.json')
  )
).abi;

// Contract address from deployment
const contractAddress = require('./contract-address.json').address;

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Ganache
const web3 = new Web3('http://localhost:8545');
const accessControlContract = new web3.eth.Contract(contractABI, contractAddress);

// Simple NLP filter function
function filterSensitiveContent(query) {
  const sensitiveKeywords = ['diagnosis', 'medication', 'patient', 'treatment', 'medical'];
  const containsSensitive = sensitiveKeywords.some(keyword => query.toLowerCase().includes(keyword));
  
  return {
    allowed: !containsSensitive,
    reason: containsSensitive ? 'Contains sensitive healthcare keywords' : 'No sensitive content detected'
  };
}

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Healthcare Blockchain Chatbot</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; }
          code { background-color: #f7f7f7; padding: 2px 5px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>Healthcare Blockchain Chatbot API</h1>
        <p>This is the API server for the HIPAA-compliant blockchain-protected healthcare chatbot.</p>
        <p>To interact with the chatbot, please:</p>
        <ol>
          <li>Open the <code>client.html</code> file in your browser</li>
          <li>Or make POST requests to <code>/api/query</code> with a JSON body containing a query field</li>
        </ol>
      </body>
    </html>
  `);
});

app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

// Chatbot API
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log('Received query:', query);

    // Step 1: NLP filter
    const filterResult = filterSensitiveContent(query);
    if (!filterResult.allowed) {
      return res.json({ 
        status: 'blocked',
        message: `Query blocked: ${filterResult.reason}`
      });
    }

    // Step 2: Blockchain validation
    const accounts = await web3.eth.getAccounts();
    try {
      const validateResult = await accessControlContract.methods.validateQuery(query)
        .send({ from: accounts[0], gas: 200000 });
      console.log('Blockchain validation result:', validateResult);

      // Step 3: LLM generation
      const llmResult = await generateResponse(query);
      const llmResponse = llmResult.text;
      let ipfsUrl = null;
      // Step 4: Upload to Pinata
      try {
        const logContent = `User query: ${query}\nResponse: ${llmResponse}`;
        const filePath = `./temp/log_${Date.now()}.txt`;

        if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
        fs.writeFileSync(filePath, logContent);

        const cid = await uploadToPinata(filePath);
        fs.unlinkSync(filePath);
        ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        console.log('Uploaded to IPFS via Pinata:', cid);


        // Optional: store CID on chain
        if (accessControlContract.methods.storeIPFSCID) {
          await accessControlContract.methods.storeIPFSCID(cid)
            .send({ from: accounts[0], gas: 200000 });
        }
      } catch (pinataErr) {
        console.error('Pinata upload failed:', pinataErr.message);
      }

      // Step 5: Log response on-chain (if implemented)
      try {
        await accessControlContract.methods.logQueryProcessing(query, llmResponse)
          .send({ from: accounts[0], gas: 200000 });
      } catch (logErr) {
        console.log('Logging to blockchain failed, continuing anyway:', logErr.message);
      }

      return res.json({
        status: 'approved',
        message: llmResponse,
        metadata: {
          responseHash: '...', // if you have this
          ipfsUrl: ipfsUrl      // 👈 This is key!
        }
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
