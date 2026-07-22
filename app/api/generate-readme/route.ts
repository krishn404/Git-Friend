import { Octokit } from "@octokit/rest"
import { Groq } from "groq-sdk"
import { type NextRequest, NextResponse } from "next/server"
import { redis, CACHE_KEYS, CACHE_TTL, type ReadmeGenerationStatus } from "@/lib/redis"
import { scanRepository, type ScannedFile, type RepoAnalysis } from "@/lib/github"
import { withTimeout } from "@/lib/timeout-utils"

// Define types and functions inline to avoid import issues
type ProjectKind = "web" | "python" | "java" | "native" | "unknown"

const BINARY_EXT =
  /\.(png|jpg|jpeg|gif|webp|svg|ico|mp4|mov|avi|mkv|mp3|wav|flac|ogg|pdf|zip|tar|gz|bz2|7z|rar|exe|dll|so|dylib|bin|psd|ai|sketch|blend|glb|gltf|ttf|otf|woff2?)$/i
const LOCKFILES = /(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|\.lock)$/i
const UNIVERSAL_IGNORES =
  /(^|\/)(node_modules|\.git|\.next|dist|build|out|target|venv|\.venv|__pycache__|\.cache|coverage|\.turbo|\.pnpm|bin|tmp|temp|logs?|datasets?|data|\.dvc|public\/uploads?)(\/|$)/i

function detectProjectKind(analysis: RepoAnalysis): ProjectKind {
  const paths = analysis.files.map((f) => f.path.toLowerCase())
  const has = (re: RegExp) => paths.some((x) => re.test(x))

  if (has(/package\.json$/) || has(/\.(tsx|jsx|html?)$/) || has(/next\.config\.(js|mjs|ts)$/)) return "web"
  if (has(/requirements\.txt$/) || has(/pyproject\.toml$/) || has(/\.py$/)) return "python"
  if (has(/pom\.xml$/) || has(/\.java$/)) return "java"
  if (has(/\.(c|cc|cpp|h|hpp|go|rs)$/) || has(/(Makefile|CMakeLists\.txt|go\.mod|Cargo\.toml)$/)) return "native"
  return "unknown"
}

function shouldIncludeByKind(kind: ProjectKind, path: string): boolean {
  const p = path.toLowerCase()
  if (p.endsWith("readme.md")) return true
  if (p.endsWith("dockerfile") || p.endsWith("docker-compose.yml") || p.endsWith(".env.example")) return true
  if (
    p.endsWith("package.json") ||
    p.endsWith("pom.xml") ||
    p.endsWith("requirements.txt") ||
    p.endsWith("pyproject.toml")
  )
    return true
  if (
    p.endsWith("tsconfig.json") ||
    p.endsWith("next.config.js") ||
    p.endsWith("next.config.mjs") ||
    p.endsWith("next.config.ts")
  )
    return true
  if (p.endsWith("go.mod") || p.endsWith("cargo.toml") || p.endsWith("cmakelists.txt") || p === "makefile") return true

  switch (kind) {
    case "web":
      return /\.(tsx|jsx|ts|js|mjs|cjs|html?|json|ya?ml|css|scss|less|toml|md)$/i.test(p) && !/\.d\.ts$/.test(p)
    case "python":
      return /\.(py|md|txt|ya?ml|toml)$/i.test(p) || p.endsWith("requirements.txt")
    case "java":
      return /\.(java|md|xml|properties|gradle)$/i.test(p) || p.endsWith("pom.xml")
    case "native":
      return (
        /\.(c|cc|cpp|h|hpp|rs|go|md|toml|txt)$/i.test(p) || /(go\.mod|Cargo\.toml|CMakeLists\.txt|Makefile)$/i.test(p)
      )
    default:
      return /\.(md|txt|json|ya?ml|toml|xml|html?|css|scss|less|js|jsx|ts|tsx|mjs|cjs|sh|bash|zsh)$/i.test(p)
  }
}

function selectRelevantFiles(kind: ProjectKind, files: ScannedFile[], maxFiles = 50) {
  const filtered = files.filter((f) => {
    const p = f.path
    if (UNIVERSAL_IGNORES.test(p)) return false
    if (LOCKFILES.test(p)) return false
    if (BINARY_EXT.test(p)) return false
    return shouldIncludeByKind(kind, p)
  })

  const score = (p: string) => {
    const l = p.toLowerCase()
    if (l.endsWith("readme.md")) return 0
    if (/(package\.json|requirements\.txt|pom\.xml)$/i.test(l)) return 1
    if (l.includes("/app/") || l.includes("/src/")) return 2
    if (l.includes("/api/") || l.includes("/lib/")) return 3
    if (l.includes("docker")) return 4
    return 5
  }

  return filtered.sort((a, b) => score(a.path) - score(b.path)).slice(0, maxFiles)
}

