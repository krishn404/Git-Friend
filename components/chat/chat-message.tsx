"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"
import { MarkdownRenderer } from "./markdown-renderer"
import { MessageActions } from "./message-actions"
import { Loader2 } from "lucide-react"

type ChatMessageProps = {
  id: string
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
  onRegenerate?: () => void
  onEdit?: () => void
}

export const ChatMessage = memo(function ChatMessage({
  id,
  role,
  content,
  isStreaming = false,
  onRegenerate,
  onEdit,
}: ChatMessageProps) {
  const isAssistant = role === "assistant"

  return (
    <div
      className={cn(
        "group flex w-full gap-3 py-4 px-4 sm:px-6 md:px-8",
        isAssistant ? "bg-muted/40" : "bg-background"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold",
          isAssistant
            ? "bg-primary text-primary-foreground"
            : "bg-foreground/10 text-foreground"
        )}
      >
        {isAssistant ? "AI" : "U"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {isAssistant ? "Assistant" : "You"}
          </p>
          {isStreaming && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          )}
        </div>

        <div className="mt-2">
          {isAssistant ? (
            <MarkdownRenderer content={content} className="text-sm" />
          ) : (
            <p className="text-sm leading-relaxed text-foreground">{content}</p>
          )}
        </div>

        {/* Message Actions */}
        {content && (
          <div className="mt-2">
            <MessageActions
              messageId={id}
              content={content}
              isAssistant={isAssistant}
              onRegenerate={onRegenerate}
              onEdit={onEdit}
            />
          </div>
        )}
      </div>
    </div>
  )
})
