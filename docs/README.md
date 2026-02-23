# GitFriend Documentation Hub

Welcome to the complete GitFriend documentation. This hub provides access to all project documentation organized by feature.

## Project Overview

GitFriend is an AI-powered assistant specializing in Git and GitHub. It features:
- Streamdown-native chat interface with real-time streaming
- Repository analysis and context-aware assistance
- Git and GitHub expertise
- Production-grade architecture

## Main Documentation

### Project Structure & Organization
- **[STRUCTURE.md](../STRUCTURE.md)** - Project folder organization and file structure
- **[ORGANIZATION_COMPLETE.md](../ORGANIZATION_COMPLETE.md)** - Reorganization summary

### AI Chat Interface (Primary Feature)

Start here for AI Chat documentation:

#### Quick Navigation
- **[Quick Reference](./ai-chat/QUICK_REFERENCE.md)** - Fast lookup for common tasks
- **[Quick Start](./ai-chat/QUICKSTART.md)** - Setup and basic usage
- **[Documentation Index](./ai-chat/INDEX.md)** - All AI Chat docs organized

#### Complete Guides
- **[README](./ai-chat/README.md)** - Feature overview and architecture
- **[API Reference](./ai-chat/API.md)** - Full API endpoint documentation
- **[Components](./ai-chat/COMPONENTS.md)** - UI components reference
- **[Architecture](./ai-chat/ARCHITECTURE.md)** - System design and data flow
- **[Verification](./ai-chat/VERIFICATION.md)** - Complete verification checklist

## File Structure at a Glance

```
GitFriend/
├── app/
│   ├── ai-chat/              ← Chat interface
│   ├── generate-readme/      ← README generator
│   ├── git-mojis/            ← Git Moji browser
│   └── api/
│       ├── chat/             ← Chat API
│       ├── generate-readme/  ← README API
│       └── ...
│
├── components/
│   ├── ai-chat/              ← Chat components (organized)
│   ├── landing/              ← Landing components
│   └── ui/                   ← Base UI components
│
├── lib/
│   ├── ai/                   ← AI utilities (NEW)
│   ├── github.ts             ← GitHub integration
│   └── ...
│
├── docs/
│   ├── ai-chat/              ← AI Chat docs (complete)
│   └── README.md             ← This file
│
└── [Config files]
```

## Key Features

### AI Chat Interface
- Streamdown-native markdown rendering
- Token-by-token streaming for live responses
- Repository context awareness
- User feedback system (like/dislike)
- Dark mode support
- Mobile responsive

**Location:** `/ai-chat`
**Entry Point:** `docs/ai-chat/QUICKSTART.md`

### README Generator
Generate professional READMEs for your projects.

**Location:** `/generate-readme`
**Entry Point:** `app/generate-readme/page.tsx`

### Git Moji Browser
Browse and search git emojis for commit messages.

**Location:** `/git-mojis`
**Entry Point:** `app/git-mojis/page.tsx`

## Quick Start

### For Using the App
1. Navigate to `/ai-chat` to start chatting
2. Ask about Git and GitHub topics
3. View responses with syntax highlighting

### For Development
1. Read [STRUCTURE.md](../STRUCTURE.md) for project organization
2. Go to [ai-chat/QUICKSTART.md](./ai-chat/QUICKSTART.md) for setup
3. Reference [ai-chat/COMPONENTS.md](./ai-chat/COMPONENTS.md) for components

### For Integration
1. Check [ai-chat/API.md](./ai-chat/API.md) for API documentation
2. See [ai-chat/ARCHITECTURE.md](./ai-chat/ARCHITECTURE.md) for system design

## Common Paths

### Components
```
Where are chat components?
  → components/ai-chat/

How do I create a new component?
  → Create in components/[feature-name]/, export from index.tsx

What base UI components are available?
  → components/ui/
```

### Configuration
```
How do I change the AI's behavior?
  → Edit lib/ai/system-prompts.ts

How do I customize API behavior?
  → Edit app/api/chat/route.ts

Where are utilities?
  → lib/ai/utils.ts or lib/[feature]/utils.ts
```

### APIs
```
What's the chat API endpoint?
  → POST /api/chat (see api-chat/API.md)

How do I stream responses?
  → See docs/ai-chat/API.md for examples

What environment variables do I need?
  → See .env.local (GROQ_API_KEY required)
```

## Documentation for Different Roles

### For Users
1. **Just want to use it?** → Go to `/ai-chat`
2. **Want to know features?** → Read [ai-chat/README.md](./ai-chat/README.md)

### For Developers
1. **New to the project?** → Read [STRUCTURE.md](../STRUCTURE.md)
2. **Want to add features?** → See [ai-chat/COMPONENTS.md](./ai-chat/COMPONENTS.md)
3. **Need to fix bugs?** → Check [ai-chat/ARCHITECTURE.md](./ai-chat/ARCHITECTURE.md)

### For API Integrators
1. **Need API docs?** → Read [ai-chat/API.md](./ai-chat/API.md)
2. **Want examples?** → See [ai-chat/QUICKSTART.md](./ai-chat/QUICKSTART.md)

### For Architects
1. **System design?** → Read [ai-chat/ARCHITECTURE.md](./ai-chat/ARCHITECTURE.md)
2. **Project structure?** → Read [STRUCTURE.md](../STRUCTURE.md)
3. **Scalability?** → See [ai-chat/ARCHITECTURE.md](./ai-chat/ARCHITECTURE.md) - Extension Points

## Organization Pattern

The project uses a **feature-based organization pattern**:

