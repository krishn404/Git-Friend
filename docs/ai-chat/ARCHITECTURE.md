# AI Chat Architecture

Complete system architecture and data flow for the Streamdown-native AI Chat interface.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GITFRIEND AI CHAT SYSTEM                  │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
           ┌────▼────┐   ┌────▼────┐   ┌──▼──────┐
           │ Frontend │   │ Backend  │   │ Config  │
           │   (UI)   │   │  (API)   │   │ (Lib)   │
           └──────────┘   └──────────┘   └─────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│ CLIENT (Browser)                                              │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  User Input                                                   │
│      │                                                        │
│      ▼                                                        │
│  ┌─────────────────────────────────────────┐                │
│  │  app/ai-chat/page.tsx (Chat Interface)   │                │
│  │  - Renders message list                  │                │
│  │  - Manages user input                    │                │
│  │  - Handles streaming updates             │                │
│  └────────────────┬────────────────────────┘                │
│                   │                                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────┐                │
│  │  hooks/use-chat-stream.ts              │                │
│  │  State Management                      │                │
│  │  - messages[]                          │                │
│  │  - streamContent (buffer)              │                │
│  │  - isLoading                           │                │
│  │  - Functions:                          │                │
│  │    • addMessage()                      │                │
│  │    • appendToStreamContent()           │                │
│  │    • completeStream()                  │                │
│  └────────────────┬────────────────────────┘                │
│                   │                                          │
│                   ▼                                          │
│  ┌─────────────────────────────────────────┐                │
│  │  components/ai-chat/                    │                │
│  │  UI Components:                         │                │
│  │  • StreamdownMessage (renderer)         │                │
│  │  • ChatContainer (list)                 │                │
│  │  • StreamCursor (loading indicator)     │                │
│  └────────────────┬────────────────────────┘                │
│                   │                                          │
│                   │  fetch('/api/chat')                      │
│                   │  Streaming Response                      │
│                   ▼                                          │
└──────────────────┬───────────────────────────────────────────┘
                   │
          ┌────────┴─────────┐
          │                  │
    ┌─────▼──────────────────▼──────┐
    │  SERVER (Node.js)              │
    │  Backend Processing            │
    ├────────────────────────────────┤
    │                                │
    │  ┌──────────────────────────┐  │
    │  │  app/api/chat/route.ts   │  │
    │  │  POST /api/chat          │  │
    │  │  - Receive user message  │  │
    │  │  - Load system prompt    │  │
    │  │  - Optional: scan repo   │  │
    │  │  - Call Groq LLM         │  │
    │  │  - Stream response back  │  │
    │  └──────────────────────────┘  │
    │         │                       │
    │         ├─ System Prompt        │
    │         │  (from lib/ai/)       │
    │         │                       │
    │         ├─ Repository Context   │
    │         │  (optional)           │
    │         │                       │
    │         ▼                       │
    │  ┌──────────────────────────┐  │
    │  │  Groq API                │  │
    │  │  Model: gpt-oss-120b     │  │
    │  │  Temperature: 0.7        │  │
    │  │  Max tokens: 4000        │  │
    │  └──────────────────────────┘  │
    │         │                       │
    │         ▼                       │
    │  Raw Text Stream (token-by-token)
    │  Markdown Format (Streamdown compatible)
    │                                │
    └────────────────┬───────────────┘
                     │
                     │ Streamed Response
                     │ (text/plain)
                     │
                     ▼
    ┌──────────────────────────────┐
    │ CLIENT (Browser) Receives    │
    │ - Token-by-token chunks      │
    │ - Parsed by useChatStream    │
    │ - Rendered by Streamdown     │
    │ - Displayed in ChatContainer │
    └──────────────────────────────┘
