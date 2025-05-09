const express = require('express');
const cors = require('cors');
const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
const uploadToPinata = require('./pinataUploader');
const { generateResponse, createResponseHash } = require('./llama-service');
const { filterSensitiveContent } = require('./nlp-filter'); // ✅ Use real NLP filter
require('dotenv').config();

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

// Default route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Healthcare Blockchain Chatbot</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h1>Healthcare Blockchain Chatbot API</h1>
        <p>This is the API server for the HIPAA-compliant blockchain-protected healthcare chatbot.</p>
        <p>Use <code>/client</code> or POST to <code>/api/query</code> with a JSON query.</p>
      </body>
    </html>
  `);
});

// Serve client UI
app.get('/client', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});

// Chatbot API route
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
    const sender = accounts[0];
    try {
      const validateResult = await accessControlContract.methods.validateQuery(query)
        .send({ from: sender, gas: 200000 });
      console.log('Blockchain validation result:', validateResult);
    } catch (error) {
      console.error('Blockchain validation error:', error);
      return res.json({
        status: 'error',
        message: 'Error during blockchain validation: ' + error.message
      });
    }

    // Step 3: LLM response generation
    const llmResult = await generateResponse(query);
    const llmResponse = llmResult.text;
    let ipfsUrl = null;

    // Step 4: Upload log to IPFS via Pinata
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
          .send({ from: sender, gas: 200000 });
      }
    } catch (pinataErr) {
      console.error('Pinata upload failed:', pinataErr.message);
    }

    // Step 5: Log query and response on-chain
    // try {
    //   await accessControlContract.methods.logQueryProcessing(query, llmResponse)
    //     .send({ from: sender, gas: 200000 });
    // } catch (logErr) {
    //   console.warn('Blockchain log skipped:', logErr.message);
    // }

    // Final response to client
    return res.json({
      status: 'approved',
      message: llmResponse,
      metadata: {
        responseHash: '...', // Optional hash logic
        ipfsUrl
      }
    });
  } catch (error) {
    console.error('Unhandled server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
