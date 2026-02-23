# Project Structure Overview

Organized folder structure for scalable, maintainable codebase.

## Directory Organization

### Root Level

```
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
├── context/               # React contexts
├── docs/                  # Documentation
├── hooks/                 # React hooks
├── lib/                   # Utilities and helpers
├── public/                # Static assets
├── scripts/               # Automation scripts
├── .env.local             # Local environment variables
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind config
└── STRUCTURE.md           # This file
```

## app/ - Next.js Routes

```
app/
├── page.tsx                    # Landing page (/)
├── layout.tsx                  # Root layout
├── globals.css                 # Global styles
├── ai-chat/
│   ├── page.tsx                # Chat interface (/ai-chat)
│   └── loading.tsx             # Loading state
├── generate-readme/
│   └── page.tsx                # README generator
├── git-mojis/
│   ├── page.tsx                # Git Moji browser
│   └── loading.tsx
├── api/
│   ├── chat/
│   │   └── route.ts            # Chat streaming API
│   ├── generate-readme/
│   │   └── route.ts
│   ├── apply-readme/
│   │   └── route.ts
│   ├── fetch-repo-data/
│   │   └── route.ts
│   ├── git-moji/
│   │   └── route.ts
│   ├── gitmojis/
│   │   └── route.ts
│   ├── github/
│   │   ├── branches/
│   │   │   └── route.ts
│   │   └── callback/
│   │       └── route.ts
│   └── auth/
│       └── github/
│           └── callback/
│               └── route.ts
```

## components/ - UI Components

```
components/
├── ui/                         # Base UI components (shadcn)
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── navbar.tsx
│   ├── suggestion-card.tsx
│   └── ... (other base components)
├── ai-chat/                    # AI Chat components
│   ├── index.tsx               # Exports barrel
│   ├── streamdown-message.tsx  # Message renderer (Streamdown)
│   ├── stream-cursor.tsx       # Streaming indicator
│   └── chat-container.tsx      # Message list container
├── landing/                    # Landing page components
│   ├── index.tsx               # Exports barrel
│   ├── hero-section.tsx
│   ├── features.tsx
│   ├── readme-section.tsx
│   ├── how-it-works-section.tsx
│   ├── faq-section.tsx
│   ├── cta-section.tsx
│   ├── landing-footer.tsx
│   └── constants.ts
├── readme/                     # README components
│   ├── generation-status.tsx
│   └── markdown-preview.tsx
├── auth/                       # Auth components
│   ├── protected-route.tsx
│   ├── login-modal.tsx
│   └── user-auth-button.tsx
└── core/                       # Core components
    ├── accordion.tsx
    └── text-shimmer-wave.tsx
```

## lib/ - Utilities & Libraries

```
lib/
├── ai/                         # AI utilities
│   ├── system-prompts.ts       # System prompt configuration
│   └── utils.ts                # AI helpers
├── github.ts                   # GitHub integration
├── github-client.ts            # GitHub client
├── octokit.ts                  # Octokit setup
├── firebase.ts                 # Firebase config
├── redis.ts                    # Redis client
├── readme.ts                   # README utilities
├── timeout-utils.ts            # Timeout helpers
└── utils.ts                    # General utilities (cn, etc.)
```

## hooks/ - React Hooks

```
hooks/
├── use-chat-stream.ts          # Chat state management
├── use-mobile.tsx              # Mobile detection
├── use-media-query.ts          # Media query hook
└── use-toast.ts                # Toast notifications
```

## docs/ - Documentation

```
docs/
└── ai-chat/                    # AI Chat documentation
    ├── INDEX.md                # Documentation index
    ├── README.md               # Feature overview & architecture
    ├── QUICKSTART.md           # Setup & basic usage
    ├── API.md                  # API endpoint docs
    └── COMPONENTS.md           # UI components reference
```

## context/ - React Contexts

```
context/
├── auth-context.tsx            # Authentication context
└── github-auth-context.tsx     # GitHub auth context
```

## public/ - Static Assets

```
public/
├── favicon.ico
├── gitfriend-icon.png
├── icon.png
├── og.jpg
├── placeholder*.jpg
├── placeholder*.svg
└── Launch_SVG*.svg
```

## Key Organizational Patterns

