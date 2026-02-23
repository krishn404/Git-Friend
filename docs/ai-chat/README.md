# AI Chat Interface

Production-grade Streamdown-native chat interface optimized for long-running streamed responses, tool calls, and rich content rendering.

## Architecture

### File Structure

```
components/ai-chat/
├── index.tsx                  # Component exports
├── streamdown-message.tsx     # Streamdown message renderer
├── stream-cursor.tsx          # Blinking cursor during streaming
└── chat-container.tsx         # Message list container

app/ai-chat/
├── page.tsx                   # Chat page (client)
└── loading.tsx                # Loading state

app/api/chat/
└── route.ts                   # Streaming API endpoint

lib/ai/
├── system-prompts.ts          # System prompt configuration
└── utils.ts                   # AI utilities and types

hooks/
└── use-chat-stream.ts         # Stream state management

docs/ai-chat/
└── README.md                  # This file
```

## Features

### Streaming-First Architecture
- Token-by-token streaming with partial rendering
- Streamdown as sole rendering layer
- No custom markdown parsing overhead
- Raw text streaming from API

### Message Types
- User messages with timestamp
- Assistant messages with streaming indicator
- Feedback system (like/dislike)
- Auto-scroll to latest message

### UI Components

#### StreamdownMessage
Renders assistant or user messages with Streamdown-native formatting.

```tsx
<StreamdownMessage
  role="assistant"
  content={content}
  isStreaming={true}
  feedback={feedback}
  onFeedback={(type) => handleFeedback(messageId, type)}
/>
```

#### StreamCursor
Visual indicator during streaming.

```tsx
{isStreaming && <StreamCursor />}
```

#### ChatContainer
Auto-scrolling message list wrapper.

```tsx
<ChatContainer ref={containerRef}>
  {messages.map(msg => <StreamdownMessage {...msg} />)}
</ChatContainer>
```

## State Management

### useChatStream Hook
Centralized hook for chat state and streaming.

```tsx
const {
  messages,           // All messages
  isLoading,          // Streaming status
  streamContent,      // Current stream buffer
  addMessage,         // Add user/assistant message
  appendToStreamContent, // Append chunk to stream
  completeStream,     // Finalize streaming
  clearMessages,      // Clear chat history
  updateMessageFeedback, // Update feedback
} = useChatStream()
```

## API Integration

### POST /api/chat
Streams markdown responses using Streamdown.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "..." }
  ],
  "repoUrl": "https://github.com/owner/repo" // Optional
}
```

**Response:**
- Content-Type: `text/plain; charset=utf-8`
- Raw text streaming (token-by-token)
- No JSON wrapper, direct markdown content

## System Prompts

Located in `lib/ai/system-prompts.ts`:
- `GIT_FRIEND_SYSTEM_PROMPT` - Main system instruction
- `SYSTEM_MESSAGE` - Ready-to-use message object

## Utilities

Located in `lib/ai/utils.ts`:
- `buildMessagesForAPI()` - Prepare messages with system prompt
- `extractCodeBlocks()` - Parse code from markdown
- `formatMessageTime()` - User-friendly timestamps
- `generateMessageId()` - Unique message IDs
- `sanitizeUserInput()` - Input validation

## Performance Optimizations

1. **Token-by-token rendering** - No full re-renders per chunk
2. **Memoized callbacks** - Prevents unnecessary updates
3. **Abort controller** - Interrupt long-running requests
4. **Auto-scroll** - Smooth scroll to latest message
5. **Visual cursor** - Blinking indicator during stream

## Styling

### Colors & Spacing
- User messages: Primary color, right-aligned
- Assistant messages: Card background, left-aligned
- Timestamp: Muted foreground
- Hover actions: Fade in on hover

### Animations
- Message fade-in on appearance
- Blinking cursor during streaming
- Smooth scroll-to-bottom

## Content Support

Via Streamdown:
- Code blocks with syntax highlighting
- Inline code formatting
- Tables and lists
- Links and badges
- Bold, italic, strikethrough
- Nested lists
- Blockquotes

## Error Handling

- Network error recovery with user-friendly toast
- Abort signal support for cancellation
- Graceful stream termination
- Loading states during requests

## Mobile Responsiveness

- Mobile-first design
- Responsive grid on larger screens
- Touch-optimized input
- Proper padding for safe areas

## Future Enhancements

- Message search and filtering
- Export conversation as markdown/PDF
- Custom system prompts per conversation
- Conversation history persistence
- Real-time collaboration hints
