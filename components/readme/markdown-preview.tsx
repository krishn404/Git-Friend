"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
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
          <div className="prose prose-sm max-w-none px-6 readme-preview" data-streamdown-container>
            <Streamdown
              plugins={{ code }}
              components={{
                img: ({ src, alt, ...props }) => {
                  if (
                    typeof src === "string" &&
                    (src.startsWith("javascript:") || src.startsWith("data:") || src.startsWith("vbscript:"))
                  ) {
                    return null
                  }
                  // eslint-disable-next-line @next/next/no-img-element
                  return <img src={typeof src === "string" ? src : undefined} alt={alt as string | undefined} {...props} />
                },
                a: ({ href, children, ...props }) => {
                  if (
                    href &&
                    (href.startsWith("javascript:") || href.startsWith("data:") || href.startsWith("vbscript:"))
                  ) {
                    return <span className="text-blue-600">{children}</span>
                  }
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                      {...props}
                    >
                      {children}
                    </a>
                  )
                },
              }}
            >
              {markdown}
            </Streamdown>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default MarkdownPreview
