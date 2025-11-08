# AI Flow Implementation

## Overview

This document describes the complete AI flow implementation for the MVU Generator, connecting chat actions to OpenAI-compatible APIs with streaming, workspace artifact updates, and export regeneration.

## Architecture

### Services Layer

#### OpenAI Service (`src/services/openai.ts`)
- TypeScript-based OpenAI client with streaming support
- Supports multiple providers: OpenAI, Azure, OpenRouter, custom base URLs
- Features:
  - Streaming with `onToken` callback for real-time updates
  - Automatic fallback when streaming fails
  - AbortController support for request cancellation
  - Provider-specific authentication headers
  - Comprehensive error handling

### Utilities Layer

#### Prompts Utility (`src/utils/prompts.ts`)
- MVU-aligned prompt assembly system
- Key functions:
  - `assemblePrompt()`: Builds system/user prompts with context
  - `parseVariableSummary()`: Parses variable data into structured format
  - Context injection: statData, lorebook, memory, customNotes
- Features:
  - Template-based system prompts with variable glances
  - History management for conversation context
  - Context sections for MVU macro references
  - Type-safe interfaces for all inputs/outputs

#### Workspace Utility (`src/utils/workspace.ts`)
- Artifact extraction and management
- Key functions:
  - `extractArtifactsFromContent()`: Parses code fences and section markers
  - `normaliseArtifacts()`: Ensures all artifact types are present
  - `mergeArtifacts()`: Merges patch updates into current artifacts
  - `diffArtifacts()`: Detects changes between artifact sets
- Supported formats:
  - Code fences: ` ```html`, ` ```css`, ` ```javascript`, etc.
  - Language aliases: `js` → `javascript`, `yml` → `yaml`, `scss` → `css`
  - Section markers: `[HTML]`, `[CSS]`, `[JAVASCRIPT]`, etc.
  - MVU script and regex patterns

#### Error Translation (`src/utils/errors.ts`)
- Localizes common API errors to Chinese
- Handles:
  - Network errors (failed to fetch, timeout)
  - Authentication errors (401, 403)
  - Server errors (502, 503, 504)
  - Rate limiting (429)
  - JSON parsing errors
  - API key and model validation errors

### Store Layer

#### Chat Store (`src/composables/stores/chat.ts`)
Enhanced with full AI flow integration:

**State:**
- `messages`: Chat history with metadata (pending, status, error)
- `isLoading`: Request in progress
- `isStreaming`: Streaming in progress
- `error`: Current error message

**Key Actions:**
- `sendMessage(userMessage, options?)`: 
  - Assembles MVU-formatted prompts with history and context
  - Calls OpenAI API with streaming enabled
  - Updates messages in real-time via `onToken` callback
  - Extracts artifacts from assistant response
  - Updates workspace store with extracted code
  - Handles errors with localized messages
  - Supports cancellation via AbortController

**Integration Points:**
- Uses `assemblePrompt()` for MVU prompt building
- Uses `createChatCompletion()` for API calls
- Uses `extractArtifactsFromContent()` for code extraction
- Uses `translateErrorMessage()` for error localization
- Updates `useWorkspaceStore()` with extracted artifacts

#### Workspace Store (`src/composables/stores/workspace.ts`)
Enhanced with export regeneration:

**New State:**
- `currentExports`: Latest export data for result sheet

**Export Regeneration:**
- Watches `artifacts` with 300ms debounce
- Auto-generates exports when artifacts change
- Manual trigger via `generateExports()`

**Workflow:**
1. Chat response arrives
2. `extractArtifacts(content)` parses code blocks
3. Artifacts updated in store
4. Debounced watcher triggers after 300ms
5. `generateExports()` updates `currentExports`
6. Result sheet displays latest data

## Message Flow

### Sending a Chat Message

```
User input
    ↓
chat.sendMessage(message, options)
    ↓
assemblePrompt({
  userInput,
  history,
  variableSummary,
  context
})
    ↓
createChatCompletion({
  messages: assembled.messages,
  stream: true,
  onToken: (delta, fullText) => {
    updateMessage(assistantId, { content: fullText })
  },
  onComplete: (finalContent) => {
    workspace.extractArtifacts(finalContent)
    workspace.setBaseline(workspace.artifacts)
  }
})
    ↓
Streaming tokens → Real-time UI updates
    ↓
Final response → Artifact extraction
    ↓
Workspace updated → Export regeneration (debounced)
    ↓
Result sheet shows latest exports
```

### Error Handling

```
Error occurs
    ↓
translateErrorMessage(error.message)
    ↓
Localized error displayed in UI
    ↓
Assistant message marked with error status
    ↓
User can retry or modify request
```

### Cancellation Flow

```
User clicks cancel
    ↓
chat.abortCurrentRequest()
    ↓
AbortController.abort()
    ↓
Streaming stops immediately
    ↓
Assistant message shows "🚫 请求已取消。"
    ↓
