"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import {
  Download,
  Copy,
  Check,
  GitBranch,
  Sparkles,
  Code as CodeIcon,
  Eye,
} from "lucide-react"
import { ChatInteractionPanel, type InteractionRecord } from "./chat-interaction-panel"

type ReadmeWorkspaceProps = {
  repoUrl: string
  markdown: string
  onCopy: () => void
  onDownload: () => void
  onNew: () => void
  onRegenerate?: () => void
  onApply?: () => void
  copied?: boolean
  canRegenerate?: boolean
  isGenerating?: boolean
  onCustomAction?: (action: string) => void
  onEditSection?: (section: string) => void
  onAdjustTone?: (tone: string) => void
}

export function ReadmeWorkspace({
  repoUrl,
  markdown,
  onCopy,
  onDownload,
  onNew,
  onRegenerate,
  onApply,
  copied,
  canRegenerate,
  isGenerating,
  onCustomAction,
  onEditSection,
  onAdjustTone,
}: ReadmeWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"preview" | "markdown">("preview")
  const [history, setHistory] = useState<InteractionRecord[]>([])
  const [isMobileView, setIsMobileView] = useState(false)
  const [activePane, setActivePane] = useState<"chat" | "readme">("chat")

  // Initialize with first generation record
  useEffect(() => {
    if (markdown && history.length === 0) {
      setHistory([
        {
          id: "gen-0",
          type: "generate",
          action: "README generated",
          content: "Initial generation from repository analysis",
          timestamp: new Date(),
        },
      ])
    }
  }, [markdown])

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const addHistoryRecord = (record: Omit<InteractionRecord, "id" | "timestamp">) => {
    const newRecord: InteractionRecord = {
      ...record,
      id: `action-${Date.now()}`,
      timestamp: new Date(),
    }
    setHistory((prev) => [...prev, newRecord])
  }

  const handleRegenerate = () => {
    addHistoryRecord({
      type: "regenerate",
      action: "README regenerated",
      content: "Regenerating with current settings",
    })
    onRegenerate?.()
  }

  const handleEditSection = (section: string) => {
    addHistoryRecord({
      type: "edit",
      action: `Editing ${section} section`,
      content: `Refining ${section} content...`,
    })
    onEditSection?.(section)
  }

  const handleAdjustTone = (tone: string) => {
    addHistoryRecord({
      type: "refine",
      action: `Tone adjusted to ${tone}`,
      content: `Regenerating with ${tone} tone...`,
    })
    onAdjustTone?.(tone)
  }

  const handleCustomAction = (action: string) => {
    addHistoryRecord({
      type: "refine",
      action: "Custom refinement",
      content: action,
    })
    onCustomAction?.(action)
  }

  // Mobile view
  if (isMobileView) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Mobile header with pane toggle */}
        <div className="border-b border-border/50 bg-background sticky top-0 z-10 px-4 py-3 flex gap-2">
          <Button
            variant={activePane === "chat" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setActivePane("chat")}
          >
            Chat
          </Button>
          <Button
            variant={activePane === "readme" ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={() => setActivePane("readme")}
          >
            README
          </Button>
        </div>

        {/* Mobile content */}
        <div className="flex-1 overflow-hidden">
          {activePane === "chat" ? (
            <ChatInteractionPanel
              repoUrl={repoUrl}
              history={history}
              isGenerating={isGenerating}
              onCustomAction={handleCustomAction}
              onEditSection={handleEditSection}
              onAdjustTone={handleAdjustTone}
              onRegenerate={handleRegenerate}
            />
          ) : (
            <ReadmeDisplayPane
              markdown={markdown}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onCopy={onCopy}
              onDownload={onDownload}
              onNew={onNew}
              onApply={onApply}
              onRegenerate={handleRegenerate}
              copied={copied}
              canRegenerate={canRegenerate}
            />
          )}
        </div>
      </div>
    )
  }

  // Desktop split-screen view
  return (
    <div className="flex h-screen bg-background">
      {/* Left pane: Chat */}
      <motion.div
        className="w-1/3 flex flex-col border-r border-border/50 min-w-0"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ChatInteractionPanel
          repoUrl={repoUrl}
          history={history}
          isGenerating={isGenerating}
          onCustomAction={handleCustomAction}
          onEditSection={handleEditSection}
          onAdjustTone={handleAdjustTone}
          onRegenerate={handleRegenerate}
        />
      </motion.div>

      {/* Right pane: README */}
      <motion.div
        className="w-2/3 flex flex-col overflow-hidden"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ReadmeDisplayPane
          markdown={markdown}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCopy={onCopy}
          onDownload={onDownload}
          onNew={onNew}
          onApply={onApply}
          onRegenerate={handleRegenerate}
          copied={copied}
          canRegenerate={canRegenerate}
        />
      </motion.div>
    </div>
  )
}

// Sub-component for README display pane
function ReadmeDisplayPane({
  markdown,
  viewMode,
  onViewModeChange,
  onCopy,
  onDownload,
  onNew,
  onApply,
  onRegenerate,
  copied,
  canRegenerate,
}: {
  markdown: string
  viewMode: "preview" | "markdown"
  onViewModeChange: (mode: "preview" | "markdown") => void
  onCopy: () => void
  onDownload: () => void
  onNew: () => void
  onApply?: () => void
  onRegenerate: () => void
  copied?: boolean
  canRegenerate?: boolean
}) {
  return (
    <Card className="relative shadow-none border-none bg-transparent h-full rounded-none flex flex-col">
      {/* Header with actions */}
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "preview" ? "default" : "ghost"}
            size="sm"
            className="h-9"
            onClick={() => onViewModeChange("preview")}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant={viewMode === "markdown" ? "default" : "ghost"}
            size="sm"
            className="h-9"
            onClick={() => onViewModeChange("markdown")}
          >
            <CodeIcon className="h-4 w-4 mr-2" />
            Raw
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-9 flex items-center gap-2 border-border/50 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={onNew}
          >
            <GitBranch className="h-4 w-4" />
            New
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 flex items-center gap-2 border-border/50 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 flex items-center gap-2 border-border/50 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={onCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          {onApply && (
            <Button
              variant="default"
              size="sm"
              className="h-9 flex items-center gap-2 bg-foreground text-background hover:bg-foreground/90"
              onClick={onApply}
            >
              Apply
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full">
          {viewMode === "preview" ? (
            <div className="px-6 py-6 prose prose-sm max-w-none readme-preview" data-streamdown-container>
              <Streamdown
                plugins={{ code }}
                components={{
                  img: ({ src, alt, ...props }) => {
                    if (typeof src === "string" && (src.startsWith("http://") || src.startsWith("https://"))) {
                      return (
                        <img
                          src={src}
                          alt={alt}
                          {...props}
                          style={{ maxWidth: "100%", height: "auto" }}
                        />
                      )
                    }
                    return null
                  },
                }}
              >
                {markdown}
              </Streamdown>
            </div>
          ) : (
            <div className="px-6 py-6 font-mono text-sm whitespace-pre-wrap text-foreground/80 break-words">
              {markdown}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