function buildContextBlock(analysis: RepoAnalysis, files: ScannedFile[]) {
  const meta = `Repo: ${analysis.owner}/${analysis.repo}
Name: ${analysis.repoMeta.name}
Description: ${analysis.repoMeta.description || "N/A"}
Languages: ${Object.keys(analysis.languages).join(", ") || "Unknown"}
Default Branch: ${analysis.defaultBranch}
Stars: ${analysis.repoMeta.stars}  Forks: ${analysis.repoMeta.forks}  Issues: ${analysis.repoMeta.openIssues}`

  // Limit file content to prevent context from being too large
  const parts = files.slice(0, 40).map((f) => {
    const header = `\n---\nFile: ${f.path}\n`
    const content = f.content ? f.content.slice(0, 1200) : "" // Further limit per-file content
    return header + content
  })
  return `${meta}\n\nKey Files:\n${parts.join("")}`
}

async function summarizeIfNeeded(groq: any, context: string, threshold = 15000): Promise<string> {
  if (context.length <= threshold) return context

  // For rate limiting, just truncate instead of making multiple API calls
  console.warn("[README] Context too long, truncating to avoid rate limits")
  return context.slice(0, threshold) + "\n\n... (truncated to avoid rate limits)"
}

function deriveTechStackHint(files: ScannedFile[]): string {
  const text = files
    .filter((f) => f.content && /\.(md|json|js|ts|tsx|jsx|py|java|toml|go|rs)$/i.test(f.path))
    .map((f) => `\n[${f.path}]\n${f.content}`)
    .join("")
    .toLowerCase()

  const hits: string[] = []
  const mark = (k: string, needle: RegExp) => {
    if (needle.test(text)) hits.push(k)
  }

  mark("Next.js", /next(\.js)?/i)
  mark("React", /react/i)
  mark("TypeScript", /typescript|\.ts(x)?\b/i)
  mark("Tailwind CSS", /tailwind/i)
  mark("Prisma", /prisma/i)
  mark("NextAuth", /next-?auth/i)
  mark("Vercel", /vercel/i)
  mark("Python", /\bpython\b|\.py\b/i)
  mark("Java", /\bjava\b|pom\.xml/i)
  mark("Go", /\bgo\b|go\.mod/i)
  mark("Rust", /\brust\b|cargo\.toml/i)
  mark("Docker", /dockerfile|docker-compose/i)
  mark("Redis", /redis/i)
  mark("Supabase", /supabase/i)

  const uniq = Array.from(new Set(hits))
  return uniq.length ? uniq.join(", ") : "See Languages and dependencies"
}

/**
 * Normalize Markdown for perfect GitHub rendering
 * Only fixes rendering issues without altering content or structure
 */
