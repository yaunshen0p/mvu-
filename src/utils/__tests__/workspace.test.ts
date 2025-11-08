import { describe, it, expect } from 'vitest';
import {
  normaliseArtifacts,
  extractArtifactsFromContent,
  diffArtifacts,
  mergeArtifacts,
  WORKSPACE_TABS,
  WORKSPACE_TAB_IDS,
  EMPTY_ARTIFACTS,
} from '../workspace';

describe('workspace', () => {
  describe('normaliseArtifacts', () => {
    it('should return empty artifacts for undefined input', () => {
      const result = normaliseArtifacts();
      expect(result).toEqual(EMPTY_ARTIFACTS);
    });

    it('should normalize partial artifacts', () => {
      const result = normaliseArtifacts({ html: '<div>test</div>' });
      expect(result.html).toBe('<div>test</div>');
      expect(result.css).toBe('');
      expect(result.javascript).toBe('');
    });

    it('should filter out non-string values', () => {
      const result = normaliseArtifacts({ html: 123 as any, css: 'body {}' });
      expect(result.html).toBe('');
      expect(result.css).toBe('body {}');
    });
  });

  describe('extractArtifactsFromContent', () => {
    it('should return empty object for null or empty content', () => {
      expect(extractArtifactsFromContent('')).toEqual({});
      expect(extractArtifactsFromContent(null as any)).toEqual({});
    });

    it('should extract HTML from code fence', () => {
      const content = '```html\n<div>Hello</div>\n```';
      const result = extractArtifactsFromContent(content);
      expect(result.html).toBe('<div>Hello</div>');
    });

    it('should extract multiple language blocks', () => {
      const content = `
\`\`\`html
<div>Hello</div>
\`\`\`

\`\`\`css
body { margin: 0; }
\`\`\`

\`\`\`javascript
console.log('test');
\`\`\`
      `;
      const result = extractArtifactsFromContent(content);
      expect(result.html).toBe('<div>Hello</div>');
      expect(result.css).toBe('body { margin: 0; }');
      expect(result.javascript).toBe("console.log('test');");
    });

    it('should map language aliases correctly', () => {
      const content = `
\`\`\`js
console.log('test');
\`\`\`

\`\`\`yml
key: value
\`\`\`

\`\`\`scss
$color: red;
\`\`\`
      `;
      const result = extractArtifactsFromContent(content);
      expect(result.javascript).toBe("console.log('test');");
      expect(result.yaml).toBe('key: value');
      expect(result.css).toBe('$color: red;');
    });

    it('should concatenate multiple blocks of same language', () => {
      const content = `
\`\`\`html
<div>First</div>
\`\`\`

\`\`\`html
<div>Second</div>
\`\`\`
      `;
      const result = extractArtifactsFromContent(content);
      expect(result.html).toBe('<div>First</div>\n\n<div>Second</div>');
    });

    it('should extract from section markers as fallback', () => {
      const content = `
[HTML]
<div>Hello</div>

[CSS]
body { margin: 0; }

[JAVASCRIPT]
console.log('test');
      `;
      const result = extractArtifactsFromContent(content);
      expect(result.html).toBe('<div>Hello</div>');
      expect(result.css).toBe('body { margin: 0; }');
      expect(result.javascript).toBe("console.log('test');");
    });

    it('should handle MVU script and regex', () => {
      const content = `
\`\`\`mvu-script
// MVU code
\`\`\`

\`\`\`regex
^[a-z]+$
\`\`\`
      `;
      const result = extractArtifactsFromContent(content);
      expect(result.script).toBe('// MVU code');
      expect(result.regex).toBe('^[a-z]+$');
    });
  });

  describe('diffArtifacts', () => {
    it('should detect no changes when artifacts are identical', () => {
      const current = { html: '<div>test</div>', css: 'body {}' };
      const baseline = { html: '<div>test</div>', css: 'body {}' };
      const result = diffArtifacts(current, baseline);
      
      expect(result.html).toBe(false);
      expect(result.css).toBe(false);
    });

    it('should detect changes in specific artifacts', () => {
      const current = { html: '<div>changed</div>', css: 'body {}' };
      const baseline = { html: '<div>test</div>', css: 'body {}' };
      const result = diffArtifacts(current, baseline);
      
      expect(result.html).toBe(true);
      expect(result.css).toBe(false);
    });

    it('should ignore whitespace-only changes', () => {
      const current = { html: '<div>test</div>' };
      const baseline = { html: '  <div>test</div>  ' };
      const result = diffArtifacts(current, baseline);
      
      expect(result.html).toBe(false);
    });
  });

  describe('mergeArtifacts', () => {
    it('should merge patch into current artifacts', () => {
      const current = { html: '<div>old</div>', css: 'old css' };
      const patch = { html: '<div>new</div>' };
      const result = mergeArtifacts(current, patch);
      
      expect(result.html).toBe('<div>new</div>');
      expect(result.css).toBe('old css');
    });

    it('should handle empty patch', () => {
      const current = { html: '<div>test</div>' };
      const result = mergeArtifacts(current, {});
      
      expect(result.html).toBe('<div>test</div>');
    });

    it('should normalize result', () => {
      const current = { html: '<div>test</div>' };
      const patch = { css: 'body {}' };
      const result = mergeArtifacts(current, patch);
      
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('css');
      expect(result).toHaveProperty('javascript');
      expect(result).toHaveProperty('yaml');
      expect(result).toHaveProperty('script');
      expect(result).toHaveProperty('regex');
    });
  });

  describe('WORKSPACE_TABS', () => {
    it('should export all workspace tabs', () => {
      expect(WORKSPACE_TABS).toHaveLength(6);
      expect(WORKSPACE_TAB_IDS).toContain('html');
      expect(WORKSPACE_TAB_IDS).toContain('css');
      expect(WORKSPACE_TAB_IDS).toContain('javascript');
      expect(WORKSPACE_TAB_IDS).toContain('yaml');
      expect(WORKSPACE_TAB_IDS).toContain('script');
      expect(WORKSPACE_TAB_IDS).toContain('regex');
    });
  });
});