```
[Feature Name]/
├── components/[feature]/     ← Feature-specific components
│   ├── index.tsx            ← Barrel export
│   └── component.tsx
├── app/[feature]/           ← Feature pages
│   ├── page.tsx             ← Main page
│   └── loading.tsx          ← Loading state
├── app/api/[feature]/       ← Feature API routes
│   └── route.ts
├── lib/[feature]/           ← Feature utilities
│   └── utils.ts
└── docs/[feature]/          ← Feature documentation
    └── *.md
```

This pattern is applied to:
- **ai-chat** - AI chat interface with complete docs
- **landing** - Landing page with components
- **readme** - README generation feature

## Environment Setup

### Required Environment Variables
```env
GROQ_API_KEY=your_api_key_here
```

### Optional
```env
GITHUB_TOKEN=for_enhanced_features
```

See individual feature docs for more details.

## Key Technologies

- **Next.js** - Framework
- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Streamdown** - Markdown rendering (AI Chat)
- **Groq** - LLM backend (AI Chat)
- **Shadcn/UI** - Component library

## Documentation Files by Purpose

### Getting Started
- [STRUCTURE.md](../STRUCTURE.md) - Project organization
- [ai-chat/QUICKSTART.md](./ai-chat/QUICKSTART.md) - Setup guide

### Development
- [ai-chat/COMPONENTS.md](./ai-chat/COMPONENTS.md) - Component API
- [ai-chat/ARCHITECTURE.md](./ai-chat/ARCHITECTURE.md) - System design

### Integration
- [ai-chat/API.md](./ai-chat/API.md) - API endpoint
- [ai-chat/README.md](./ai-chat/README.md) - Feature overview

### Reference
- [ai-chat/QUICK_REFERENCE.md](./ai-chat/QUICK_REFERENCE.md) - Quick lookup
- [ai-chat/VERIFICATION.md](./ai-chat/VERIFICATION.md) - Checklist

## Troubleshooting

### Can't find something?
1. Check [ai-chat/QUICK_REFERENCE.md](./ai-chat/QUICK_REFERENCE.md) - Fast lookup
2. Search for filename in [STRUCTURE.md](../STRUCTURE.md)
3. Review [ORGANIZATION_COMPLETE.md](../ORGANIZATION_COMPLETE.md) - What changed

### Setup issues?
1. Follow [ai-chat/QUICKSTART.md](./ai-chat/QUICKSTART.md)
2. Check [ai-chat/VERIFICATION.md](./ai-chat/VERIFICATION.md)
3. Review [ai-chat/API.md](./ai-chat/API.md) - Error handling

### Development questions?
1. See [ai-chat/COMPONENTS.md](./ai-chat/COMPONENTS.md) for components
2. See [ai-chat/ARCHITECTURE.md](./ai-chat/ARCHITECTURE.md) for system
3. Check [ai-chat/README.md](./ai-chat/README.md) for features

## Contributing

Before contributing:
1. Read [STRUCTURE.md](../STRUCTURE.md) for organization
2. Follow the feature-based pattern
3. Add documentation in `docs/[feature]/`
4. Update this README if adding new features

## License

See LICENSE file in project root.

## Support

### For Issues
1. Check relevant documentation
2. Review [ai-chat/QUICK_REFERENCE.md](./ai-chat/QUICK_REFERENCE.md)
3. Check troubleshooting sections
4. Open issue with context

### For Questions
1. Start with Quick Reference
2. Read feature README
3. Check QUICKSTART guide
4. Review API or Architecture docs

## Roadmap

### Current (v1.0)
- [x] Streamdown-native chat interface
- [x] Token-by-token streaming
- [x] Complete documentation
- [x] Feature-based organization

### Planned
- [ ] Conversation persistence
- [ ] Message search
- [ ] Export to markdown/PDF
- [ ] Custom system prompts per conversation

## Version History

### v1.0 (Current)
- Streamdown-native rendering
- Feature-based organization
- Complete documentation
- Production-ready

## Resources

- [Streamdown](https://streamdown.ai)
- [Next.js](https://nextjs.org)
- [React](https://react.dev)
- [TypeScript](https://typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Groq API](https://console.groq.com)

## Navigation

```
Start Here
    │
    ├─→ Users: Go to /ai-chat
    ├─→ Developers: Read STRUCTURE.md
    ├─→ API Users: Read ai-chat/API.md
    └─→ Questions: Check ai-chat/QUICK_REFERENCE.md

AI Chat Docs
    │
    ├─→ Quick Start: ai-chat/QUICKSTART.md
    ├─→ API Reference: ai-chat/API.md
    ├─→ Components: ai-chat/COMPONENTS.md
    ├─→ Architecture: ai-chat/ARCHITECTURE.md
    ├─→ Quick Ref: ai-chat/QUICK_REFERENCE.md
    ├─→ Verify: ai-chat/VERIFICATION.md
    └─→ Index: ai-chat/INDEX.md

Project Docs
    │
    ├─→ Structure: STRUCTURE.md
    ├─→ Changes: REORGANIZATION_SUMMARY.md
    └─→ Status: ORGANIZATION_COMPLETE.md
```

---

**Last Updated:** February 23, 2026
**Status:** Complete and Production-Ready ✓

For quick answers, try [ai-chat/QUICK_REFERENCE.md](./ai-chat/QUICK_REFERENCE.md).
For setup, try [ai-chat/QUICKSTART.md](./ai-chat/QUICKSTART.md).
For everything else, see [ai-chat/INDEX.md](./ai-chat/INDEX.md).
