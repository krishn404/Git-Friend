import { NextResponse } from "next/server"
import { Groq } from "groq-sdk"
import { scanRepository, type ScannedFile, type RepoAnalysis } from "@/lib/github"
import { SYSTEM_MESSAGE } from "@/lib/ai/system-prompts"

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, repoUrl }: { messages: Array<{ role: string; content: string }>; repoUrl?: string } = body

    let repoContextBlock = ""
    if (repoUrl && /https?:\/\/github\.com\/[^/]+\/[^/]+/i.test(repoUrl)) {
      try {
        const match = repoUrl.match(/github\.com\/(.+?)\/(.+?)(?:\.git)?(?:\/)?$/)
        if (match) {
          const [, owner, repo] = match
          const analysis = await scanRepository({
            owner,
            repo,
            maxFiles: 100, // lighter scan for chat
            maxFileSizeBytes: 192_000,
            perFileCharLimit: 2500,
          })
          const kind = detectProjectKind(analysis)
          const relevant = selectRelevantFiles(kind, analysis.files, 100)
          const contextRaw = buildContextBlock(analysis, relevant)
          const compressedContext = await summarizeIfNeeded(contextRaw, 12000)
          repoContextBlock = `\n\n[Repository Context]\n${compressedContext}`
        }
      } catch (e) {
        // Non-fatal: continue without context
        console.warn("gitf Repo analysis for chat failed:", e)
      }
    }

    const systemMessage = {
      ...SYSTEM_MESSAGE,
      content: SYSTEM_MESSAGE.content + repoContextBlock,
    }

    // Start streaming completion
    const completion = await groq.chat.completions.create({
      messages: [
        systemMessage,
        ...messages.map((m) => ({
          role: (m.role === "system" || m.role === "user" || m.role === "assistant" ? m.role : "user") as
            | "system"
            | "user"
            | "assistant",
          content: m.content || "",
        })),
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_completion_tokens: 4000, // Reduced to avoid rate limits
      top_p: 1,
      stream: true,
      stop: null,
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of completion) {
            const content = chunk.choices?.[0]?.delta?.content || ""
            if (content) {
              // Stream raw text directly for Streamdown consumption
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          console.error("gitf Stream processing error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("gitf Groq API Error:", error)
    return NextResponse.json(
      { error: "Failed to get response from Groq", details: error?.message || "unknown" },
      { status: 500 },
    )
  }
}

type ProjectKind = "web" | "python" | "java" | "native" | "unknown"

function detectProjectKind(analysis: RepoAnalysis): ProjectKind {
  const paths = analysis.files.map((f) => f.path.toLowerCase())
  const has = (p: RegExp) => paths.some((x) => p.test(x))

  if (has(/package\.json$/) || has(/\.(tsx|jsx|html?)$/) || has(/next\.config\.(js|mjs|ts)$/)) return "web"
  if (has(/requirements\.txt$/) || has(/pyproject\.toml$/) || has(/\.py$/)) return "python"
  if (has(/pom\.xml$/) || has(/\.java$/)) return "java"
  if (has(/\.(c|cc|cpp|h|hpp|go|rs)$/) || has(/(Makefile|CMakeLists\.txt|go\.mod|Cargo\.toml)$/)) return "native"
  return "unknown"
}

const BINARY_EXT =
  /\.(png|jpg|jpeg|gif|webp|svg|ico|mp4|mov|avi|mkv|mp3|wav|flac|ogg|pdf|zip|tar|gz|bz2|7z|rar|exe|dll|so|dylib|bin|psd|ai|sketch|blend|glb|gltf|ttf|otf|woff2?)$/i
const isBinaryPath = (p: string) => BINARY_EXT.test(p)

const UNIVERSAL_IGNORES =
  /(^|\/)(node_modules|\.git|\.next|dist|build|out|target|venv|\.venv|__pycache__|\.cache|coverage|\.turbo|\.pnpm|bin|tmp|temp|logs?|datasets?|data|.dvc|public\/uploads?)(\/|$)/i

const LOCKFILES = /(package-lock\.json|pnpm-lock\.yaml|yarn\.lock|\.lock)$/i

function shouldIncludeByKind(kind: ProjectKind, path: string): boolean {
  const p = path.toLowerCase()
  // Always include key roots
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

  // Per-kind inclusions
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
      // fallback to text-like files
      return /\.(md|txt|json|ya?ml|toml|xml|html?|css|scss|less|js|jsx|ts|tsx|mjs|cjs|sh|bash|zsh)$/i.test(p)
  }
}

function selectRelevantFiles(kind: ProjectKind, files: ScannedFile[], maxFiles = 100) {
  const filtered = files.filter((f) => {
    if (UNIVERSAL_IGNORES.test(f.path)) return false
    if (LOCKFILES.test(f.path)) return false
    if (isBinaryPath(f.path)) return false // skip binary assets universally
    return shouldIncludeByKind(kind, f.path)
  })

  // Prefer key directories first
  const score = (p: string) => {
    const l = p.toLowerCase()
    if (l.endsWith("readme.md")) return 0
    if (l.endsWith("package.json") || l.endsWith("requirements.txt") || l.endsWith("pom.xml")) return 1
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

  const parts = files.map((f) => {
    const header = `\n---\nFile: ${f.path}\n`
    return header + (f.content ? f.content : "")
  })
  return `${meta}\n\nKey Files:\n${parts.join("")}`
}

// Summarize long context with chunking; preserve metadata, tech stack, purpose, main logic
async function summarizeIfNeeded(context: string, threshold = 12000): Promise<string> {
  if (context.length <= threshold) return context

  // For rate limiting, just truncate instead of making multiple API calls
  console.warn("[Chat] Context too long, truncating to avoid rate limits")
  return context.slice(0, threshold) + "\n\n... (truncated to avoid rate limits)"
}
