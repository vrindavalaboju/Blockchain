## Healthcare Chatbot

A healthcare catered chatbot that utilizes blockchain tehcnology aimed to enhance user security and privacy. 

---

### Features

* NLP filter to block sensitive personal data (names, blood types, lab results)
* Chatbot query and response processing using a LLM (`llama-service`)
* Chatbot queries and responses stored securely via IPFS (Pinata)
* IPFS CIDs stored on-chain (Ethereum blockchain)
* Blockchain-backed query validation and logging via a smart contract
* Web application (`client.html`)

---

### Tech stack

* Node.js + Express
* NLP libraries: `natural`, `compromise`
* Web3.js (for Ethereum interaction)
* IPFS via Pinata
* Solidity Smart Contract (`AccessControl.sol`)
* Ganache (local blockchain)
* Hardhat (for smart contract deployment)
* LLM integration (custom `llama-service`)

---

### Technology Installation

1. **Clone repo**

   ```bash
   git clone https://github.com/vrindavalaboju/Blockchain.git
   ```

2. **Install dependencies**

   ```bash
   cd blockchain-chatbot
   npm install
   ```
   * if npm install does not work please install separately
   ```bash
   npm install express cors web3 dotenv natural compromise
   npm install axios form-data  
   npm install --save-dev hardhat
   npx hardhat
   npm install --save-dev @nomicfoundation/hardhat-toolbox
   ```
   * install globally
   ```bash
   npm install -g ganache
   ```



3. **Start Ganache** (in a separate terminal)
* depending on your installation run ganache in blockchain-chatbot directory or in directory above... whichever works for user.
   ```bash
   ganache
   ```

4. **Compile & deploy smart contracts**
 * After running ganache, choose one of the private keys and replace the accounts section with your own key
   ```bash
   npx hardhat compile
   npx hardhat run scripts/deploy.js --network development
   ```

5. **Create `.env` file**

   ```env
   PINATA_API_KEY=your_key
   PINATA_API_SECRET=your_secret
   ```
   * to get these please create a pinata account at: https://pinata.cloud
   * create an API key

6. **Start the server**

   ```bash
   node server.js
   ```

---

### Usage

* Open chatbot ui:

  ```
  http://localhost:3000/client
  ```
* Or use API directly:

  ```bash
  curl -X POST http://localhost:3000/api/query \
       -H "Content-Type: application/json" \
       -d '{"query":"What is diabetes?"}'
  ```

---

### Privacy Filtering Logic

Blocked if:

* Query contains a name ("My name is john")
* Mentions a blood type (A, B, AB)
* Includes numeric lab results ("Hemoglobin: 13.5")

Allowed:

* General symptom or diagnosis questions ("I have diabetes", "Why am I dizzy?")

---

### File Structure

```bash
.
├── client.html              # Frontend chatbot UI
├── server.js                # Main server logic
├── nlp-filter.js            # Custom NLP filter logic
├── llama-service.js         # Local LLM integration
├── pinataUploader.js        # Pinata IPFS upload
├── contracts/
│   └── AccessControl.sol    # Solidity contract
├── scripts/
│   └── deploy.js            # Hardhat deployment script
├── artifacts/               # Hardhat build output
├── contract-address.json    # Stores deployed contract address
```

