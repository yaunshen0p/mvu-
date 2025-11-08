import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWorkspaceStore } from '../workspace';
import { nextTick } from 'vue';

describe('workspace exports', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should regenerate exports when artifacts change', async () => {
    const workspaceStore = useWorkspaceStore();

    // Initial state
    expect(workspaceStore.currentExports.html).toBe('');

    // Update artifact
    workspaceStore.updateArtifact('html', '<div>Test</div>');

    // Wait for debounce
    await vi.advanceTimersByTimeAsync(400);
    await nextTick();

    // Verify export was regenerated
    expect(workspaceStore.currentExports.html).toBe('<div>Test</div>');
  });

  it('should debounce export regeneration', async () => {
    const workspaceStore = useWorkspaceStore();

    // Multiple rapid updates
    workspaceStore.updateArtifact('html', '<div>1</div>');
    await vi.advanceTimersByTimeAsync(100);
    
    workspaceStore.updateArtifact('html', '<div>2</div>');
    await vi.advanceTimersByTimeAsync(100);
    
    workspaceStore.updateArtifact('html', '<div>3</div>');
    
    // Exports should not be updated yet
    expect(workspaceStore.currentExports.html).toBe('');

    // Wait for debounce to complete
    await vi.advanceTimersByTimeAsync(400);
    await nextTick();

    // Now exports should be updated with final value
    expect(workspaceStore.currentExports.html).toBe('<div>3</div>');
  });

  it('should update exports for multiple artifacts', async () => {
    const workspaceStore = useWorkspaceStore();

    workspaceStore.updateArtifacts({
      html: '<div>HTML</div>',
      css: 'body { margin: 0; }',
      javascript: 'console.log("test");',
    });

    await vi.advanceTimersByTimeAsync(400);
    await nextTick();

    expect(workspaceStore.currentExports.html).toBe('<div>HTML</div>');
    expect(workspaceStore.currentExports.css).toBe('body { margin: 0; }');
    expect(workspaceStore.currentExports.javascript).toBe('console.log("test");');
  });

  it('should include all artifact types in exports', async () => {
    const workspaceStore = useWorkspaceStore();

    const allArtifacts = {
      html: '<div>HTML</div>',
      css: 'body {}',
      javascript: 'console.log("js");',
      yaml: 'key: value',
      script: '// MVU script',
      regex: '^[a-z]+$',
    };

    workspaceStore.updateArtifacts(allArtifacts);

    await vi.advanceTimersByTimeAsync(400);
    await nextTick();

    expect(workspaceStore.currentExports).toEqual(allArtifacts);
  });

  it('should manually trigger export generation', () => {
    const workspaceStore = useWorkspaceStore();

    workspaceStore.updateArtifact('html', '<div>Manual</div>');
    
    // Call generateExports manually
    const exports = workspaceStore.generateExports();

    expect(exports.html).toBe('<div>Manual</div>');
    expect(workspaceStore.currentExports.html).toBe('<div>Manual</div>');
  });

  it('should extract and update exports from content', async () => {
    const workspaceStore = useWorkspaceStore();

    const content = `
Here's some code:

\`\`\`html
<div>Extracted</div>
\`\`\`

\`\`\`css
body { color: red; }
\`\`\`
    `;

    workspaceStore.extractArtifacts(content);

    await vi.advanceTimersByTimeAsync(400);
    await nextTick();

    expect(workspaceStore.currentExports.html).toBe('<div>Extracted</div>');
    expect(workspaceStore.currentExports.css).toBe('body { color: red; }');
  });
});
