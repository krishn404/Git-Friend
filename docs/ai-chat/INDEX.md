# AI Chat Interface Documentation

Complete reference for the Streamdown-native AI Chat system.

## Documentation Structure

```
docs/ai-chat/
├── INDEX.md           # This file - Overview and navigation
├── README.md          # Feature overview and architecture
├── QUICKSTART.md      # Setup and basic usage
├── API.md             # API endpoint documentation
├── COMPONENTS.md      # UI components reference
└── ARCHITECTURE.md    # System design deep-dive (optional)
```

## Quick Navigation

### For Users
- **Getting Started?** → [QUICKSTART.md](./QUICKSTART.md)
- **Want to know features?** → [README.md](./README.md)

### For Developers
- **Building with components?** → [COMPONENTS.md](./COMPONENTS.md)
- **Integrating the API?** → [API.md](./API.md)
- **Understanding the system?** → [README.md](./README.md)

### For Architects
- **System design?** → [README.md](./README.md) - Architecture section
- **File organization?** → [README.md](./README.md) - File Structure section

## File Structure

```
components/ai-chat/
├── index.tsx                  # Centralized exports
├── streamdown-message.tsx     # Message renderer
├── stream-cursor.tsx          # Streaming indicator
└── chat-container.tsx         # Message list

app/ai-chat/
├── page.tsx                   # Chat interface
└── loading.tsx                # Loading state

app/api/chat/
└── route.ts                   # Streaming API

lib/ai/
├── system-prompts.ts          # Prompt configuration
└── utils.ts                   # Helper functions

hooks/
└── use-chat-stream.ts         # State management

docs/ai-chat/
└── *.md                       # Documentation
```

## Key Concepts

### 1. Streamdown-Native
- Uses `@vercel/streamdown` for markdown rendering
- No custom markdown parsing
- Token-by-token streaming support
- Native support for code, tables, lists, etc.

### 2. Streaming-First Design
- Messages stream token-by-token from API
- Partial rendering as content arrives
- Smooth visual updates
- Blinking cursor indicator

### 3. Component Architecture
- Separation of concerns (UI/API/State)
- Composable components
- Centralized exports
- Memoized for performance

### 4. API Integration
- Raw text streaming (not JSON-wrapped)
- Groq LLM backend
- Optional repository context
- Error handling and recovery

## Common Workflows

### Starting a New Chat
1. User enters message in input field
2. Message sent to `/api/chat` endpoint
3. Response streams back as raw markdown
4. Streamdown renders markdown to HTML
5. Message appears in chat with blinking cursor
6. When complete, cursor stops and content solidifies

### Adding Feedback
1. User hovers over assistant message
2. Like/dislike buttons fade in
3. User clicks feedback button
4. State updates and toast confirmation appears
5. Feedback recorded in message object

### Customizing Behavior
1. Edit `lib/ai/system-prompts.ts` for prompt
2. Edit `components/ai-chat/` for styling
3. Edit `app/api/chat/route.ts` for API behavior
4. Components auto-recompile on save

## API Overview

**Endpoint:** `POST /api/chat`

**Request:**
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "repoUrl": "https://github.com/owner/repo"
}
```

**Response:** Streamed text (Streamdown-compatible markdown)

See [API.md](./API.md) for full documentation.

## Component API

### StreamdownMessage
Renders single message (user or assistant).

### StreamCursor
Blinking cursor during streaming.

### ChatContainer
Auto-scrolling message list.

See [COMPONENTS.md](./COMPONENTS.md) for full API.

## State Management

**Hook:** `useChatStream()`

Manages:
- Message list
- Streaming state
- Stream buffer
- Feedback tracking

See [README.md](./README.md) - State Management section.

## Styling & Theming

- User messages: Primary color, right-aligned
- Assistant messages: Card background, left-aligned
- Responsive design for mobile/desktop
- Dark mode support via CSS variables

Edit `app/globals.css` for global styles or component files for scoped styles.

## Performance

- Token-by-token rendering (no full re-renders)
- Memoized callbacks
- Abort controller for request cancellation
- Efficient scroll behavior
- Minimal bundle overhead (Streamdown only)

## Troubleshooting

### Chat not appearing
- Check `/api/chat` responds correctly
- Verify `GROQ_API_KEY` is set
- Check browser console for errors

### Streaming is slow
- Verify network connection
- Check API response times
- Monitor Groq service status

### Styling issues
- Clear `.next` cache
- Restart dev server
- Verify Tailwind config

See [QUICKSTART.md](./QUICKSTART.md) - Troubleshooting for more.

## Development Checklist

Before deploying:
- [ ] System prompt aligned with brand voice
- [ ] Error messages user-friendly
- [ ] Mobile styling tested
- [ ] Streaming works smoothly
- [ ] Feedback buttons functional
- [ ] Copy-to-clipboard works
- [ ] Accessibility features enabled
- [ ] Environment variables set

## Contributing

### Adding Features
1. Create component in `components/ai-chat/`
2. Export from `components/ai-chat/index.tsx`
3. Update documentation
4. Test streaming behavior
5. Submit PR

### Updating Docs
1. Edit relevant `.md` file
2. Keep examples current
3. Link between related docs
4. Validate code examples

### Bug Fixes
1. Identify root cause
2. Add test case
3. Fix in appropriate file
4. Update if documentation affected

## Related Documentation

- **Main README** - Project overview
- **API Documentation** - Backend details
- **Contributing Guide** - Development standards
- **Architecture** - System design (optional deep-dive)

## Version History

### v1.0 (Current)
- Streamdown-native rendering
- Token-by-token streaming
- Feedback system
- Mobile responsive
- Dark mode support
- Complete documentation

## License

See root LICENSE file.

## Support

For issues:
1. Check troubleshooting guides
2. Review relevant documentation
3. Check API responses
4. Enable debug logging
5. Open issue with context

## Next Steps

1. Read [QUICKSTART.md](./QUICKSTART.md) to get started
2. Review [README.md](./README.md) for features
3. Check [API.md](./API.md) for integration
4. Reference [COMPONENTS.md](./COMPONENTS.md) for components
5. Customize as needed
