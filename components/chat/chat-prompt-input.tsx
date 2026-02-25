"use client"

import { useRef, useState } from "react"
import { ArrowUp, Square } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ChatPromptInputProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isStreaming?: boolean
  onStop?: () => void
  suggestions?: string[]
}

export function ChatPromptInput({
  value,
  onChange,
  onSubmit,
  isStreaming = false,
  onStop,
  suggestions = [],
}: ChatPromptInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const formRef = useRef<HTMLFormElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const filteredSuggestions = suggestions.filter((s) =>
    value ? s.toLowerCase().includes(value.toLowerCase()) : true,
  )

  const handleInputResize: React.FormEventHandler<HTMLTextAreaElement> = (event) => {
    const el = event.currentTarget
    el.style.height = "auto"
    const next = Math.min(el.scrollHeight, 160)
    el.style.height = `${next}px`
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      if (!isStreaming && value.trim()) {
        formRef.current?.requestSubmit()
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const el = textareaRef.current
        el.focus()
        el.selectionStart = el.selectionEnd = el.value.length
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="w-full">
      <div className="w-full">
        <div className="relative flex items-end gap-2 px-3 py-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onInput={handleInputResize}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about Git or GitHub..."
            disabled={isStreaming}
            rows={1}
            className={cn(
              "flex-1 resize-none bg-transparent text-sm leading-relaxed text-zinc-900 placeholder:text-zinc-500",
              "max-h-40 min-h-[24px] py-1 pr-10 outline-none",
            )}
          />

          <Button
            type={isStreaming ? "button" : "submit"}
            size="icon"
            className="mb-[2px] h-8 w-8 shrink-0 rounded-full border border-zinc-300 bg-zinc-900 text-zinc-50 hover:bg-zinc-800"
            disabled={!value.trim() && !isStreaming}
            onClick={isStreaming ? onStop : undefined}
          >
            {isStreaming ? <Square className="h-3.5 w-3.5" /> : <ArrowUp className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Suggestions are handled by the parent container if needed */}
      </div>
    </form>
  )
}