### 1. Feature-Based Folders
Each feature has its own folder with related components:
- `components/ai-chat/` - All chat UI components
- `components/landing/` - All landing page components
- `components/readme/` - All README components

### 2. Barrel Exports
Folders with `index.tsx` provide clean imports:
```tsx
// ✅ Good - clear, organized
import { StreamdownMessage } from "@/components/ai-chat"

// ❌ Avoid - too specific
import StreamdownMessage from "@/components/ai-chat/streamdown-message"
```

### 3. System Prompts Centralized
All AI prompts in `lib/ai/system-prompts.ts`:
- Easy to find and modify
- Single source of truth
- Version control friendly

### 4. Utilities Organized by Domain
- `lib/ai/` - AI-specific utilities
- `lib/github.ts` - GitHub integration
- `lib/utils.ts` - General helpers

### 5. Documentation Structured
- `docs/ai-chat/INDEX.md` - Navigation hub
- Feature-specific docs in feature folder
- Code examples in docs
- Keep docs near code

## Import Path Conventions

### Absolute Paths (Preferred)
```tsx
import { Button } from "@/components/ui/button"
import { StreamdownMessage } from "@/components/ai-chat"
import { useChatStream } from "@/hooks/use-chat-stream"
import { SYSTEM_MESSAGE } from "@/lib/ai/system-prompts"
```

### TypeScript Paths (tsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## File Naming Conventions

- **Components**: `PascalCase.tsx` (e.g., `StreamdownMessage.tsx`)
- **Hooks**: `camelCase.ts/tsx` (e.g., `use-chat-stream.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `system-prompts.ts`)
- **Types**: In same file or `types.ts`
- **Constants**: `UPPER_CASE` in same file or `constants.ts`

## Module Organization

### AI Chat Module
```
Purpose: Streamdown-native chat interface
Files:
  - components/ai-chat/* (3 components)
  - hooks/use-chat-stream.ts
  - app/api/chat/route.ts
  - lib/ai/* (2 files)
  - docs/ai-chat/* (5 docs)
Entry: /ai-chat page route
```

### Landing Module
```
Purpose: Marketing & onboarding
Files:
  - components/landing/* (7+ components)
  - app/page.tsx
Entry: / home page route
```

### README Generator Module
```
Purpose: Generate project READMEs
Files:
  - components/readme/*
  - app/generate-readme/
  - app/api/generate-readme/
  - lib/readme.ts
Entry: /generate-readme route
```

### Authentication Module
```
Purpose: GitHub OAuth & user management
Files:
  - components/auth/*
  - context/auth-context.tsx
  - app/api/auth/*
  - lib/github*.ts
Entry: Integrated across app
```

## Adding New Features

### Step 1: Create Feature Folder
```bash
mkdir -p components/[feature-name]
mkdir -p docs/[feature-name]
```

### Step 2: Add Components
```
components/[feature-name]/
├── index.tsx (exports)
├── component-1.tsx
├── component-2.tsx
└── types.ts (if needed)
```

### Step 3: Add API Routes (if needed)
```
app/api/[feature-name]/
└── route.ts
```

### Step 4: Add Documentation
```
docs/[feature-name]/
├── README.md
└── API.md (if API exists)
```

### Step 5: Create Entry Page
```
app/[feature-name]/
├── page.tsx
└── loading.tsx (if needed)
```

## Performance Optimization

- Components split into small, focused modules
- Lazy loading where applicable
- Tree-shakeable exports via barrel files
- Minimal dependencies per module
- Efficient import paths

## Scalability Notes

This structure supports:
- **Multiple teams** - Clear feature boundaries
- **Feature flags** - Easy to toggle components
- **Code splitting** - Natural module boundaries
- **Testing** - Isolated, testable modules
- **Maintenance** - Related files co-located
- **Documentation** - Docs near features

## Migration Guide

If moving existing code:

1. **From old structure** → Move to feature folders
2. **Update imports** → Use new paths
3. **Create barrel exports** → Add `index.tsx`
4. **Document changes** → Add to `docs/` folder
5. **Update references** → Search and replace old paths

## Related Files

- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Tailwind config
- `.env.local` - Environment variables
- `next.config.mjs` - Next.js config

## See Also

- [AI Chat Documentation](./docs/ai-chat/INDEX.md)
- Main README - Project overview
- Individual feature documentation in `docs/`