```

## Module Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      COMPONENTS LAYER                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  components/ai-chat/                                         │
│  ├── StreamdownMessage                                       │
│  │   └── Renders: User/Assistant messages with Streamdown   │
│  ├── ChatContainer                                           │
│  │   └── Renders: Auto-scrolling message list               │
│  └── StreamCursor                                            │
│      └── Renders: Blinking cursor during streaming          │
│                                                               │
│  UI Base Components (from shadcn):                           │
│  ├── Button, Input, Card, Badge                             │
│  └── Used by Chat components                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              △
                              │
┌─────────────────────────────┴─────────────────────────────────┐
│                      STATE LAYER                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  hooks/use-chat-stream.ts                                   │
│  ├── State:                                                 │
│  │   ├── messages: StreamingMessage[]                       │
│  │   ├── streamContent: string (buffer)                     │
│  │   └── isLoading: boolean                                 │
│  │                                                           │
│  └── Functions:                                             │
│      ├── addMessage(msg) - Add to list                      │
│      ├── appendToStreamContent(chunk) - Append to buffer   │
│      ├── completeStream() - Finalize message               │
│      ├── updateMessageFeedback(id, type) - Like/dislike    │
│      └── clearMessages() - Reset chat                      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              △
                              │
┌─────────────────────────────┴─────────────────────────────────┐
│                    API INTEGRATION LAYER                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Fetch API (Browser)                                         │
│  ├── POST /api/chat                                         │
│  ├── Request: { messages, repoUrl }                         │
│  ├── Response: ReadableStream<string>                       │
│  └── Uses: AbortController for cancellation                 │
│                                                               │
│  app/api/chat/route.ts                                      │
│  ├── Input: User messages                                   │
│  ├── Process:                                               │
│  │   ├── Load system prompt                                 │
│  │   ├── Optionally scan repo                               │
│  │   ├── Build message array                                │
│  │   └── Call Groq API                                      │
│  └── Output: Token-by-token stream                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              △
                              │
┌─────────────────────────────┴─────────────────────────────────┐
│                   CONFIGURATION LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  lib/ai/system-prompts.ts                                   │
│  ├── GIT_FRIEND_SYSTEM_PROMPT (string)                      │
│  └── SYSTEM_MESSAGE (object)                                │
│                                                               │
│  lib/ai/utils.ts                                            │
│  ├── Types: ChatMessage, StreamingMessage                   │
│  ├── Functions:                                             │
│  │   ├── buildMessagesForAPI()                              │
│  │   ├── sanitizeUserInput()                                │
│  │   ├── extractCodeBlocks()                                │
│  │   ├── formatMessageTime()                                │
│  │   └── generateMessageId()                                │
│  └── Constants & helpers                                    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

### 1. User Sends Message

```
User Input (e.g., "How to create a branch?")
    ↓
useChatStream.addMessage()
    ↓
State updated: messages + user message
    ↓
Components re-render with new message
    ↓
fetch('/api/chat', { messages: [...] })
```

### 2. API Processing

```
Request arrives at app/api/chat/route.ts
    ↓
Extract messages from request body
    ↓
Load SYSTEM_MESSAGE from lib/ai/system-prompts.ts
    ↓
Optionally scan repository for context
    ↓
Build final messages array:
  [
    { role: 'system', content: GIT_FRIEND_SYSTEM_PROMPT + context },
    { role: 'user', content: userMessage }
  ]
    ↓
Call Groq API with streaming enabled
    ↓
Create ReadableStream wrapper around Groq response
    ↓
Send raw text (not JSON) back to client
```

### 3. Client Receives Stream

```
Response ReadableStream starts arriving
    ↓
for each chunk in stream:
  ├─ Decode chunk as text
  ├─ useChatStream.appendToStreamContent(chunk)
  ├─ State updated: streamContent += chunk
  └─ Component re-renders with partial content
    ↓
When stream ends:
  ├─ useChatStream.completeStream()
  ├─ Create final message object
  ├─ Add to messages array
  ├─ Clear streamContent buffer
  └─ Component shows completed message
```

## Rendering Pipeline

```
┌─ User Message
│  └─ Direct text rendering
│     └─ Display in chat
│
└─ Assistant Message (Streaming)
   ├─ Token 1: "To"
   │  └─ Render: "To"
   ├─ Token 2: " create"
   │  └─ Render: "To create"
   ├─ Token 3: " a"
   │  └─ Render: "To create a"
   ├─ Token 4: " branch"
   │  └─ Render: "To create a branch"
   ├─ ... (continues until stream ends)
   │
   └─ Complete
      ├─ Pass full content to Streamdown
      ├─ Parse markdown to HTML
      └─ Render with syntax highlighting, formatting, etc.
```

## Streamdown Integration

```
Raw Markdown Text Stream
    ↓
Streamdown Receives Text
    ↓
Streamdown Processes:
  ├─ Code blocks → syntax highlighted
  ├─ Tables → formatted table HTML
  ├─ Lists → proper list structure
  ├─ Bold/italic → semantic tags
  ├─ Links → clickable anchors
  ├─ Inline code → styled code spans
  └─ Headings → semantic heading tags
    ↓
