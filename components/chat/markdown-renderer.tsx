"use client"

import { memo, useMemo, useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Simple markdown parsing and rendering
function parseMarkdown(content: string) {
  const lines = content.split("\n")
  const blocks: Array<{ type: string; content: string; language?: string }> = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code blocks
    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || "plaintext"
      const codeLines: string[] = []
      i++

      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }

      blocks.push({
        type: "code",
        content: codeLines.join("\n"),
        language,
      })
      i++
    } else {
      // Collect text lines
      const textLines: string[] = []
      while (i < lines.length && !lines[i].startsWith("```")) {
        textLines.push(lines[i])
        i++
      }

      if (textLines.length > 0) {
        blocks.push({
          type: "text",
          content: textLines.join("\n"),
        })
      }
    }
  }

  return blocks
}

// Inline markdown formatting
function formatInlineMarkdown(text: string) {
  let result = text
  
  // Handle bold
  result = result.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  
  // Handle italic
  result = result.replace(/\*(.*?)\*/g, "<em>$1</em>")
  
  // Handle inline code
  result = result.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
  
  // Handle links
  result = result.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  return result
}

// Code block component with syntax highlighting
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple syntax highlighting fallback - just escape HTML
  const displayCode = code.replace(/</g, "&lt;").replace(/>/g, "&gt;")

  return (
    <div className="not-prose relative my-4 overflow-hidden rounded-lg border border-border bg-muted">
      <div className="flex items-center justify-between bg-muted/80 px-4 py-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {language}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 w-7 p-0"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code dangerouslySetInnerHTML={{ __html: displayCode }} />
      </pre>
    </div>
  )
}

type MarkdownRendererProps = {
  content: string
  className?: string
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  const blocks = useMemo(() => parseMarkdown(content), [content])

  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <CodeBlock key={idx} code={block.content} language={block.language || "plaintext"} />
          )
        }

        return (
          <div
            key={idx}
            className="space-y-3 text-sm leading-relaxed text-foreground"
            dangerouslySetInnerHTML={{
              __html: formatInlineMarkdown(block.content)
                .split("\n\n")
                .map((paragraph) => {
                  // Handle headers
                  if (paragraph.startsWith("# ")) {
                    return `<h1 class="text-xl font-bold mt-4 mb-2">${paragraph.slice(2)}</h1>`
                  }
                  if (paragraph.startsWith("## ")) {
                    return `<h2 class="text-lg font-bold mt-3 mb-2">${paragraph.slice(3)}</h2>`
                  }
                  if (paragraph.startsWith("### ")) {
                    return `<h3 class="text-base font-bold mt-2 mb-2">${paragraph.slice(4)}</h3>`
                  }
                  // Handle lists
                  if (paragraph.startsWith("- ")) {
                    const items = paragraph
                      .split("\n")
                      .map((item) => `<li>${item.slice(2)}</li>`)
                      .join("")
                    return `<ul class="list-disc list-inside space-y-1 my-2">${items}</ul>`
                  }
                  // Regular paragraph
                  return `<p>${paragraph}</p>`
                })
                .join(""),
            }}
          />
        )
      })}
    </div>
  )
})
