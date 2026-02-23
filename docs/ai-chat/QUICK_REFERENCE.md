# AI Chat - Quick Reference Card

Fast lookup for common tasks and locations.

## Where Are Things?

| What | Where |
|------|-------|
| Chat UI Components | `components/ai-chat/` |
| System Prompt | `lib/ai/system-prompts.ts` |
| AI Utilities | `lib/ai/utils.ts` |
| Chat State Hook | `hooks/use-chat-stream.ts` |
| Chat API Endpoint | `app/api/chat/route.ts` |
| Chat Page | `app/ai-chat/page.tsx` |
| Documentation Index | `docs/ai-chat/INDEX.md` |
| Setup Guide | `docs/ai-chat/QUICKSTART.md` |
| API Reference | `docs/ai-chat/API.md` |
| Component Reference | `docs/ai-chat/COMPONENTS.md` |
| Architecture | `docs/ai-chat/ARCHITECTURE.md` |

## Common Tasks

### Change the AI Behavior
```
Edit: lib/ai/system-prompts.ts
Change: GIT_FRIEND_SYSTEM_PROMPT constant
```

### Add a UI Component
```
Create: components/ai-chat/new-component.tsx
Export: Add to components/ai-chat/index.tsx
Import: import { NewComponent } from "@/components/ai-chat"
```

### Modify Message Styling
```
Edit: components/ai-chat/streamdown-message.tsx
Change: className properties for user/assistant messages
```

### Change API Behavior
```
Edit: app/api/chat/route.ts
Modify: model, temperature, max_tokens, etc.
```

### Add New Chat Feature
```
1. Create components in components/ai-chat/
2. Export from components/ai-chat/index.tsx
3. Import in app/ai-chat/page.tsx
4. Use useChatStream hook for state
```

## Quick Imports

### Components
```typescript
import { StreamdownMessage, ChatContainer, StreamCursor } from "@/components/ai-chat"
```

### State
```typescript
import { useChatStream } from "@/hooks/use-chat-stream"
```

### Config
```typescript
import { SYSTEM_MESSAGE, GIT_FRIEND_SYSTEM_PROMPT } from "@/lib/ai/system-prompts"
import { sanitizeUserInput, extractCodeBlocks, generateMessageId } from "@/lib/ai/utils"
```

## API Endpoints

### Chat Streaming
```
POST /api/chat
Content-Type: application/json

Request:
{
  "messages": [{ "role": "user", "content": "..." }],
  "repoUrl": "https://github.com/owner/repo" // optional
}

Response:
Stream of raw text (Streamdown markdown)
```

## Component Props

### StreamdownMessage
```typescript
<StreamdownMessage
  role="assistant" | "user"
  content={string}
  isStreaming={boolean}
  feedback={null | "like" | "dislike"}
  onFeedback={(type) => void}
/>
```

### ChatContainer
```typescript
<ChatContainer
  ref={containerRef}
  autoScroll={boolean}
  className={string}
>
  {children}
</ChatContainer>
```

### StreamCursor
```typescript
<StreamCursor
  size="sm" | "md" | "lg"
  className={string}
/>
```

## State Hook Usage

```typescript
const {
  messages,              // StreamingMessage[]
  isLoading,            // boolean
  streamContent,        // string (buffer)
  addMessage,           // (msg) => void
  appendToStreamContent,// (chunk) => void
  completeStream,       // () => void
  updateMessageFeedback,// (id, type) => void
  clearMessages,        // () => void
} = useChatStream()
```

## File Structure

```
components/ai-chat/
  ├── index.tsx                    ← Export here
  ├── streamdown-message.tsx       ← Message renderer
  ├── stream-cursor.tsx            ← Loading indicator
  └── chat-container.tsx           ← Message list

lib/ai/
  ├── system-prompts.ts            ← Prompts & config
  └── utils.ts                     ← Types & helpers

app/ai-chat/
  ├── page.tsx                     ← Main interface
  └── loading.tsx                  ← Loading state

docs/ai-chat/
  └── *.md                         ← Documentation
```

## Key Concepts

| Concept | Meaning |
|---------|---------|
| Streamdown | Markdown rendering library for streaming content |
| Token-by-token | Streaming one chunk at a time for live updates |
| Barrel Export | `index.tsx` that exports multiple items |
| System Prompt | AI instructions sent with every request |
| StreamContent Buffer | Temporary string collecting stream chunks |
| Feedback | User's like/dislike on responses |

