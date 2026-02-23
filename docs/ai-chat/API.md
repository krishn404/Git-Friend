# AI Chat API Documentation

## Endpoint: POST /api/chat

Streams markdown responses for Git and GitHub queries using Streamdown formatting.

### Request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "How do I create a branch?" }
    ],
    "repoUrl": "https://github.com/owner/repo"
  }'
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messages` | Array | Yes | Chat messages array with `role` and `content` |
| `repoUrl` | String | No | GitHub repo URL for context analysis |

### Response Headers

```
Content-Type: text/plain; charset=utf-8
Cache-Control: no-cache, no-transform
Connection: keep-alive
```

### Response Format

Raw text stream (not JSON-wrapped). Each chunk is a portion of the markdown response.

**Example Stream Response:**
```
To create a Git branch, use the
 `git branch` command:

```bash
git branch feature/new-feature
git checkout feature/new-feature
```

Or use the shorthand:

```bash
git checkout -b feature/new-feature
```
```

### Response Streaming

The response streams token-by-token, allowing:
- Real-time content rendering as it's generated
- Partial message display during generation
- Smooth user experience without waiting for full response

### System Prompt

The API uses a specialized system prompt configured in `lib/ai/system-prompts.ts`. The prompt instructs GitFriend to:

- Provide accurate Git and GitHub guidance
- Use markdown formatting with code blocks
- Include practical examples
- Vary tone and suggestions
- Be concise and actionable

### Repository Context

If a `repoUrl` is provided:
1. Repository is scanned for structure and content
2. Relevant files are extracted (max 100 files)
3. Context is compressed and added to system prompt
4. AI can provide context-aware suggestions

**Scanned Metadata:**
- Project structure
- README content
- Package configuration
- Source files (limited size)

### Error Handling

**400 Bad Request:**
- Missing or invalid `messages` array
- Message missing `role` or `content`

**401 Unauthorized:**
- Missing GROQ_API_KEY environment variable

**500 Internal Server Error:**
- API service failure
- Repository analysis error (non-fatal, continues without context)

### Example: Node.js Client

```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: userMessage }],
    repoUrl: 'https://github.com/vercel/next.js'
  })
})

const reader = response.body?.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value, { stream: true })
  console.log(chunk) // Process streaming chunk
}
```

### Example: React Hook

See `hooks/use-chat-stream.ts` for full implementation. Basic usage:

```tsx
const { streamContent, addMessage, appendToStreamContent } = useChatStream()

const handleSend = async (message) => {
  addMessage({ role: 'user', content: message })
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
  })
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    appendToStreamContent(decoder.decode(value, { stream: true }))
  }
}
```

### Rate Limiting

No built-in rate limiting on the endpoint. Implement at the application or infrastructure level as needed.

### Content Format

All responses use Streamdown-compatible markdown:

```markdown
## Headings
**Bold** *italic* `code` ~~strikethrough~~

```language
code block
```

- List items
1. Numbered lists

| Header | Header |
|--------|--------|
| Cell   | Cell   |

[Link text](https://example.com)
```

### Performance Considerations

- Average response time: 2-5 seconds
- Stream chunk size: Variable (typically 50-200 chars)
- Max completion tokens: 4000
- Model: openai/gpt-oss-120b (via Groq)

### Configuration

Edit `lib/ai/system-prompts.ts` to customize:
- System prompt content
- Tone and style
- Expertise areas
- Response format guidelines

Edit `app/api/chat/route.ts` to modify:
- Model selection
- Temperature and top_p
- Max tokens
- Context scanning parameters
