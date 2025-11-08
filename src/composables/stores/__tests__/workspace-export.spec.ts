import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWorkspaceStore } from '../workspace'

describe('Workspace Store - Export Functions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('generateExports', () => {
    it('should generate exports with all artifacts', () => {
      const store = useWorkspaceStore()
      
      store.updateArtifacts({
        html: '<div>Hello</div>',
        css: 'body { color: red; }',
        javascript: 'console.log("test");',
        yaml: 'key: value',
        script: 'const x = 1;',
        regex: '/test/gi',
      })

      const exports = store.generateExports()
      
      expect(exports.html).toBe('<div>Hello</div>')
      expect(exports.css).toBe('body { color: red; }')
      expect(exports.javascript).toBe('console.log("test");')
      expect(exports.yaml).toBe('key: value')
      expect(exports.script).toBe('const x = 1;')
      expect(exports.regex).toBe('/test/gi')
    })

    it('should return empty strings for missing artifacts', () => {
      const store = useWorkspaceStore()
      
      store.updateArtifacts({
        html: '<div>Test</div>',
      })

      const exports = store.generateExports()
      
      expect(exports.html).toBe('<div>Test</div>')
      expect(exports.css).toBe('')
      expect(exports.javascript).toBe('')
      expect(exports.yaml).toBe('')
      expect(exports.script).toBe('')
      expect(exports.regex).toBe('')
    })
  })

  describe('buildExportPayload', () => {
    it('should build export payload with metadata', () => {
      const store = useWorkspaceStore()
      
      store.updateArtifacts({
        html: '<div>Test</div>',
        css: 'body { margin: 0; }',
      })

      const payload = store.buildExportPayload({
        templateName: 'test-template',
        source: 'ai',
        messageId: 'msg-123',
      })

      expect(payload.exportedAt).toBeDefined()
      expect(payload.workspace.templateName).toBe('test-template')
      expect(payload.workspace.source).toBe('ai')
      expect(payload.workspace.messageId).toBe('msg-123')
      expect(payload.artifacts.html).toBe('<div>Test</div>')
      expect(payload.artifacts.css).toBe('body { margin: 0; }')
    })

    it('should use default values when metadata not provided', () => {
      const store = useWorkspaceStore()
      
      const payload = store.buildExportPayload()

      expect(payload.exportedAt).toBeDefined()
      expect(payload.workspace.templateName).toBeNull()
      expect(payload.workspace.source).toBe('manual')
      expect(payload.workspace.messageId).toBeNull()
    })

    it('should include timestamp in export', () => {
      const store = useWorkspaceStore()
      const beforeTime = new Date().toISOString()
      
      const payload = store.buildExportPayload()
      
      const afterTime = new Date().toISOString()

      expect(payload.exportedAt).toBeDefined()
      expect(payload.exportedAt >= beforeTime).toBe(true)
      expect(payload.exportedAt <= afterTime).toBe(true)
    })
  })

  describe('YAML artifact formatting', () => {
    it('should handle valid YAML format', () => {
      const store = useWorkspaceStore()
      
      const yamlContent = `
name: test
version: 1.0.0
items:
  - id: 1
    name: first
  - id: 2
    name: second
`

      store.updateArtifact('yaml', yamlContent)

      const exports = store.generateExports()
      expect(exports.yaml).toBe(yamlContent)
    })

    it('should preserve YAML indentation', () => {
      const store = useWorkspaceStore()
      
      const yamlContent = `parent:
  child:
    grandchild: value`

      store.updateArtifact('yaml', yamlContent)

      const exports = store.generateExports()
      expect(exports.yaml).toBe(yamlContent)
    })

    it('should handle YAML with special characters', () => {
      const store = useWorkspaceStore()
      
      const yamlContent = `message: "Hello: World!"
path: "/home/user/file.txt"
regex: '^[a-z]+$'`

      store.updateArtifact('yaml', yamlContent)

      const exports = store.generateExports()
      expect(exports.yaml).toBe(yamlContent)
    })
  })

  describe('Regex artifact formatting', () => {
    it('should handle valid regex patterns', () => {
      const store = useWorkspaceStore()
      
      const regexContent = `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/gm`

      store.updateArtifact('regex', regexContent)

      const exports = store.generateExports()
      expect(exports.regex).toBe(regexContent)
    })

    it('should handle regex with flags', () => {
      const store = useWorkspaceStore()
      
      const regexContent = `/test/gi`

      store.updateArtifact('regex', regexContent)

      const exports = store.generateExports()
      expect(exports.regex).toBe(regexContent)
    })

    it('should handle multiline regex patterns', () => {
      const store = useWorkspaceStore()
      
      const regexContent = `/first line/
/second line/
/third line/gi`

      store.updateArtifact('regex', regexContent)

      const exports = store.generateExports()
      expect(exports.regex).toBe(regexContent)
    })

    it('should handle regex with escaped characters', () => {
      const store = useWorkspaceStore()
      
      const regexContent = `/\\d{3}-\\d{2}-\\d{4}/g`

      store.updateArtifact('regex', regexContent)

      const exports = store.generateExports()
      expect(exports.regex).toBe(regexContent)
    })
  })

  describe('HTML/CSS/JS artifact formatting', () => {
    it('should preserve HTML formatting', () => {
      const store = useWorkspaceStore()
      
      const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Test</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>`

      store.updateArtifact('html', htmlContent)

      const exports = store.generateExports()
      expect(exports.html).toBe(htmlContent)
    })

    it('should preserve CSS formatting', () => {
      const store = useWorkspaceStore()
      
      const cssContent = `body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}`

      store.updateArtifact('css', cssContent)

      const exports = store.generateExports()
      expect(exports.css).toBe(cssContent)
    })

    it('should preserve JavaScript formatting', () => {
      const store = useWorkspaceStore()
      
      const jsContent = `function hello(name) {
  console.log(\`Hello, \${name}!\`);
}

const arr = [1, 2, 3];
arr.forEach(item => {
  console.log(item);
})`

      store.updateArtifact('javascript', jsContent)

      const exports = store.generateExports()
      expect(exports.javascript).toBe(jsContent)
    })
  })

  describe('Multiple artifacts together', () => {
    it('should handle mixed content with different encodings', () => {
      const store = useWorkspaceStore()
      
      const artifacts = {
        html: '<div>HTML content with "quotes" and \'apostrophes\'</div>',
        css: 'body::before { content: ">>"; }',
        javascript: 'const str = "Line1\\nLine2";',
        yaml: 'message: "Multi\nline\nstring"',
        regex: '/\\w+@\\w+\\.\\w+/g',
      }

      store.updateArtifacts(artifacts)

      const exports = store.generateExports()
      
      expect(exports.html).toBe(artifacts.html)
      expect(exports.css).toBe(artifacts.css)
      expect(exports.javascript).toBe(artifacts.javascript)
      expect(exports.yaml).toBe(artifacts.yaml)
      expect(exports.regex).toBe(artifacts.regex)
    })

    it('should maintain artifact independence', () => {
      const store = useWorkspaceStore()
      
      store.updateArtifact('html', '<div>HTML</div>')
      store.updateArtifact('css', 'body { color: red; }')
      
      // Update one artifact
      store.updateArtifact('html', '<div>Updated</div>')
      
      const exports = store.generateExports()
      
      expect(exports.html).toBe('<div>Updated</div>')
      expect(exports.css).toBe('body { color: red; }')
    })
  })
})
