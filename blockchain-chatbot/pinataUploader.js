// pinataUploader.js
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

async function uploadToPinata(filePath) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const headers = {
    ...form.getHeaders(),
    pinata_api_key: process.env.PINATA_API_KEY,
    pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY
  };

  try {
    const response = await axios.post(url, form, {
      maxBodyLength: Infinity,
      headers
    });

    return response.data.IpfsHash;
  } catch (err) {
    console.error('Pinata upload failed:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = uploadToPinata;
