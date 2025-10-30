import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🔍 Testing Gemini API Key...');
console.log(`API Key: ${apiKey.substring(0, 10)}...`);

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    console.log('\n📋 Attempting to list available models...\n');
    
    // Try with v1 API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Available models (v1 API):');
      if (data.models) {
        data.models.forEach((model: any) => {
          if (model.supportedGenerationMethods?.includes('generateContent')) {
            console.log(`  - ${model.name} (${model.displayName})`);
          }
        });
      }
    } else {
      console.log('❌ v1 API failed:', await response.text());
    }

    // Try with v1beta API
    const responseBeta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (responseBeta.ok) {
      const dataBeta = await responseBeta.json();
      console.log('\n✅ Available models (v1beta API):');
      if (dataBeta.models) {
        dataBeta.models.forEach((model: any) => {
          if (model.supportedGenerationMethods?.includes('generateContent')) {
            console.log(`  - ${model.name} (${model.displayName})`);
          }
        });
      }
    } else {
      console.log('❌ v1beta API failed:', await responseBeta.text());
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

async function testSimpleGeneration() {
  console.log('\n🧪 Testing with models/gemini-1.5-flash...\n');
  
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' });
    const result = await model.generateContent('Say hello in one word');
    const response = await result.response;
    const text = response.text();
    console.log(`✅ Success! Response: ${text}`);
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`);
  }
}

async function run() {
  await listModels();
  await testSimpleGeneration();
}

run().catch(console.error);
