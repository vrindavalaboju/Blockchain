// setup-llama.js
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const LLAMA_DIR = path.join(__dirname, 'llama');
const MODEL_SIZE = '7B';
const MODEL_VARIANT = '7b-chat';
const OUTPUT_DIR = path.join(__dirname, 'llama-2-7b-chat-hf');

// Function to execute shell commands
function executeCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, { ...options, shell: true });
    
    let stdout = '';
    let stderr = '';
    
    process.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log(data.toString());
    });
    
    process.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error(data.toString());
    });
    
    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

async function setupLlama() {
  try {
    console.log('Setting up Llama 2...');
    
    // Step 1: Install required Python packages
    console.log('Installing Python dependencies...');
    await executeCommand('pip', ['install', 'transformers', 'accelerate', 'torch', 'protobuf']);
    
    // Step 2: Clone the Llama repository if not exists
    if (!fs.existsSync(LLAMA_DIR)) {
      console.log('Cloning Llama repository...');
      await executeCommand('git', ['clone', 'https://github.com/facebookresearch/llama', LLAMA_DIR]);
    }
    
    // Step 3: Ask for the pre-signed URL
    console.log('\nIMPORTANT: You need a pre-signed URL from Meta to download Llama 2.');
    console.log('Please visit https://ai.meta.com/resources/models-and-libraries/llama-downloads/');
    console.log('Accept the license, submit the form, and wait for the email with your URL.');
    console.log('\nOnce you have the URL, add it to your .env file as LLAMA_PRESIGNED_URL');
    
    if (!process.env.LLAMA_PRESIGNED_URL) {
      console.log('\nLLAMA_PRESIGNED_URL not found in .env file. Exiting.');
      return;
    }
    
    // Step 4: Run the download script
    console.log('\nRunning download script...');
    const downloadScriptPath = path.join(LLAMA_DIR, 'download.sh');
    await executeCommand('bash', [downloadScriptPath], { 
      cwd: LLAMA_DIR,
      env: {
        ...process.env,
        PRESIGNED_URL: process.env.LLAMA_PRESIGNED_URL
      }
    });
    
    // Step 5: Create link to the tokenizer
    console.log('Creating tokenizer link...');
    if (fs.existsSync(path.join(LLAMA_DIR, 'tokenizer.model')) && 
        fs.existsSync(path.join(LLAMA_DIR, `llama-2-${MODEL_VARIANT}`))) {
      await executeCommand('ln', ['-h', './tokenizer.model', `./llama-2-${MODEL_VARIANT}/tokenizer.model`], {
        cwd: LLAMA_DIR
      });
    }
    
    // Step 6: Convert weights to Hugging Face format
    console.log('Converting weights to Hugging Face format...');
    
    // Find the conversion script path
    const findConversionScript = 'python -c "import transformers;print(\'/\'.join(transformers.__file__.split(\'/\')[:-1])+\'/models/llama/convert_llama_weights_to_hf.py\')"';
    const conversionScriptPath = (await executeCommand(findConversionScript)).trim();
    
    await executeCommand('python', [
      conversionScriptPath,
      '--input_dir', path.join(LLAMA_DIR, `llama-2-${MODEL_VARIANT}`),
      '--model_size', MODEL_SIZE,
      '--output_dir', OUTPUT_DIR
    ]);
    
    console.log(`\nLlama 2 setup complete! Model is available at: ${OUTPUT_DIR}`);
    console.log('Add this path to your .env file as LLAMA_MODEL_DIR');
    
    // Update .env file
    if (fs.existsSync('.env')) {
      let envContent = fs.readFileSync('.env', 'utf8');
      if (!envContent.includes('LLAMA_MODEL_DIR')) {
        fs.appendFileSync('.env', `\nLLAMA_MODEL_DIR=${OUTPUT_DIR}\n`);
        console.log('Added LLAMA_MODEL_DIR to .env file.');
      }
    }
    
  } catch (error) {
    console.error('Error setting up Llama 2:', error);
  }
}

setupLlama();