## Common Patterns

### Render Messages
```tsx
{messages.map(msg => (
  <StreamdownMessage
    key={msg.id}
    role={msg.role}
    content={msg.content}
    feedback={msg.feedback}
    onFeedback={handleFeedback}
  />
))}
```

### Handle Streaming
```tsx
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ messages })
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  appendToStreamContent(decoder.decode(value, { stream: true }))
}
```

### Use Chat State
```tsx
const { messages, isLoading, streamContent, addMessage } = useChatStream()

const handleSend = async (msg) => {
  addMessage({ role: 'user', content: msg })
  // ... send to API
}
```

## Environment Variables

```env
GROQ_API_KEY=your_key_here
```

## Debugging

### Enable Logging
```typescript
console.log("[v0] Stream chunk:", chunk)
console.log("[v0] Messages:", messages)
console.log("[v0] Stream content:", streamContent)
```

### Check Network
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "chat"
4. See request/response

### Verify Imports
```typescript
// ✓ Correct
import { StreamdownMessage } from "@/components/ai-chat"

// ✗ Wrong
import { StreamdownMessage } from "@/components/ui/streamdown-message"
```

## Performance Tips

1. Memoize callbacks to prevent re-renders
2. Use key prop on list items
3. Limit message history if needed
4. Monitor stream chunk size
5. Test on slow networks

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Components not found | Check import path: `@/components/ai-chat` |
| System prompt not used | Verify in `lib/ai/system-prompts.ts` |
| Stream not working | Check API response in Network tab |
| Styling looks wrong | Clear `.next` cache, restart server |
| Messages not appearing | Check console for errors |

## Documentation Map

```
Getting Started?
  └─ QUICKSTART.md

Want Details?
  ├─ README.md (overview)
  ├─ API.md (API details)
  ├─ COMPONENTS.md (UI)
  └─ ARCHITECTURE.md (system design)

How It's Organized?
  ├─ STRUCTURE.md (project structure)
  └─ INDEX.md (doc navigation)

Need to Verify?
  └─ VERIFICATION.md (checklist)
```

## Key Files at a Glance

### Edit for AI Behavior
📝 `lib/ai/system-prompts.ts` - Change GIT_FRIEND_SYSTEM_PROMPT

### Edit for Styling
🎨 `components/ai-chat/streamdown-message.tsx` - Change className

### Edit for API Logic
⚙️ `app/api/chat/route.ts` - Change model, parameters

### Edit for Flow
💻 `app/ai-chat/page.tsx` - Change page logic

### View for Documentation
📚 `docs/ai-chat/INDEX.md` - Documentation hub

## Testing Checklist

- [ ] Chat loads without errors
- [ ] Can type and send message
- [ ] Response streams in real-time
- [ ] Code blocks display correctly
- [ ] Feedback buttons work
- [ ] Mobile view responsive
- [ ] No console errors
- [ ] Copy-to-clipboard works

## URLs to Know

| URL | Purpose |
|-----|---------|
| `/ai-chat` | Chat interface |
| `/api/chat` | Chat API endpoint |
| `docs/ai-chat/` | Documentation |

## Resources

- [Streamdown Docs](https://streamdown.ai/docs)
- [Groq API](https://console.groq.com/docs)
- [Next.js Streaming](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)
- [Tailwind CSS](https://tailwindcss.com)

## Command Reference

```bash
# Development
npm run dev

# Build
npm run build

# Lint (if configured)
npm run lint

# Type check (if configured)
npm run typecheck
```

## Git Workflow

```bash
# Update imports when moving files
git add -A
git commit -m "refactor: reorganize ai-chat components"
```

## Rate Limiting

- No built-in rate limit
- Recommend: Add at infrastructure level
- Consider: User-based quotas

## Deployment

1. Set `GROQ_API_KEY` env var
2. No database required
3. No special configuration needed
4. Ready for Vercel deployment

## Support

- Check documentation first
- Read QUICKSTART.md for setup
- See ARCHITECTURE.md for system details
- Review VERIFICATION.md checklist

---

**Last Updated:** 2026-02-23
**Status:** Complete ✓
**Ready for Production:** Yes
