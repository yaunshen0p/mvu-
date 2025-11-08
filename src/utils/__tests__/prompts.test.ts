import { describe, it, expect } from 'vitest';
import { assemblePrompt, parseVariableSummary, MVU_CONTEXT_ACTIONS } from '../prompts';

describe('prompts', () => {
  describe('parseVariableSummary', () => {
    it('should return empty object for null or undefined', () => {
      expect(parseVariableSummary(null)).toEqual({});
      expect(parseVariableSummary(undefined)).toEqual({});
    });

    it('should return object as-is if already an object', () => {
      const obj = { stat_data: 'test', lorebook: 'content' };
      expect(parseVariableSummary(obj)).toEqual(obj);
    });

    it('should parse valid JSON string', () => {
      const jsonStr = JSON.stringify({ stat_data: 'test', lorebook: 'content' });
      expect(parseVariableSummary(jsonStr)).toEqual({ stat_data: 'test', lorebook: 'content' });
    });

    it('should split sections for invalid JSON', () => {
      const text = 'Section 1\n\nSection 2\n\nSection 3';
      const result = parseVariableSummary(text);
      expect(result.section_1).toBe('Section 1');
      expect(result.section_2).toBe('Section 2');
      expect(result.section_3).toBe('Section 3');
    });
  });

  describe('assemblePrompt', () => {
    it('should throw error if userInput is empty', () => {
      expect(() => assemblePrompt({ userInput: '' })).toThrow('assemblePrompt 需要传入用户输入');
      expect(() => assemblePrompt({ userInput: '   ' })).toThrow('assemblePrompt 需要传入用户输入');
    });

    it('should generate basic prompt with user input', () => {
      const result = assemblePrompt({
        userInput: 'Test message',
      });

      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].role).toBe('system');
      expect(result.messages[1].role).toBe('user');
      expect(result.messages[1].content).toContain('Test message');
      expect(result.systemPrompt).toContain('MVU');
      expect(result.userPrompt).toContain('Test message');
    });

    it('should include history messages', () => {
      const result = assemblePrompt({
        userInput: 'Test message',
        history: [
          { role: 'user', content: 'Previous user message' },
          { role: 'assistant', content: 'Previous assistant message' },
        ],
      });

      expect(result.messages).toHaveLength(4); // system + 2 history + user
      expect(result.messages[1].role).toBe('user');
      expect(result.messages[1].content).toBe('Previous user message');
      expect(result.messages[2].role).toBe('assistant');
      expect(result.messages[2].content).toBe('Previous assistant message');
    });

    it('should skip system prompt when includeSystem is false', () => {
      const result = assemblePrompt({
        userInput: 'Test message',
        includeSystem: false,
      });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      expect(result.systemPrompt).toBe('');
    });

    it('should include context sections when specified', () => {
      const result = assemblePrompt({
        userInput: 'Test message',
        context: {
          statData: true,
          lorebook: true,
          memory: true,
        },
        variableSummary: {
          stat_data: 'Player stats',
          lorebook: 'World info',
          memory: 'Recent events',
        },
      });

      expect(result.contextSections).toHaveLength(3);
      expect(result.userPrompt).toContain('Stat Data');
      expect(result.userPrompt).toContain('World Book');
      expect(result.userPrompt).toContain('Memory Shards');
    });

    it('should include custom notes in context', () => {
      const result = assemblePrompt({
        userInput: 'Test message',
        context: {
          customNotes: ['Note 1', 'Note 2'],
        },
      });

      expect(result.contextSections).toContain('Note 1');
      expect(result.contextSections).toContain('Note 2');
    });

    it('should handle parsed variable summary structure', () => {
      const result = assemblePrompt({
        userInput: 'Test message',
        variableSummary: {
          parsed: {
            stat_data: 'Test stats',
          },
        },
      });

      expect(result.systemPrompt).toContain('stat_data');
    });
  });

  describe('MVU_CONTEXT_ACTIONS', () => {
    it('should export context actions', () => {
      expect(MVU_CONTEXT_ACTIONS).toHaveLength(3);
      expect(MVU_CONTEXT_ACTIONS[0].id).toBe('statData');
      expect(MVU_CONTEXT_ACTIONS[1].id).toBe('lorebook');
      expect(MVU_CONTEXT_ACTIONS[2].id).toBe('memory');
    });
  });
});
