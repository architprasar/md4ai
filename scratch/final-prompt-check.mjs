import { TEST_CASES } from '../eval/test-cases.mjs';
import { getJsonSystemPromptForCase } from '../eval/json-prompts.mjs';
import { getPrompt } from '../src/prompt.js';

async function showPrompts() {
  const sampleCase = TEST_CASES[0]; // Revenue Dashboard
  
  console.log('============================================================');
  console.log(`TEST CASE: ${sampleCase.name}`);
  console.log('============================================================\n');

  console.log('--- [1] md4ai SYSTEM PROMPT (standard mode) ---');
  console.log(getPrompt({ 
    mode: 'standard', 
    includeBuiltins: sampleCase.topics 
  }));
  console.log('\n-----------------------------------------------\n');

  console.log('--- [2] JSON SYSTEM PROMPT (Baseline) ---');
  console.log(getJsonSystemPromptForCase(sampleCase));
  console.log('\n============================================================\n');
}

showPrompts();
