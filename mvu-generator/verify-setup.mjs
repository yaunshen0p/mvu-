// Simple verification script
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const checkFile = (filePath) => {
  try {
    const content = readFileSync(filePath, 'utf8')
    return { exists: true, content }
  } catch (error) {
    return { exists: false, error: error.message }
  }
}

console.log('=== Vue 3 + Vite Scaffold Verification ===\n')

// Check key files
const filesToCheck = [
  'src/main.ts',
  'src/App.vue', 
  'src/components/Layout.vue',
  'src/components/MonacoEditor.vue',
  'src/stores/app.ts',
  'vite.config.js',
  'package.json',
  'tsconfig.json'
]

filesToCheck.forEach(file => {
  const result = checkFile(join(__dirname, file))
  console.log(`${result.exists ? '✓' : '✗'} ${file}`)
  if (!result.exists) {
    console.log(`  Error: ${result.error}`)
  }
})

// Check package.json for Vue dependencies
try {
  const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'))
  const vueDeps = ['vue', 'pinia', '@monaco-editor/loader', '@vueuse/core']
  const hasAllVueDeps = vueDeps.every(dep => packageJson.dependencies[dep])
  console.log(`\n${hasAllVueDeps ? '✓' : '✗'} Vue dependencies present`)
  
  const reactDeps = ['react', 'react-dom', '@monaco-editor/react']
  const hasReactDeps = reactDeps.some(dep => packageJson.dependencies[dep])
  console.log(`${!hasReactDeps ? '✓' : '✗'} React dependencies removed`)
} catch (error) {
  console.log(`✗ Error checking package.json: ${error.message}`)
}

console.log('\n=== Verification Complete ===')