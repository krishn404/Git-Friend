# Quick Start Guide

Get the AI Chat interface running in minutes.

## Setup

### 1. Install Dependencies

Streamdown is already added to `package.json`. Install all dependencies:

```bash
npm install
# or
pnpm install
```

### 2. Environment Variables

Ensure these are set in `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit http://localhost:3000/ai-chat

## Basic Usage

### Start a Chat

1. Navigate to `/ai-chat`
2. Type a question about Git or GitHub
3. Press Enter or click the send button
4. Watch the response stream in real-time

### Example Questions

- "How do I create a branch?"
- "What's the difference between merge and rebase?"
- "How do I resolve merge conflicts?"
- "How do I write better commit messages?"

## Architecture Overview

```
User Input
    ↓
ChatPage (app/ai-chat/page.tsx)
    ↓
useChatStream Hook (state management)
    ↓
API POST /api/chat
    ↓
Groq LLM (streaming response)
    ↓
Streamdown Components (render markdown)
    ↓
StreamdownMessage (display in chat)
```

## Key Files

| File | Purpose |
|------|---------|
| `app/ai-chat/page.tsx` | Main chat interface |
| `app/api/chat/route.ts` | Streaming API endpoint |
| `components/ai-chat/` | Chat UI components |
| `hooks/use-chat-stream.ts` | State management |
| `lib/ai/system-prompts.ts` | AI behavior config |
| `lib/ai/utils.ts` | Helper functions |

## Common Tasks

### Change System Prompt

Edit `lib/ai/system-prompts.ts`:

```typescript
export const GIT_FRIEND_SYSTEM_PROMPT = `Your custom prompt here...`
```

### Customize Component Styling

Edit component files in `components/ai-chat/`:

```tsx
// Change message colors
<div className="bg-blue-50 dark:bg-blue-950">
  {/* content */}
</div>
```

### Add Repository Context

Pass `repoUrl` to the API:

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    messages: [{ role: 'user', content: input }],
    repoUrl: 'https://github.com/owner/repo'
  })
})
```

### Handle Errors

Errors are caught and displayed as toasts:

```typescript
toast({
  title: "Error",
  description: "Failed to get response",
  variant: "destructive"
})
```

### Interrupt a Stream

Click the send button or press Escape to abort an in-flight request:

```typescript
abortControllerRef.current?.abort()
```

## Testing

### Manual Testing

1. Send various Git questions
2. Verify responses are streamed (visible in real-time)
3. Test feedback buttons (like/dislike)
4. Try copy-to-clipboard on code blocks
5. Test mobile responsiveness

### Debugging

Enable console logging to see stream chunks:

```typescript
const chunk = decoder.decode(value, { stream: true })
console.log("[v0] Stream chunk:", chunk)
```

## Performance Tips

1. **Clear Cache** - Streamdown caches compiled markdown, clear if needed
2. **Optimize Context** - Limit repo files to relevant ones
3. **Monitor Tokens** - Set max_completion_tokens appropriately
4. **Test Streaming** - Verify chunks flow smoothly in network tab

## Deployment

### To Vercel

```bash
git push origin main
```

Vercel auto-deploys on push. Ensure `GROQ_API_KEY` is set in project env vars.

### Environment Variables

Set in Vercel dashboard:
- `GROQ_API_KEY`
- Any other API keys or config

## Troubleshooting

### Chat not loading

- Check `GROQ_API_KEY` is set
- Verify API route is accessible at `/api/chat`
- Check browser console for errors

### Streaming not working

- Ensure response has `Content-Type: text/plain`
- Verify fetch is handling streams correctly
- Check network tab for chunked responses

### Styling looks wrong

- Clear Next.js cache: `rm -rf .next`
- Restart dev server
- Check Tailwind config is correct

### Components not found

- Verify imports use new paths:
  ```tsx
  import { StreamdownMessage } from "@/components/ai-chat"
  ```
- Not the old paths:
  ```tsx
  // ❌ Old - don't use
  import { StreamdownMessage } from "@/components/ui/streamdown-message"
  ```

## Next Steps

1. Customize the system prompt for your use case
2. Add conversation persistence (localStorage/database)
3. Implement message search and filtering
4. Add export to markdown/PDF
5. Create custom theme variants
6. Add voice input/output

## Resources

- [Streamdown Docs](https://streamdown.ai/docs)
- [Groq API Docs](https://console.groq.com/docs)
- [Next.js Streaming](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Support

For issues or questions:
1. Check existing docs in `docs/ai-chat/`
2. Review component props and types
3. Check API response format
4. Enable debug logging
5. Open an issue with details
