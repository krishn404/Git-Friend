"use client"

import { useState } from "react"
import { ArrowUp } from "lucide-react"

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

const INPUT_HEIGHT = 52
const TEXTAREA_HEIGHT = 24

export function ChatPromptInput({
  value,
  onChange,
  onSubmit,
  isStreaming = false,
  onStop,
  suggestions = [],
}: ChatPromptInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = suggestions.filter((s) =>
    value ? s.toLowerCase().includes(value.toLowerCase()) : true,
  )

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="mx-auto w-full max-w-[640px] min-w-[640px]">
        {/* INPUT SHELL — IMMUTABLE */}
        <div
          className="relative flex items-center rounded-2xl border border-border bg-card px-3"
          style={{ height: INPUT_HEIGHT }}
        >
          {/* TEXTAREA — FIXED HEIGHT, INTERNAL SCROLL */}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask anything about Git or GitHub..."
            disabled={isStreaming}
            className={cn(
              "flex-1 resize-none bg-transparent text-sm leading-relaxed",
              "h-[24px] max-h-[24px] overflow-y-auto",
              "outline-none placeholder:text-muted-foreground",
            )}
          />

          {/* SEND BUTTON — FIXED POSITION */}
          <Button
            type={isStreaming ? "button" : "submit"}
            size="icon"
            className="ml-3 h-8 w-8 shrink-0 rounded-full border border-border bg-background hover:bg-muted"
            disabled={!value.trim() && !isStreaming}
            onClick={isStreaming ? onStop : undefined}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>

        {/* SUGGESTIONS — ZERO LAYOUT COUPLING */}
        <div className="mt-2">
          {suggestions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSuggestions((p) => !p)}
              className="text-[11px] text-muted-foreground hover:underline"
            >
              {showSuggestions ? "Hide suggestions" : "Show suggestions"}
            </button>
          )}

          <div
            className={cn(
              "mt-1 min-h-[28px] flex flex-wrap gap-2 text-[11px] text-muted-foreground transition-opacity",
              showSuggestions
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none",
            )}
          >
            {filteredSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChange(suggestion)}
                className="rounded-full border border-border bg-background px-3 py-1 hover:bg-muted"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  )
}