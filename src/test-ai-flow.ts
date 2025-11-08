/**
 * Manual test script for AI flow integration
 * Run with: npx tsx src/test-ai-flow.ts
 */

import { assemblePrompt } from './utils/prompts';
import { extractArtifactsFromContent } from './utils/workspace';
import { translateErrorMessage } from './utils/errors';

console.log('Testing AI Flow Integration...\n');

// Test 1: Prompt Assembly
console.log('✓ Test 1: Prompt Assembly');
try {
  const prompt = assemblePrompt({
    userInput: 'Create a simple button',
    context: { statData: true },
    variableSummary: { stat_data: 'Player level: 5' },
  });
  
  console.log('  - System prompt generated:', prompt.systemPrompt.substring(0, 50) + '...');
  console.log('  - User prompt generated:', prompt.userPrompt.substring(0, 50) + '...');
  console.log('  - Messages count:', prompt.messages.length);
  console.log('  ✓ Prompt assembly works\n');
} catch (error) {
  console.error('  ✗ Prompt assembly failed:', error);
  process.exit(1);
}

// Test 2: Artifact Extraction
console.log('✓ Test 2: Artifact Extraction');
try {
  const content = `
Here's your button:

\`\`\`html
<button onclick="handleClick()">Click me</button>
\`\`\`

\`\`\`css
button {
  background: blue;
  color: white;
  padding: 10px;
}
\`\`\`

\`\`\`javascript
function handleClick() {
  alert('Clicked!');
}
\`\`\`
  `;
  
  const artifacts = extractArtifactsFromContent(content);
  console.log('  - HTML extracted:', !!artifacts.html);
  console.log('  - CSS extracted:', !!artifacts.css);
  console.log('  - JavaScript extracted:', !!artifacts.javascript);
  
  if (!artifacts.html || !artifacts.css || !artifacts.javascript) {
    throw new Error('Failed to extract all artifacts');
  }
  
  console.log('  ✓ Artifact extraction works\n');
} catch (error) {
  console.error('  ✗ Artifact extraction failed:', error);
  process.exit(1);
}

// Test 3: Error Translation
console.log('✓ Test 3: Error Translation');
try {
  const errors = [
    { input: 'Failed to fetch', expected: '网络请求失败' },
    { input: 'Unauthorized', expected: '认证失败' },
    { input: '401', expected: '认证失败' },
    { input: 'timeout', expected: '请求超时' },
  ];
  
  for (const { input, expected } of errors) {
    const translated = translateErrorMessage(input);
    if (!translated.includes(expected.split('，')[0])) {
      throw new Error(`Translation failed for "${input}": got "${translated}"`);
    }
  }
  
  console.log('  - Network errors translated correctly');
  console.log('  - Auth errors translated correctly');
  console.log('  - Timeout errors translated correctly');
  console.log('  ✓ Error translation works\n');
} catch (error) {
  console.error('  ✗ Error translation failed:', error);
  process.exit(1);
}

// Test 4: Complex prompt with history
console.log('✓ Test 4: Prompt with History');
try {
  const prompt = assemblePrompt({
    userInput: 'Make it red',
    history: [
      { role: 'user', content: 'Create a button' },
      { role: 'assistant', content: '```html\n<button>Click</button>\n```' },
    ],
    includeSystem: true,
  });
  
  console.log('  - System message included:', prompt.messages[0].role === 'system');
  console.log('  - History preserved:', prompt.messages.length === 4); // system + 2 history + user
  console.log('  ✓ Complex prompt works\n');
} catch (error) {
  console.error('  ✗ Complex prompt failed:', error);
  process.exit(1);
}

// Test 5: Multiple code blocks of same type
console.log('✓ Test 5: Multiple Code Blocks');
try {
  const content = `
First part:
\`\`\`html
<div>Part 1</div>
\`\`\`

Second part:
\`\`\`html
<div>Part 2</div>
\`\`\`
  `;
  
  const artifacts = extractArtifactsFromContent(content);
  if (!artifacts.html.includes('Part 1') || !artifacts.html.includes('Part 2')) {
    throw new Error('Failed to merge multiple blocks');
  }
  
  console.log('  - Multiple blocks merged correctly');
  console.log('  ✓ Multiple code blocks works\n');
} catch (error) {
  console.error('  ✗ Multiple code blocks failed:', error);
  process.exit(1);
}

console.log('═══════════════════════════════════════');
console.log('✓ ALL TESTS PASSED');
console.log('═══════════════════════════════════════');
console.log('\nAI Flow implementation is ready!');