function normalizeMarkdown(markdown: string): string {
  let normalized = markdown.trim()

  // Remove any triple-backticks wrapping the entire document
  normalized = normalized.replace(/^```[a-z]*\n?([\s\S]*?)\n?```$/m, "$1")

  // Remove HTML tags that should be Markdown (but preserve content)
  normalized = normalized
    .replace(/<p>(.*?)<\/p>/gi, "$1\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<strong>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<i>(.*?)<\/i>/gi, "*$1*")
    .replace(/<em>(.*?)<\/em>/gi, "*$1*")
    .replace(/<code>(.*?)<\/code>/gi, "`$1`")
    .replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "```\n$1\n```")

  // Normalize line endings
  normalized = normalized.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  // Remove invisible characters that break rendering
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, "")

  // Fix excessive blank lines (max 2 consecutive)
  normalized = normalized.replace(/\n{4,}/g, "\n\n\n")

  // Ensure blank line before headings (but not at start)
  normalized = normalized.replace(/([^\n])\n(#{1,6}\s+)/g, "$1\n\n$2")

  // Ensure blank line after headings
  normalized = normalized.replace(/(#{1,6}.*?)\n([^\n#\s])/g, "$1\n\n$2")

  // Ensure blank lines around code blocks
  normalized = normalized.replace(/([^\n`])\n(```)/g, "$1\n\n$2")
  normalized = normalized.replace(/(```[^\n]*\n[\s\S]*?```)\n([^\n`])/g, "$1\n\n$2")

  // Fix code blocks: ensure they have language tag and proper format
  normalized = normalized.replace(/```\n([^\n`]+)\n```/g, (match, code) => {
    // Try to detect language from common patterns
    const trimmed = code.trim()
    if (/^(npm|yarn|pnpm|pip|python|bash|sh|curl|wget|git)/i.test(trimmed)) {
      return `\`\`\`bash\n${code}\n\`\`\``
    }
    if (/^(const|let|var|function|import|export|interface|type)/.test(trimmed)) {
      if (trimmed.includes(".tsx") || trimmed.includes("React") || trimmed.includes("jsx")) {
        return `\`\`\`tsx\n${code}\n\`\`\``
      }
      return `\`\`\`typescript\n${code}\n\`\`\``
    }
    if (/^[{[]/.test(trimmed) && /[}\]]$/.test(trimmed)) {
      return `\`\`\`json\n${code}\n\`\`\``
    }
    return match
  })

  // Ensure blank lines around lists
  normalized = normalized.replace(/([^\n-*+\d])\n([-*+]|\d+\.)\s/g, "$1\n\n$2 ")
  normalized = normalized.replace(/([-*+]|\d+\.\s+[^\n]+(\n(?:  |\t)[-*+]|\d+\.\s+[^\n]+)*)\n([^\n\s-*+\d])/g, "$1\n\n$3")

  // Fix nested lists: ensure proper 2-space indentation
  normalized = normalized.replace(/([-*+]|\d+\.)\s+([^\n]+)\n(?:  |\t)([-*+]|\d+\.)/g, "$1 $2\n  $3")

  // Ensure blank lines around tables
  normalized = normalized.replace(/([^\n|])\n(\|.*\|)/g, "$1\n\n$2")
  normalized = normalized.replace(/(\|.*\|)\n([^\n|])/g, "$1\n\n$2")

  // Fix inline code that spans newlines (should be code blocks)
  normalized = normalized.replace(/`([^`\n]+\n[^`]+)`/g, "```\n$1\n```")

  // Ensure proper spacing around inline code
  normalized = normalized.replace(/(\S)`([^`]+)`(\S)/g, "$1 `$2` $3")

  // Fix heading hierarchy: prevent skipped levels
  const lines = normalized.split("\n")
  const fixedLines: string[] = []
  let lastHeadingLevel = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    
    if (headingMatch) {
      const level = headingMatch[1].length
      // If skipping levels, adjust to be one level deeper than last
      if (level > lastHeadingLevel + 1 && lastHeadingLevel > 0) {
        const adjustedLevel = lastHeadingLevel + 1
        fixedLines.push("#".repeat(adjustedLevel) + " " + headingMatch[2])
        lastHeadingLevel = adjustedLevel
      } else {
        fixedLines.push(line)
        lastHeadingLevel = level
      }
    } else {
      fixedLines.push(line)
    }
  }

  normalized = fixedLines.join("\n")

  // Clean up trailing whitespace on each line
  normalized = normalized.split("\n").map((line) => line.trimEnd()).join("\n")

  // Remove excessive blank lines at the end
  normalized = normalized.replace(/\n{3,}$/, "\n\n")

  // Ensure exactly one blank line at the end
  if (!normalized.endsWith("\n")) {
    normalized += "\n"
  }

  normalized = normalized.trimStart()

  // Helper function to convert heading text to GitHub anchor
  const headingToAnchor = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Collapse multiple hyphens
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
  }

  // Ensure quick links section exists after the title with clickable anchor links
  const quickLinksRegex = /\[Quick Links:.*?\]/i
  const hasQuickLinks = quickLinksRegex.test(normalized)
  
  // Extract actual section headings from the document
  const headings = normalized.match(/^##+\s+(.+)$/gm) || []
  const sectionMap: Record<string, string> = {}
  
  // Map common section names to their anchor variations
  const sectionNames = [
    { name: "Introduction", patterns: ["introduction", "intro", "overview"] },
    { name: "Tech Stack", patterns: ["tech stack", "technology", "technologies", "stack"] },
    { name: "Prerequisites / Requirements", patterns: ["prerequisites", "requirements", "requirement", "prerequisite"] },
    { name: "Installation", patterns: ["installation", "install", "setup", "getting started"] },
    { name: "Configuration", patterns: ["configuration", "config", "setup"] },
    { name: "Usage", patterns: ["usage", "use", "how to use"] },
    { name: "Project Structure", patterns: ["project structure", "structure", "directory structure", "file structure"] },
    { name: "Features", patterns: ["features", "feature"] },
    { name: "Development", patterns: ["development", "develop", "dev", "development setup"] },
    { name: "Contributing", patterns: ["contributing", "contribute", "contribution"] },
    { name: "License", patterns: ["license", "licence", "licensing"] },
    { name: "FAQ", patterns: ["faq", "frequently asked questions", "questions"] },
  ]

  // Find matching headings and create anchor links
  headings.forEach((heading) => {
    const headingText = heading.replace(/^##+\s+/, "").trim()
    const anchor = headingToAnchor(headingText)
    
    // Try to match with section names
    for (const section of sectionNames) {
      const headingLower = headingText.toLowerCase()
      if (section.patterns.some((pattern) => headingLower.includes(pattern))) {
        sectionMap[section.name] = anchor
        break
      }
    }
    
    // Also add direct mapping
    sectionMap[headingText] = anchor
  })

  // Build quick links with anchor links
  const buildQuickLinks = (): string => {
    const links: string[] = []
    
    sectionNames.forEach((section) => {
      // Try to find the anchor from section map
      let anchor = sectionMap[section.name]
      if (!anchor) {
        // Fallback: try to find by pattern matching
        const foundHeading = headings.find((h) => {
          const hText = h.replace(/^##+\s+/, "").toLowerCase()
          return section.patterns.some((p) => hText.includes(p))
        })
        if (foundHeading) {
          anchor = headingToAnchor(foundHeading.replace(/^##+\s+/, ""))
        } else {
          // Default anchor generation
          anchor = headingToAnchor(section.name)
        }
      }
      
      links.push(`[${section.name}](#${anchor})`)
    })
    
    return `[Quick Links: ${links.join(" · ")}]`
  }

  const quickLinksText = buildQuickLinks()
  
  if (!hasQuickLinks) {
    // Find the first heading and add quick links after the title/tagline
    const titleMatch = normalized.match(/^(#[^\n]+\n\n[^\n#]+\n\n)/)
    if (titleMatch) {
      normalized = normalized.replace(titleMatch[0], titleMatch[0] + quickLinksText + "\n\n")
    } else {
      // If no title found, try to add after first heading
      const firstHeadingMatch = normalized.match(/^(#[^\n]+\n\n)/)
      if (firstHeadingMatch) {
        normalized = normalized.replace(firstHeadingMatch[0], firstHeadingMatch[0] + quickLinksText + "\n\n")
      }
    }
  } else {
    // Replace existing quick links with properly formatted anchor links
    normalized = normalized.replace(
      /\[Quick Links:.*?\]/i,
      quickLinksText
    )
    // Ensure quick links have proper spacing (blank lines before and after)
    normalized = normalized.replace(
      /(\n)(\[Quick Links:.*?\])(\n)/i,
      "$1$2$3\n"
    )
  }

  return normalized
}

function buildReadmeSystemPrompt(compressedContext: string, techStackHint: string, customInstructions?: string) {
  return `
You are GitFriend's README author powered by Groq. Produce a minimal, professional, and publication-ready README.md that renders perfectly on GitHub.

CRITICAL FORMATTING RULES (GitHub Flavored Markdown):

1. HEADINGS - Strict hierarchy with consistent spacing:
   - Use # for main title (one per document)
   - Use ## for main sections (Introduction, Installation, etc.)
   - Use ### for subsections within main sections
   - Use #### only when necessary for deep nesting
   - ALWAYS include one blank line before and after headings
   - Never skip heading levels (don't go from ## to ####)

2. LISTS - Proper indentation and formatting:
   - Use - for bullet lists (not *, not HTML <ul>)
   - Use 1. for numbered lists (not HTML <ol>)
   - ALWAYS include one blank line before lists
   - ALWAYS include one blank line after lists
   - For nested lists, indent with exactly 2 spaces
   - Never mix code spans with list markers on the same line incorrectly
   - Example correct format:
     - Item one
     - Item two
       - Nested item with proper 2-space indent

3. CODE BLOCKS AND INLINE CODE:
   - Use \`code\` for inline code (single backtick)
   - Use \`\`\`language for fenced code blocks (triple backtick + language)
   - ALWAYS specify language for code blocks: \`\`\`bash, \`\`\`typescript, \`\`\`json, \`\`\`yaml, \`\`\`python, etc.
   - ALWAYS include one blank line before code blocks
   - ALWAYS include one blank line after code blocks
   - Never place code blocks inside list items without proper indentation
   - Never mix HTML <code> or <pre> tags - use Markdown only

4. PARAGRAPHS AND SPACING:
   - ALWAYS separate paragraphs with exactly one blank line
   - ALWAYS separate sections with exactly one blank line
   - Never use multiple blank lines consecutively (max one)
   - Never omit blank lines between different content types (heading, paragraph, list, code)

5. TABLES:
   - Use pipe syntax: | Column 1 | Column 2 |
   - Include header separator: |---|---|
   - Ensure proper alignment with spaces
   - Include blank lines before and after tables

6. LINKS:
   - Use [text](url) syntax only (not HTML <a> tags)
   - For internal links use [text](#anchor) where anchor matches heading (lowercase, hyphens)

7. PROHIBITED:
   - NO HTML tags (<div>, <span>, <p>, <br>, <hr>, etc.) - use Markdown equivalents
   - NO custom CSS or inline styles
   - NO images unless explicitly in context (use ![alt](url) syntax if needed)
   - NO badges or shields unless in context
   - NO triple-backticks wrapping the entire document
   - NO mixed formatting (don't combine HTML and Markdown)
   - NO invisible Unicode characters

8. TYPOGRAPHY:
   - Use **bold** for emphasis (not <b> or <strong>)
   - Use *italic* for emphasis (not <i> or <em>)
   - Use \`code\` for technical terms, commands, file names
   - Keep consistent spacing around formatted text

OUTPUT STRUCTURE (follow this order - CRITICAL: Include quick links section with anchor links):
# <Project Name>

<One-line tagline or brief description>

[Quick Links: [Introduction](#introduction) · [Tech Stack](#tech-stack) · [Prerequisites / Requirements](#prerequisites--requirements) · [Installation](#installation) · [Configuration](#configuration) · [Usage](#usage) · [Project Structure](#project-structure) · [Features](#features) · [Development](#development) · [Contributing](#contributing) · [License](#license) · [FAQ](#faq)]

## Introduction

## Tech Stack

## Prerequisites / Requirements

## Installation

## Configuration

## Usage

## Project Structure

## Features

## Development

## Contributing

## License

## FAQ

(Only include sections that are relevant based on the context. Don't fabricate sections.)

AUTHORING RULES:
- Do not fabricate details; derive only from the provided context
- Merge existing README data if present, avoiding repetition
- Keep tone neutral, technical, and developer-facing
- Focus on clarity, accuracy, and GitHub Markdown compliance
- Ensure every heading, list, code block, and paragraph is properly spaced
- Test mentally: "Will this render correctly on GitHub?" before outputting

FINAL CHECK:
Before outputting, verify:
✓ Quick Links section is included after the title/tagline (MANDATORY)
✓ All headings have blank lines before and after
✓ All lists have blank lines before and after
✓ All code blocks have language tags and blank lines around them
✓ No HTML tags are used
✓ Paragraphs are separated by single blank lines
✓ Nested lists use proper 2-space indentation
✓ Inline code uses single backticks, code blocks use triple backticks
✓ No mixed or broken formatting

REMINDER: The Quick Links section MUST be included in your output with clickable anchor links! Format:
[Quick Links: [Introduction](#introduction) · [Tech Stack](#tech-stack) · [Prerequisites / Requirements](#prerequisites--requirements) · [Installation](#installation) · [Configuration](#configuration) · [Usage](#usage) · [Project Structure](#project-structure) · [Features](#features) · [Development](#development) · [Contributing](#contributing) · [License](#license) · [FAQ](#faq)]

Important: The anchor links must match the actual section headings. GitHub automatically creates anchors from headings by:
- Converting to lowercase
- Replacing spaces with hyphens
- Removing special characters
- Example: "## Prerequisites / Requirements" becomes "#prerequisites--requirements"

Context (compressed):
${compressedContext}

Tech Stack Hint: ${techStackHint}

${customInstructions ? `\n\nUser Custom Instructions:\n${customInstructions}` : ""}
`
}


// Initialize Groq (singleton ok in route scope)
const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY,
}) : null

// Keep a single Octokit instance for lightweight calls still used here
const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
})

async function fetchLanguages(owner: string, repo: string) {
  const { data } = await octokit.repos.listLanguages({ owner, repo })
  return data
}

async function fetchFileContents(owner: string, repo: string, path: string) {
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path })
    return "content" in data ? Buffer.from(data.content, "base64").toString() : null
  } catch (e) {
    console.error(`Error fetching file content at path: ${path}`, e)
    return null
  }
}

// Type for repo tree entries
interface RepoTreeEntry {
  name: string
  path: string
  type: "file" | "dir"
  content?: string | null
}

// Recursively fetch files and their contents (with limits)
async function fetchRepoTreeAndContents(
  owner: string,
  repo: string,
  path = "",
  depth = 0,
  maxDepth = 2,
  maxFiles = 30,
  collected: RepoTreeEntry[] = [],
): Promise<RepoTreeEntry[]> {
  if (depth > maxDepth || collected.length >= maxFiles) return collected
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path })
    if (Array.isArray(data)) {
      for (const item of data) {
        if (collected.length >= maxFiles) break
        if (item.type === "file") {
          // Only fetch content for key files or small files
          let content: string | null = null
          if (
            /^(readme|package|tsconfig|next\.config|dockerfile|\.env|main|index|app|src|setup|config|requirements|pyproject|composer|build|Makefile|Procfile|server|client|api|lib|utils|test|spec|docs?)\./i.test(
              item.name,
            ) ||
            item.size < 20000
          ) {
            try {
              const fileContent = await fetchFileContents(owner, repo, item.path)
              // Only take first 1000 chars for large files
              content = fileContent
                ? fileContent.slice(0, 1000) + (fileContent.length > 1000 ? "\n... (truncated)" : "")
                : null
            } catch {}
          }
          collected.push({ name: item.name, path: item.path, type: "file", content })
        } else if (item.type === "dir") {
          collected.push({ name: item.name, path: item.path, type: "dir" })
          await fetchRepoTreeAndContents(owner, repo, item.path, depth + 1, maxDepth, maxFiles, collected)
        }
      }
    }
  } catch (e) {
    // Ignore errors for folders/files we can't access
  }
  return collected
}

