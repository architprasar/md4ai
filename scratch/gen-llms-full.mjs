import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const DOCS_DIR = './docs';
const OUTPUT = './examples/demo/public/llms-full.txt';

function generateFullDocs() {
  let content = '# md4ai Full Documentation\n\n';
  
  // 1. Add README
  content += '## Overview\n\n' + readFileSync('./README.md', 'utf-8') + '\n\n';
  
  // 2. Add all docs
  const files = readdirSync(DOCS_DIR).filter(f => f.endsWith('.md'));
  for (const file of files) {
    content += `## ${file.replace('.md', '')}\n\n`;
    content += readFileSync(join(DOCS_DIR, file), 'utf-8') + '\n\n';
  }
  
  writeFileSync(OUTPUT, content);
  console.log('Generated examples/demo/public/llms-full.txt');
}

generateFullDocs();
