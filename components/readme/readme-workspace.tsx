"use client"

import React, { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check, GitBranch, Eye, Code as CodeIcon, RefreshCw, Upload } from "lucide-react"
import { EditablePreview } from "./editable-preview"
import { EditableMarkdownEditor } from "./editable-markdown-editor"
import type { ActionType } from "./content-action-menu"

type ReadmeWorkspaceProps = {
  repoUrl: string
  markdown: string
  onMarkdownChange?: (markdown: string) => void
  onCopy: () => void
  onDownload: () => void
  onNew: () => void
  onRegenerate?: () => void
  onApply?: () => void
  copied?: boolean
  canRegenerate?: boolean
  isGenerating?: boolean
  onAIAction?: (action: ActionType, selectedText: string) => Promise<string>
}

export function ReadmeWorkspace({
  repoUrl,
  markdown,
  onMarkdownChange,
  onCopy,
  onDownload,
  onNew,
  onRegenerate,
  onApply,
  copied,
  canRegenerate,
  isGenerating,
  onAIAction,
}: ReadmeWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"preview" | "markdown">("preview")
  const [localMarkdown, setLocalMarkdown] = useState(markdown)

  // Sync external markdown changes
  React.useEffect(() => {
    setLocalMarkdown(markdown)
  }, [markdown])

  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      setLocalMarkdown(newMarkdown)
      onMarkdownChange?.(newMarkdown)
    },
    [onMarkdownChange]
  )

  const handleAIAction = useCallback(
    async (action: ActionType, selectedText: string): Promise<string> => {
      if (!onAIAction) {
        throw new Error("AI actions not configured")
      }
      return onAIAction(action, selectedText)
    },
    [onAIAction]
  )

  return (
    <motion.div
      className="w-full h-full flex flex-col bg-background"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--readme-border))] bg-[hsl(var(--readme-card-bg))]">
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[hsl(var(--readme-bg))] rounded-lg p-1">
            <Button
              variant={viewMode === "preview" ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 ${
                viewMode === "preview"
                  ? "bg-[hsl(var(--readme-primary))] text-[hsl(var(--readme-primary-foreground))]"
                  : "text-[hsl(var(--readme-text))]"
              }`}
              onClick={() => setViewMode("preview")}
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button
              variant={viewMode === "markdown" ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-2 ${
                viewMode === "markdown"
                  ? "bg-[hsl(var(--readme-primary))] text-[hsl(var(--readme-primary-foreground))]"
                  : "text-[hsl(var(--readme-text))]"
              }`}
              onClick={() => setViewMode("markdown")}
            >
              <CodeIcon className="h-4 w-4" />
              Markdown
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-[hsl(var(--readme-bg))]"
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

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-[hsl(var(--readme-bg))]"
            onClick={onDownload}
          >
            <Download className="h-4 w-4" />
            Download
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-[hsl(var(--readme-bg))]"
            onClick={onRegenerate}
            disabled={!canRegenerate || isGenerating}
          >
            {isGenerating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-[hsl(var(--readme-bg))]"
            onClick={onApply}
          >
            <Upload className="h-4 w-4" />
            Apply to GitHub
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-[hsl(var(--readme-bg))]"
            onClick={onNew}
          >
            <GitBranch className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "preview" ? (
          <EditablePreview
            markdown={localMarkdown}
            onMarkdownChange={handleMarkdownChange}
            onAIAction={handleAIAction}
            isLoading={isGenerating}
          />
        ) : (
          <EditableMarkdownEditor
            markdown={localMarkdown}
            onMarkdownChange={handleMarkdownChange}
            onAIAction={handleAIAction}
            isLoading={isGenerating}
          />
        )}
      </div>
    </motion.div>
  )
}