async function releaseReadmeLock(repoUrl: string) {
  try {
    await redis.del(CACHE_KEYS.README_LOCK(repoUrl))
  } catch (error) {
    console.error(`[README] Failed to release lock for ${repoUrl}`, error)
  }
}

// Check if README generation is already in progress or completed
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const repoUrl = url.searchParams.get("repoUrl")

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
    }

    // Check if we have a cached README
    const cachedReadme = await redis.get(CACHE_KEYS.README_GENERATION(repoUrl))
    if (cachedReadme) {
      return NextResponse.json({
        status: "completed",
        readme: cachedReadme,
      })
    }

    // Check the status of generation
    const status = await redis.get<ReadmeGenerationStatus>(CACHE_KEYS.README_STATUS(repoUrl))
    const error = await redis.get<string>(CACHE_KEYS.README_ERROR(repoUrl))

    const rateLimitKey = CACHE_KEYS.README_RATE_LIMIT(repoUrl)
    const now = Date.now()
    const lastRequest = await redis.get<string>(rateLimitKey)

    if (lastRequest && now - Number(lastRequest) < CACHE_TTL.STATUS_POLL_COOLDOWN * 1000) {
      console.info(`[README] Rate limit hit for status check on ${repoUrl}`)
      return NextResponse.json({
        status: status || "not_started",
        rateLimited: true,
        error: error || undefined,
      })
    }

    await redis.set(rateLimitKey, String(now), { ex: CACHE_TTL.STATUS_POLL_COOLDOWN })

    return NextResponse.json({
      status: status || "not_started",
      error: error || undefined,
    })
  } catch (error: any) {
    console.error("Error checking README status:", error)
    return NextResponse.json({ error: "Failed to check README status", details: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check for required API keys
    if (!groq) {
      return NextResponse.json({ 
        error: "README generation service is not configured (GROQ_API_KEY missing)" 
      }, { status: 503 })
    }

    // Accept 'force' to bypass cache and always regenerate
    const { repoUrl, customInstructions, force, stream: useStream } = await req.json()

    if (!repoUrl) {
      return NextResponse.json({ error: "Repository URL is required" }, { status: 400 })
    }

    const match = repoUrl.match(/github\.com\/(.+?)\/(.+?)(?:\.git)?$/)
    if (!match) {
      return NextResponse.json({ error: "Invalid GitHub URL" }, { status: 400 })
    }

    // Check if we already have a cached README, unless force is true
    if (!force) {
      const cachedReadme = await redis.get(CACHE_KEYS.README_GENERATION(repoUrl))
      if (cachedReadme) {
        return NextResponse.json({
          status: "completed",
          readme: cachedReadme,
          cached: true,
        })
      }
    }

    // Check if generation is already in progress
    const status = await redis.get<ReadmeGenerationStatus>(CACHE_KEYS.README_STATUS(repoUrl))
    if (status === "processing" || status === "pending") {
      console.info(`[README] Skipping generation for ${repoUrl}; current status: ${status}`)
      return NextResponse.json({
        status: status,
        message: "README generation is already in progress",
      })
    }

    const lockKey = CACHE_KEYS.README_LOCK(repoUrl)
    const lockAcquired = await redis.set(lockKey, Date.now().toString(), { ex: CACHE_TTL.LOCK, nx: true })

    if (!lockAcquired) {
      console.info(`[README] Skipping generation for ${repoUrl} due to active lock`)
      return NextResponse.json({
        status: status || "pending",
        message: "README generation is already in progress",
      })
    }

    // Set status to pending and clear any previous error
    await redis.set(CACHE_KEYS.README_STATUS(repoUrl), "processing", { ex: CACHE_TTL.STATUS })
    await redis.del(CACHE_KEYS.README_ERROR(repoUrl))

    // If streaming is requested, return a streaming response
    if (useStream) {
      return new Response(
        new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder()
            try {
              const [, owner, repo] = match
              
              // Scan repository
              const analysis = await scanRepository({
                owner,
                repo,
                maxFiles: 50,
                maxFileSizeBytes: 100_000,
                perFileCharLimit: 1500,
              })

              const kind = detectProjectKind(analysis)
              const relevant = selectRelevantFiles(kind, analysis.files, 50)
              const contextRaw = buildContextBlock(analysis, relevant)
              const compressedContext = await summarizeIfNeeded(groq, contextRaw, 6000)
              const techStackHint = deriveTechStackHint(relevant)
              const systemPrompt = buildReadmeSystemPrompt(compressedContext, techStackHint, customInstructions)

              // Stream the Groq response
              const completion = await groq.chat.completions.create({
                messages: [
                  { role: "system", content: systemPrompt },
                  { role: "user", content: "Generate the README.md now. Begin with name, description, and tech stack." },
                ],
                model: "openai/gpt-oss-120b",
                temperature: 0.7,
                max_completion_tokens: 2000,
                top_p: 1,
                stream: true,
              })

               let fullReadme = ""
               for await (const chunk of completion) {
                 const content = chunk.choices?.[0]?.delta?.content || ""
                 if (content) {
                   fullReadme += content
                   // Stream content as it arrives
                   controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                 }
               }

               // Normalize the complete README for proper GitHub rendering
               const normalizedReadme = normalizeMarkdown(fullReadme)
               
               // If normalization made significant changes, send a corrected version signal
               // The frontend will use the normalized version from cache on next fetch
               // For now, we just ensure the normalized version is saved

               // Save normalized version to cache
               await redis.set(CACHE_KEYS.README_GENERATION(repoUrl), normalizedReadme, { ex: CACHE_TTL.README })
               await redis.set(CACHE_KEYS.README_STATUS(repoUrl), "completed", { ex: CACHE_TTL.STATUS })
              
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
              controller.close()
            } catch (error: any) {
              const errorMessage = error instanceof Error ? error.message : "Failed to generate README"
              await redis.set(CACHE_KEYS.README_STATUS(repoUrl), "failed", { ex: CACHE_TTL.STATUS })
              await redis.set(CACHE_KEYS.README_ERROR(repoUrl), errorMessage, { ex: CACHE_TTL.STATUS })
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
              controller.close()
            } finally {
              await releaseReadmeLock(repoUrl)
            }
          },
        }),
        {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        }
      )
    }

    // Start the generation process in the background (non-streaming)
    console.info(`[README] Starting background generation for ${repoUrl}`)
    generateReadmeInBackground(repoUrl, customInstructions).catch((error) => {
      console.error(`[README] Background generation failed for ${repoUrl}`, error)
    })

    return NextResponse.json({
      status: "pending",
      message: "README generation has started",
    })
  } catch (error: any) {
    console.error("Error starting README generation:", error)
    return NextResponse.json({ error: "Failed to start README generation", details: error.message }, { status: 500 })
  }
}

