"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Download, Copy, Check, GitBranch, Sparkles } from "lucide-react"

type Props = {
  markdown: string
  onCopy: () => void
  onDownload: () => void
  onNew: () => void
  onRegenerate?: () => void
  copied?: boolean
  canRegenerate?: boolean
  repoUrl?: string
}

export function MarkdownPreview({ markdown, onCopy, onDownload, onNew, onRegenerate, copied, canRegenerate }: Props) {
  return (
    <Card className="relative shadow-lg border border-gray-300 readme-preview-container">
      <CardContent className="pt-6">
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black bg-transparent"
            onClick={onNew}
          >
            <GitBranch className="h-4 w-4" />
            New
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black bg-transparent"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black bg-transparent"
            onClick={onCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          {onRegenerate && (
            <Button
              variant="outline"
              className="flex items-center gap-2 border-[hsl(var(--readme-border))] bg-transparent"
              onClick={onRegenerate}
              disabled={!canRegenerate}
            >
              <Sparkles className="h-4 w-4" />
              Regenerate
            </Button>
          )}
        </div>

        <ScrollArea className="h-[600px] pr-4 mt-8">
          <div className="prose prose-sm max-w-none px-6 readme-preview">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              // Security: Disable raw HTML and dangerous features
              disallowedElements={["script", "iframe", "object", "embed", "form", "input", "button"]}
              unwrapDisallowed={false}
              components={{
                img: ({ node, ...props }) => {
                  // Security: Block dangerous protocols (data:, javascript:, vbscript:)
                  if (props.src && (props.src.startsWith("javascript:") || props.src.startsWith("data:") || props.src.startsWith("vbscript:"))) {
                    return null
                  }
                  return <img {...props} className="max-w-full h-auto my-4" alt={props.alt || ""} />
                },
                a: ({ node, ...props }) => {
                  // Security: Block dangerous protocols (javascript:, data:, vbscript:)
                  if (props.href && (props.href.startsWith("javascript:") || props.href.startsWith("data:") || props.href.startsWith("vbscript:"))) {
                    return <span className="text-blue-600">{props.children}</span>
                  }
                  return (
                    <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline" />
                  )
                },
                h1: ({ node, ...props }) => (
                  <h1 {...props} className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200" />
                ),
                h2: ({ node, ...props }) => (
                  <h2 {...props} className="text-2xl font-bold mt-6 mb-3 pb-2 border-b border-gray-200" />
                ),
                h3: ({ node, ...props }) => <h3 {...props} className="text-xl font-bold mt-5 mb-2" />,
                code: ({ node, inline, className, children, ...props }: any) =>
                  inline ? (
                    <code className="px-1 py-0.5 bg-gray-100 rounded text-gray-800" {...props}>
                      {children}
                    </code>
                  ) : (
                    <code className="block overflow-x-auto text-gray-800" {...props}>
                      {children}
                    </code>
                  ),
                pre: ({ node, ...props }) => (
                  <pre
                    {...props}
                    className="p-4 bg-gray-100 rounded-md overflow-x-auto my-4 border border-gray-200 text-gray-800"
                  />
                ),
                hr: ({ node, ...props }) => <hr {...props} className="my-6 border-gray-300" />,
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table {...props} className="min-w-full divide-y divide-gray-300" />
                  </div>
                ),
                th: ({ node, ...props }) => <th {...props} className="px-4 py-2 bg-gray-100 font-medium text-left" />,
                td: ({ node, ...props }) => <td {...props} className="px-4 py-2 border-t border-gray-300" />,
                ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 my-4" />,
                ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 my-4" />,
                li: ({ node, ...props }) => <li {...props} className="my-1" />,
                blockquote: ({ node, ...props }) => (
                  <blockquote {...props} className="pl-4 border-l-4 border-gray-200 text-gray-700 my-4 italic" />
                ),
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default MarkdownPreview
