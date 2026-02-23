"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface StreamdownMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
  onFeedback?: (feedback: "like" | "dislike" | null) => void
  feedback?: "like" | "dislike" | null
}

export const StreamdownMessage = React.forwardRef<HTMLDivElement, StreamdownMessageProps>(
  (
    {
      role,
      content,
      isStreaming = false,
      onFeedback,
      feedback,
      className,
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false)
    const isAssistant = role === "assistant"

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("[v0] Failed to copy:", err)
      }
    }

    const handleFeedback = (type: "like" | "dislike") => {
      if (onFeedback) {
        onFeedback(feedback === type ? null : type)
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full gap-3",
          isAssistant ? "justify-start" : "justify-end",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "max-w-[85%] flex flex-col gap-2",
            isAssistant && "items-start",
            !isAssistant && "items-end",
          )}
        >
          {/* Message bubble */}
          <div
            className={cn(
              "rounded-lg px-4 py-3 break-words",
              isAssistant
                ? "bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground rounded-br-none",
            )}
          >
            {isAssistant ? (
              <div
                className={cn(
                  "prose prose-sm dark:prose-invert max-w-none",
                  "[&_pre]:bg-background [&_pre]:border [&_pre]:border-muted [&_pre]:rounded [&_pre]:overflow-x-auto",
                  "[&_code]:text-foreground [&_code]:font-mono [&_code]:text-xs",
                  "[&_a]:text-primary [&_a]:underline [&_a]:hover:opacity-80",
                  "[&_table]:border-collapse [&_table]:w-full [&_table]:text-sm",
                  "[&_th]:border [&_th]:border-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold",
                  "[&_td]:border [&_td]:border-muted [&_td]:px-3 [&_td]:py-2",
                  "[&_ul]:list-disc [&_ul]:pl-5",
                  "[&_ol]:list-decimal [&_ol]:pl-5",
                  "[&_li]:my-1",
                  "[&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4 [&_blockquote]:italic",
                )}
              >
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="whitespace-pre-wrap text-sm">{content}</div>
            )}
          </div>

          {/* Actions bar */}
          {isAssistant && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 w-7 p-0"
                title="Copy message"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback("like")}
                className={cn("h-7 w-7 p-0", feedback === "like" && "text-green-500")}
                title="Like response"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback("dislike")}
                className={cn("h-7 w-7 p-0", feedback === "dislike" && "text-red-500")}
                title="Dislike response"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  },
)

StreamdownMessage.displayName = "StreamdownMessage"
