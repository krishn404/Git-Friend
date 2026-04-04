"use client"

import React, { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Sparkles, Edit3, Zap, RotateCcw, Send } from "lucide-react"

export type InteractionRecord = {
  id: string
  type: "generate" | "regenerate" | "edit" | "refine"
  action: string
  content: string
  timestamp: Date
}

type ChatInteractionPanelProps = {
  repoUrl: string
  history: InteractionRecord[]
  isGenerating?: boolean
  onCustomAction?: (action: string) => void
  onEditSection?: (section: string) => void
  onAdjustTone?: (tone: string) => void
  onRegenerate?: () => void
}

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "comprehensive", label: "Comprehensive" },
  { value: "concise", label: "Concise" },
]

const sections = [
  { value: "overview", label: "Overview" },
  { value: "installation", label: "Installation" },
  { value: "usage", label: "Usage" },
  { value: "features", label: "Features" },
  { value: "api", label: "API" },
  { value: "contributing", label: "Contributing" },
  { value: "license", label: "License" },
]

export function ChatInteractionPanel({
  repoUrl,
  history,
  isGenerating,
  onCustomAction,
  onEditSection,
  onAdjustTone,
  onRegenerate,
}: ChatInteractionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [customInput, setCustomInput] = useState("")
  const [selectedTone, setSelectedTone] = useState("")
  const [selectedSection, setSelectedSection] = useState("")

  // Auto-scroll to bottom when history updates
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
      }, 100)
    }
  }, [history])

  const handleCustomAction = () => {
    if (customInput.trim()) {
      onCustomAction?.(customInput)
      setCustomInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customInput.trim()) {
      handleCustomAction()
    }
  }

  const handleEditSection = () => {
    if (selectedSection) {
      onEditSection?.(selectedSection)
      setSelectedSection("")
    }
  }

  const handleAdjustTone = () => {
    if (selectedTone) {
      onAdjustTone?.(selectedTone)
      setSelectedTone("")
    }
  }

  return (
    <div className="flex flex-col h-full bg-background border-r border-border/50">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border/50">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Repository</p>
          <p className="text-sm font-medium text-foreground truncate">{repoUrl}</p>
        </div>
      </div>

      {/* History Scroll Area */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="space-y-4 p-4">
          {history.length === 0 ? (
            <motion.div
              className="flex items-center justify-center h-32 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm text-muted-foreground">
                Generation started. Chat history will appear here.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {history.map((interaction, idx) => (
                <motion.div
                  key={interaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {interaction.type === "generate" && (
                        <Sparkles className="h-4 w-4 text-amber-500" />
                      )}
                      {interaction.type === "regenerate" && (
                        <RotateCcw className="h-4 w-4 text-blue-500" />
                      )}
                      {interaction.type === "edit" && (
                        <Edit3 className="h-4 w-4 text-purple-500" />
                      )}
                      {interaction.type === "refine" && (
                        <Zap className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-xs font-semibold text-muted-foreground capitalize">
                          {interaction.type}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {interaction.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1">{interaction.action}</p>
                      {interaction.content && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2 italic">
                          {interaction.content}
                        </p>
                      )}
                    </div>
                  </div>
                  {idx < history.length - 1 && (
                    <div className="h-px bg-border/30 my-2" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Fixed Actions Footer */}
      <div className="border-t border-border/50 bg-background p-4 space-y-3">
        {/* Edit Section */}
        <div className="flex gap-2">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select section..." />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.value} value={section.value}>
                  {section.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleEditSection}
            disabled={!selectedSection || isGenerating}
            size="sm"
            variant="outline"
            className="h-9 px-3"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline ml-1">Edit</span>
          </Button>
        </div>

        {/* Adjust Tone */}
        <div className="flex gap-2">
          <Select value={selectedTone} onValueChange={setSelectedTone}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select tone..." />
            </SelectTrigger>
            <SelectContent>
              {toneOptions.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  {tone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAdjustTone}
            disabled={!selectedTone || isGenerating}
            size="sm"
            variant="outline"
            className="h-9 px-3"
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline ml-1">Apply</span>
          </Button>
        </div>

        {/* Regenerate */}
        <Button
          onClick={onRegenerate}
          disabled={isGenerating}
          variant="outline"
          className="w-full h-9 text-xs"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          <span className="ml-2">Regenerate</span>
        </Button>

        {/* Custom Instructions */}
        <div className="flex gap-2">
          <Input
            placeholder="Custom instructions..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            className="h-9 text-xs"
          />
          <Button
            onClick={handleCustomAction}
            disabled={!customInput.trim() || isGenerating}
            size="sm"
            className="h-9 px-3 bg-foreground text-background hover:bg-foreground/90"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