Streamdown Outputs: HTML
    ↓
Browser Renders: Pretty Formatted Content
```

## Error Handling Flow

```
Network Error
    ├─ Request fails
    ├─ catch() in handleSubmit
    ├─ Check if AbortError (user-initiated)
    ├─ If not: show toast notification
    └─ State remains consistent
    
API Error
    ├─ API returns non-200
    ├─ throw error
    ├─ catch() handles
    └─ User sees error message
    
Stream Interruption
    ├─ User closes tab or clicks away
    ├─ abortController.abort() called
    ├─ Stream stops
    ├─ State updated
    └─ UI reflects final state
```

## State Management Lifecycle

```
Initial State
├─ messages: []
├─ isLoading: false
├─ streamContent: ""
└─ Ready for input

User Sends Message
├─ addMessage(userMsg) → messages: [userMsg]
├─ addMessage(assistantMsg, isStreaming: true)
├─ isLoading: true
└─ streamContent: ""

Streaming In Progress
├─ appendToStreamContent(chunk) each frame
├─ streamContent accumulates
├─ isLoading: true
└─ Component re-renders with partial content

Stream Complete
├─ completeStream()
├─ Final message added to messages[]
├─ streamContent: "" (cleared)
├─ isLoading: false
└─ Chat ready for next message

User Gives Feedback
├─ updateMessageFeedback(id, "like"|"dislike")
├─ messages[id].feedback = type
└─ Component shows feedback state
```

## Performance Optimizations

```
Rendering Optimization
├─ Token-by-token update = many small re-renders
├─ But each re-render is fast (just append text)
└─ Result: Smooth progressive rendering

Memory Optimization
├─ streamContent buffer temporary
├─ Cleared after stream complete
├─ Old messages kept in array
├─ Can implement message limit if needed

API Optimization
├─ Stream chunking happens naturally
├─ No polling needed
├─ Single connection for entire response
└─ Efficient use of bandwidth

UI Optimization
├─ Memoized callbacks prevent re-renders
├─ CSS animations for cursor (GPU accelerated)
├─ Auto-scroll uses scrollIntoView (efficient)
└─ Minimal DOM manipulation
```

## Security Considerations

```
Input Sanitization
├─ User input trimmed: input.trim()
├─ Length limited: .slice(0, 10000)
└─ No HTML parsing (text-only)

System Prompt Protection
├─ Stored server-side (lib/ai/system-prompts.ts)
├─ Not exposed to client
├─ Only sent to Groq API
└─ User can't modify

Markdown Rendering
├─ Streamdown handles safely
├─ No arbitrary HTML execution
├─ Links validated before clicking
└─ Images from safe sources only

CORS & Authentication
├─ API calls include credentials if needed
├─ CORS headers set appropriately
└─ Rate limiting recommended for production
```

## Scalability Considerations

```
Message History
├─ Currently: In-memory (useState)
├─ To scale: Add database storage
│  └─ Save messages on create/feedback
├─ To improve: Pagination
│  └─ Load older messages on scroll up
└─ To persist: IndexedDB or API

Multiple Conversations
├─ Add conversation ID to routing
├─ Store conversation metadata
└─ Switch between active conversations

User-Specific Data
├─ Add authentication check
├─ Store user ID with messages
├─ Fetch only user's messages
└─ Implement privacy controls

Caching & Optimization
├─ Cache system prompts
├─ Memoize expensive computations
├─ Lazy load components if needed
└─ Monitor performance metrics
```

## Extension Points

```
System Prompt
├─ Easy: Edit lib/ai/system-prompts.ts
├─ Advanced: Dynamic prompts based on context
└─ Custom: Multi-prompt support per feature

Message Processing
├─ Pre-send: Validate/transform user input
├─ Post-receive: Parse/format response
└─ Custom: Add specialized parsing

UI Components
├─ Theme: Override colors in tailwind config
├─ Style: Edit component files
└─ Extend: Add new components to ai-chat folder

API Behavior
├─ Model: Change in app/api/chat/route.ts
├─ Parameters: Adjust temperature, tokens, etc.
└─ Context: Modify repo scanning logic
```

---

## See Also

- [README.md](./README.md) - Feature overview
- [COMPONENTS.md](./COMPONENTS.md) - Component details
- [API.md](./API.md) - API reference
- [QUICKSTART.md](./QUICKSTART.md) - Getting started
