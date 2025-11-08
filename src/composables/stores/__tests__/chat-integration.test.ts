import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useChatStore } from '../chat';
import { useSettingsStore } from '../settings';
import { useWorkspaceStore } from '../workspace';

// Mock the OpenAI service
vi.mock('../../../services/openai', () => ({
  createChatCompletion: vi.fn(),
}));

describe('chat store integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  describe('sendMessage with streaming', () => {
    it('should stream message and update workspace artifacts', async () => {
      const chatStore = useChatStore();
      const settingsStore = useSettingsStore();
      const workspaceStore = useWorkspaceStore();

      // Configure settings
      settingsStore.updateSettings({
        apiKey: 'test-key',
        baseUrl: 'https://api.test.com',
        defaultModel: 'gpt-3.5-turbo',
        providerType: 'openai',
      });

      // Mock createChatCompletion to simulate streaming
      const { createChatCompletion } = await import('../../../services/openai');
      (createChatCompletion as any).mockImplementation(async (options: any) => {
        // Simulate streaming tokens
        if (options.onToken) {
          options.onToken('Hello', 'Hello');
          options.onToken(' world', 'Hello world');
        }

        const finalContent = '```html\n<div>Test</div>\n```';
        
        if (options.onComplete) {
          options.onComplete(finalContent);
        }

        return {
          response: { ok: true },
          payload: {
            choices: [
              {
                message: {
                  content: finalContent,
                },
              },
            ],
          },
        };
      });

      // Send message
      await chatStore.sendMessage('Create a div');

      // Verify message was added
      expect(chatStore.messages).toHaveLength(2);
      expect(chatStore.messages[0].role).toBe('user');
      expect(chatStore.messages[1].role).toBe('assistant');

      // Verify workspace was updated
      expect(workspaceStore.artifacts.html).toBe('<div>Test</div>');
    });

    it('should handle streaming errors gracefully', async () => {
      const chatStore = useChatStore();
      const settingsStore = useSettingsStore();

      settingsStore.updateSettings({
        apiKey: 'test-key',
        baseUrl: 'https://api.test.com',
        defaultModel: 'gpt-3.5-turbo',
        providerType: 'openai',
      });

      const { createChatCompletion } = await import('../../../services/openai');
      (createChatCompletion as any).mockRejectedValue(new Error('Network error'));

      try {
        await chatStore.sendMessage('Test message');
      } catch (error) {
        // Expected to throw
      }

      // Verify error was set
      expect(chatStore.error).toBeTruthy();
      
      // Verify assistant message shows error
      const assistantMsg = chatStore.messages.find((msg) => msg.role === 'assistant');
      expect(assistantMsg?.status).toBe('error');
    });

    it('should handle abort correctly', async () => {
      const chatStore = useChatStore();
      const settingsStore = useSettingsStore();

      settingsStore.updateSettings({
        apiKey: 'test-key',
        baseUrl: 'https://api.test.com',
        defaultModel: 'gpt-3.5-turbo',
        providerType: 'openai',
      });

      const { createChatCompletion } = await import('../../../services/openai');
      (createChatCompletion as any).mockImplementation(async () => {
        const abortError = new Error('Aborted');
        abortError.name = 'AbortError';
        throw abortError;
      });

      try {
        const promise = chatStore.sendMessage('Test message');
        chatStore.abortCurrentRequest();
        await promise;
      } catch (error) {
        // Expected to throw
      }

      expect(chatStore.isLoading).toBe(false);
      expect(chatStore.isStreaming).toBe(false);
    });

    it('should require API credentials', async () => {
      const chatStore = useChatStore();

      try {
        await chatStore.sendMessage('Test message');
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('API 凭据');
      }
    });

    it('should assemble prompt with context', async () => {
      const chatStore = useChatStore();
      const settingsStore = useSettingsStore();

      settingsStore.updateSettings({
        apiKey: 'test-key',
        baseUrl: 'https://api.test.com',
        defaultModel: 'gpt-3.5-turbo',
        providerType: 'openai',
      });

      const { createChatCompletion } = await import('../../../services/openai');
      let capturedMessages: any[] = [];
      
      (createChatCompletion as any).mockImplementation(async (options: any) => {
        capturedMessages = options.messages;
        
        if (options.onComplete) {
          options.onComplete('Response');
        }

        return {
          response: { ok: true },
          payload: {
            choices: [{ message: { content: 'Response' } }],
          },
        };
      });

      await chatStore.sendMessage('Test', {
        context: { statData: true },
        variableSummary: { stat_data: 'Player stats' },
      });

      // Verify system message was included
      expect(capturedMessages[0].role).toBe('system');
      expect(capturedMessages[0].content).toContain('MVU');
      
      // Verify context was included
      expect(capturedMessages[capturedMessages.length - 1].content).toContain('Stat Data');
    });
  });
});
