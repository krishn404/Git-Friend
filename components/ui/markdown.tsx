"use client"

import { cn } from "@/lib/utils"
import { marked } from "marked"
import { memo, useId, useMemo } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { CodeBlock, CodeBlockCode } from "./code-block"

export type MarkdownProps = {
  children: string
  id?: string
  className?: string
  components?: Partial<Components>
}

// Configure marked securely: disable raw HTML, header IDs, and other unsafe features
marked.setOptions({
  breaks: false,
  gfm: true,
  headerIds: false,
  mangle: false,
  pedantic: false,
  sanitize: false, // We'll sanitize via react-markdown components instead
  silent: false,
  smartLists: false,
  smartypants: false,
  xhtml: false,
})

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

function extractLanguage(className?: string): string {
  if (!className) return "plaintext"
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : "plaintext"
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line || props.node?.position?.start.line === props.node?.position?.end.line

    if (isInline) {
      return (
        <span className={cn("bg-primary-foreground rounded-sm px-1 font-mono text-sm", className)} {...props}>
          {children}
        </span>
      )
    }

    const language = extractLanguage(className)

    return (
      <CodeBlock className={className}>
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    )
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>
  },
  // Security: Sanitize links to prevent javascript: and data: URLs
  a: function LinkComponent({ href, children, ...props }) {
    // Block dangerous protocols
    if (href && (href.startsWith("javascript:") || href.startsWith("data:") || href.startsWith("vbscript:"))) {
      return <span {...props}>{children}</span>
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    )
  },
  // Security: Sanitize images to prevent data: URLs and VBScript
  img: function ImageComponent({ src, ...props }) {
    // Block dangerous protocols
    if (src && (src.startsWith("javascript:") || src.startsWith("data:") || src.startsWith("vbscript:"))) {
      return null
    }
    return <img src={src} {...props} />
  },
}

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string
    components?: Partial<Components>
  }) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        // Security: Disable raw HTML and dangerous features
        disallowedElements={["script", "iframe", "object", "embed", "form", "input", "button"]}
        unwrapDisallowed={false}
        // Sanitize links to prevent javascript: and data: URLs
        rehypePlugins={[]}
      >
        {content}
      </ReactMarkdown>
    )
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content
  },
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

function MarkdownComponent({ children, id, className, components = INITIAL_COMPONENTS }: MarkdownProps) {
  const generatedId = useId()
  const blockId = id ?? generatedId
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children])

  return (
    <div className={className}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock key={`${blockId}-block-${index}`} content={block} components={components} />
      ))}
    </div>
  )
}

const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"

export { Markdown }
