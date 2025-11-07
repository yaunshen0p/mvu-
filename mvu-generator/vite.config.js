import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

const resolvedMonacoPlugin =
  typeof monacoEditorPlugin === 'function' ? monacoEditorPlugin : monacoEditorPlugin?.default

if (typeof resolvedMonacoPlugin !== 'function') {
  throw new Error('vite-plugin-monaco-editor failed to load')
}

export default defineConfig({
  plugins: [
    vue(),
    resolvedMonacoPlugin({
      languageWorkers: ['editorWorkerService', 'json', 'html', 'css', 'typescript'],
      customWorkers: [{ label: 'yaml', entry: 'monaco-yaml/yaml.worker' }],
    }),
  ],
})