Store state reset (isLoading, isStreaming = false)
```

## Testing

### Manual Tests (`src/test-ai-flow.ts`)
Comprehensive test suite covering:
- ✓ Prompt assembly with context
- ✓ Artifact extraction from code fences
- ✓ Error message translation
- ✓ Prompt with conversation history
- ✓ Multiple code blocks of same type

Run with:
```bash
npx tsx src/test-ai-flow.ts
```

### Unit Tests
Created test files for:
- `src/utils/__tests__/prompts.test.ts` - Prompt assembly logic
- `src/utils/__tests__/workspace.test.ts` - Artifact extraction
- `src/utils/__tests__/errors.test.ts` - Error translation
- `src/composables/stores/__tests__/chat-integration.test.ts` - Full chat flow
- `src/composables/stores/__tests__/workspace-exports.test.ts` - Export regeneration

### Integration Testing
The chat store integration test (`chat-integration.test.ts`) verifies:
- Streaming message updates
- Workspace artifact extraction
- Error handling (network, abort)
- API credential validation
- Context and prompt assembly

## Usage Examples

### Basic Chat Message

```typescript
import { useChatStore } from '@/composables/stores/chat';

const chatStore = useChatStore();

await chatStore.sendMessage('Create a red button');
// → System prompt assembled
// → User prompt with MVU context
// → API call with streaming
// → Real-time message updates
// → Artifacts extracted and saved
```

### Chat with Context

```typescript
await chatStore.sendMessage('Show player stats', {
  context: {
    statData: true,
    lorebook: true,
  },
  variableSummary: {
    stat_data: 'Level 5, HP: 100/100',
    lorebook: 'Fantasy world setting',
  },
});
// → Context sections included in prompt
// → MVU macros referenced
```

### Cancelling a Request

```typescript
// Start a request
const promise = chatStore.sendMessage('Generate complex code');

// Cancel it
chatStore.abortCurrentRequest();

// Wait for cancellation
await promise.catch(() => {
  // Expected - request was cancelled
});
```

### Accessing Exports

```typescript
import { useWorkspaceStore } from '@/composables/stores/workspace';

const workspaceStore = useWorkspaceStore();

// Exports automatically updated when artifacts change
console.log(workspaceStore.currentExports.html);
console.log(workspaceStore.currentExports.css);
console.log(workspaceStore.currentExports.javascript);
```

## Provider Configuration

### OpenAI
```typescript
{
  providerType: 'openai',
  baseUrl: 'https://api.openai.com/v1',
  apiKey: 'sk-...',
  defaultModel: 'gpt-3.5-turbo'
}
```

### Azure OpenAI
```typescript
{
  providerType: 'azure',
  baseUrl: 'https://your-resource.openai.azure.com',
  apiKey: 'your-api-key',
  defaultModel: 'gpt-35-turbo'
}
```

### OpenRouter
```typescript
{
  providerType: 'openrouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKey: 'sk-or-...',
  defaultModel: 'anthropic/claude-2'
}
```

### Custom Provider
```typescript
{
  providerType: 'custom',
  baseUrl: 'https://your-api.com/v1',
  apiKey: 'your-key',
  defaultModel: 'your-model',
  headers: {
    'X-Custom-Header': 'value'
  }
}
```

## Performance Optimizations

1. **Debounced Export Regeneration**: Prevents excessive updates during rapid artifact changes (300ms delay)

2. **Streaming Updates**: Real-time token delivery provides immediate feedback without waiting for full response

3. **Shallow Artifact Comparison**: Workspace diff uses trimmed string comparison to ignore whitespace-only changes

4. **Memoized Computed Values**: Pinia stores use computed refs for derived state (hasUnsavedChanges, currentArtifact)

5. **Efficient History Management**: Chat history persisted to localStorage with normalisation to prevent bloat

## Error Recovery

The implementation handles various error scenarios gracefully:

- **Network Errors**: Localized message, allows retry
- **Authentication Errors**: Prompts user to check API credentials
- **Rate Limiting**: Suggests waiting before retry
- **Streaming Failures**: Automatic fallback to non-streaming request
- **Abort Errors**: Clean cancellation without error state
- **JSON Parse Errors**: Indicates server response issue

## Future Enhancements

Potential improvements for future iterations:

1. **Retry Logic**: Auto-retry failed requests with exponential backoff
2. **Token Counting**: Display token usage and estimate costs
3. **Prompt Templates**: User-customizable prompt templates
4. **Artifact Versioning**: Track history of artifact changes
5. **Export Formats**: Additional export options (ZIP, GitHub Gist)
6. **Streaming Indicators**: Visual feedback for streaming progress
7. **Context Presets**: Save/load context configurations
8. **Analytics**: Track API usage, response times, error rates

## Acceptance Criteria Met

✅ **Sending chat message hits configured API**: OpenAI service with streaming support  
✅ **Streams content into chat sheet**: Real-time token updates via onToken  
✅ **Errors gracefully handled in UI**: Localized error messages, error status on messages  
✅ **Assistant responses update workspace artifacts**: extractArtifacts + setBaseline  
✅ **Export data refreshed**: Debounced watcher regenerates exports  
✅ **Cancel request stops streaming immediately**: AbortController integration  
✅ **Works with different provider presets**: OpenAI, Azure, OpenRouter, custom  
✅ **Unit tests for prompt assembly**: prompts.test.ts with comprehensive coverage  
✅ **Unit tests for artifact extraction**: workspace.test.ts with multiple scenarios  
✅ **Integration tests**: chat-integration.test.ts and workspace-exports.test.ts  
✅ **Manual testing verified**: All tests in test-ai-flow.ts pass  

## Conclusion

The AI flow implementation is complete and production-ready. All acceptance criteria have been met, with comprehensive testing, error handling, and performance optimizations in place.
