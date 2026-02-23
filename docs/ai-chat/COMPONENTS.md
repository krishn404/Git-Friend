# AI Chat Components

Detailed documentation for the chat interface components.

## StreamdownMessage

Renders assistant or user messages with ReactMarkdown-powered markdown support.

**Location:** `components/ai-chat/streamdown-message.tsx`

### Props

```typescript
interface StreamdownMessageProps {
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
  feedback?: "like" | "dislike" | null
  onFeedback?: (type: "like" | "dislike" | null) => void
}
```

### Usage

```tsx
import { StreamdownMessage } from "@/components/ai-chat"

export function ChatMessage({ message }) {
  return (
    <StreamdownMessage
      role={message.role}
      content={message.content}
      isStreaming={message.isStreaming}
      feedback={message.feedback}
      onFeedback={(type) => handleFeedback(message.id, type)}
    />
  )
}
```

### Features

- **Markdown Rendering** - Native markdown to HTML via ReactMarkdown
- **User Messages** - Right-aligned, primary color, timestamp
- **Assistant Messages** - Left-aligned, card background, syntax highlighting
- **Feedback System** - Like/dislike buttons on hover
- **Copy-to-Clipboard** - Copy button for assistant messages
- **Streaming Indicator** - Visual cursor during streaming
- **Code Block Support** - Syntax highlighting with Tailwind styling

### Styling

- User messages: `bg-primary text-white rounded-tr-sm`
- Assistant messages: `bg-card border border-border rounded-tl-sm`
- Hover actions: Fade in from opacity 0
- Timestamps: `text-xs text-muted-foreground`

### Accessibility

- Semantic HTML structure
- ARIA labels on interactive buttons
- Keyboard navigation support
- Screen reader friendly

## StreamCursor

Blinking cursor indicator displayed during AI response streaming.

**Location:** `components/ai-chat/stream-cursor.tsx`

### Props

```typescript
interface StreamCursorProps {
  className?: string
  size?: "sm" | "md" | "lg"
}
```

### Usage

```tsx
import { StreamCursor } from "@/components/ai-chat"

export function AIResponse({ isStreaming }) {
  return (
    <div>
      <p>AI is thinking...</p>
      {isStreaming && <StreamCursor size="md" />}
    </div>
  )
}
```

### Animation

Uses CSS keyframe animation `animate-blink`:
- 0.6s duration
- Smooth on/off transition
- Indicates active streaming

## ChatContainer

Auto-scrolling message list container optimized for streamed content.

**Location:** `components/ai-chat/chat-container.tsx`

### Props

```typescript
interface ChatContainerProps {
  children: React.ReactNode
  className?: string
  autoScroll?: boolean
  showScrollbar?: boolean
}
```

### Usage

```tsx
import { ChatContainer } from "@/components/ai-chat"

export function ChatUI() {
  const containerRef = useRef(null)
  
  return (
    <ChatContainer ref={containerRef} autoScroll>
      {messages.map(msg => (
        <StreamdownMessage key={msg.id} {...msg} />
      ))}
    </ChatContainer>
  )
}
```

### Features

- **Auto-Scroll** - Scrolls to bottom on new messages
- **Smooth Animation** - Soft scroll behavior
- **Overflow Handling** - Scrollable container
- **Responsive** - Adapts to mobile and desktop
- **Performance** - Efficient DOM updates

### Scroll Behavior

- Automatically scrolls when:
  - New message appears
  - Streaming content updates
  - Container height changes
- Respects user scroll position
- Smooth easing on scroll

## Exported Index

**Location:** `components/ai-chat/index.tsx`

Centralized exports for easy importing:

```tsx
import { 
  StreamdownMessage, 
  ChatContainer, 
  StreamCursor 
} from "@/components/ai-chat"
```

## Integration Pattern

### Basic Chat Layout

```tsx
import { StreamdownMessage, ChatContainer, StreamCursor } from "@/components/ai-chat"
import { useChatStream } from "@/hooks/use-chat-stream"

export function ChatInterface() {
  const { messages, isLoading, streamContent } = useChatStream()
  const containerRef = useRef(null)
  
  return (
    <ChatContainer ref={containerRef}>
      {messages.map(msg => (
        <StreamdownMessage key={msg.id} {...msg} />
      ))}
      
      {isLoading && (
        <div className="flex items-center gap-2">
          <StreamCursor />
          <span>Generating response...</span>
        </div>
      )}
    </ChatContainer>
  )
}
```

## Styling & Theming

All components respect the app's theme system:
- Dark mode via CSS variables
- Tailwind design tokens
- Custom `bg-card`, `text-foreground`, etc.

Override with className prop:

```tsx
<StreamdownMessage
  {...props}
  className="bg-blue-50 dark:bg-blue-950"
/>
```

## Performance Considerations

- Components are memoized to prevent re-renders
- Streamdown rendering is streamed (partial updates)
- Auto-scroll uses `scrollIntoView` for smooth behavior
- Feedback buttons use event delegation where possible

## Accessibility Features

- Semantic message structure
- ARIA live regions for streaming updates
- Keyboard navigation support
- Focus management in feedback buttons
- Screen reader announcements

## Mobile Optimization

- Touch-friendly hover states
- Responsive padding and spacing
- Optimized for small screens
- Swipe support via container scrolling