// Background process to generate README
async function generateReadmeInBackground(repoUrl: string, customInstructions?: string) {
  const startTime = Date.now()
  try {
    await redis.set(CACHE_KEYS.README_STATUS(repoUrl), "processing", { ex: CACHE_TTL.STATUS })
    console.info(`[README] Starting generation for ${repoUrl}`)

    const match = repoUrl.match(/github\.com\/(.+?)\/(.+?)(?:\.git)?(?:\/)?$/)
    if (!match) {
      throw new Error("Invalid GitHub URL")
    }
    const [, owner, repo] = match

    // Full repo analysis (optimized for speed)
    console.info(`[README] Scanning repository ${owner}/${repo}...`)
    const analysis = await scanRepository({
      owner,
      repo,
      maxFiles: 50, // Further reduced for faster processing
      maxFileSizeBytes: 100_000, // Reduced
      perFileCharLimit: 1500, // Reduced for faster processing
    })
    console.info(`[README] Repository scan completed in ${Date.now() - startTime}ms`)

    const kind = detectProjectKind(analysis)
    const relevant = selectRelevantFiles(kind, analysis.files, 50) // Reduced from 100
    const contextRaw = buildContextBlock(analysis, relevant)
    const compressedContext = await summarizeIfNeeded(groq, contextRaw, 6000) // Reduced threshold for faster processing
    const techStackHint = deriveTechStackHint(relevant)
    console.info(`[README] Context prepared (${compressedContext.length} chars), calling Groq API...`)

    const systemPrompt = buildReadmeSystemPrompt(compressedContext, techStackHint, customInstructions)

    // Add retry logic with timeout for rate limiting
    let completion
    let retries = 3
    const groqStartTime = Date.now()
    while (retries > 0) {
      try {
        // Wrap Groq API call with 60 second timeout to prevent hanging
        completion = await withTimeout(
          groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Generate the README.md now. Begin with name, description, and tech stack." },
            ],
            model: "openai/gpt-oss-120b",
            temperature: 0.7,
            max_completion_tokens: 2000, // Reduced for faster generation
            top_p: 1,
            stream: false, // Non-streaming for background
          }),
          60000, // 60 second timeout
          "Groq API call timed out after 60 seconds"
        )
        console.info(`[README] Groq API call completed in ${Date.now() - groqStartTime}ms`)
        break // Success, exit retry loop
      } catch (error: any) {
        if (error?.status === 429 && retries > 1) {
          // Rate limited, wait and retry
          const waitTime = Math.pow(2, 3 - retries) * 1000 // Exponential backoff
          console.warn(`[README] Rate limited, waiting ${waitTime}ms before retry ${4 - retries}/3`)
          await new Promise(resolve => setTimeout(resolve, waitTime))
          retries--
        } else if (error?.message?.includes("timed out") && retries > 1) {
          // Timeout error, retry once
          console.warn(`[README] API call timed out after ${Date.now() - groqStartTime}ms, retrying... (${4 - retries}/3)`)
          retries--
        } else {
          throw error // Re-throw if not rate limit/timeout or no retries left
        }
      }
    }

    if (!completion) {
      throw new Error("Failed to generate README after retries")
    }

    const generatedReadme = completion.choices?.[0]?.message?.content
    if (!generatedReadme) {
      throw new Error("Groq did not return content")
    }

    // Normalize the generated README for perfect GitHub rendering
    const normalizedReadme = normalizeMarkdown(generatedReadme)

    await redis.set(CACHE_KEYS.README_GENERATION(repoUrl), normalizedReadme, { ex: CACHE_TTL.README })
    await redis.set(CACHE_KEYS.README_STATUS(repoUrl), "completed", { ex: CACHE_TTL.STATUS })
    const totalTime = Date.now() - startTime
    console.info(`[README] Completed background generation for ${repoUrl} in ${totalTime}ms`)
    return normalizedReadme
  } catch (error) {
    console.error("[v0] Error generating README:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate README"
    await redis.set(CACHE_KEYS.README_STATUS(repoUrl), "failed", { ex: CACHE_TTL.STATUS })
    await redis.set(CACHE_KEYS.README_ERROR(repoUrl), errorMessage, { ex: CACHE_TTL.STATUS })
    throw error
  } finally {
    await releaseReadmeLock(repoUrl)
  }
}
