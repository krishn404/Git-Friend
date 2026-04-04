"use client"

import React, { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check, GitBranch, Eye, Code as CodeIcon, RefreshCw, Upload, HelpCircle } from "lucide-react"
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
  onAutoSave?: (isDone: boolean) => void
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
  onAutoSave,
}: ReadmeWorkspaceProps) {
  const [viewMode, setViewMode] = useState<"preview" | "markdown">("preview")
  const [localMarkdown, setLocalMarkdown] = useState(markdown)
  const [isSaving, setIsSaving] = useState(false)
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const savingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Sync external markdown changes
  React.useEffect(() => {
    setLocalMarkdown(markdown)
  }, [markdown])

  const handleMarkdownChange = useCallback(
    (newMarkdown: string) => {
      setLocalMarkdown(newMarkdown)
      
      // Show saving indicator
      setIsSaving(true)
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current)
      }
      
      // Call the callback
      onMarkdownChange?.(newMarkdown)
      
      // Hide saving indicator after a short delay
      savingTimeoutRef.current = setTimeout(() => {
        setIsSaving(false)
        onAutoSave?.(true)
      }, 300)
    },
    [onMarkdownChange, onAutoSave]
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
        <div className="flex items-center gap-4">
          {/* Auto-save status */}
          {isSaving && (
            <span className="text-xs text-[hsl(var(--readme-text-muted))] animate-pulse">
              Saving...
            </span>
          )}
        </div>
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

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 ml-2"
            onClick={() => setShowKeyboardHelp(true)}
            title="Keyboard shortcuts"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <motion.div
            className="bg-[hsl(var(--readme-card-bg))] rounded-lg shadow-lg max-w-md w-full border border-[hsl(var(--readme-border))]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[hsl(var(--readme-text))] mb-4">Keyboard Shortcuts</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--readme-text-muted))]">Undo</span>
                  <code className="bg-[hsl(var(--readme-bg))] px-2 py-1 rounded text-xs text-[hsl(var(--readme-text))]">
                    Ctrl+Z
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--readme-text-muted))]">Redo</span>
                  <code className="bg-[hsl(var(--readme-bg))] px-2 py-1 rounded text-xs text-[hsl(var(--readme-text))]">
                    Ctrl+Y / Ctrl+Shift+Z
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--readme-text-muted))]">Select Text</span>
                  <code className="bg-[hsl(var(--readme-bg))] px-2 py-1 rounded text-xs text-[hsl(var(--readme-text))]">
                    Click & Drag
                  </code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[hsl(var(--readme-text-muted))]">AI Actions</span>
                  <code className="bg-[hsl(var(--readme-bg))] px-2 py-1 rounded text-xs text-[hsl(var(--readme-text))]">
                    Select then Click
                  </code>
                </div>
              </div>
              <button
                className="w-full mt-6 px-4 py-2 bg-[hsl(var(--readme-primary))] text-[hsl(var(--readme-primary-foreground))] rounded-lg hover:bg-[hsl(var(--readme-primary-hover))] text-sm font-medium"
                onClick={() => setShowKeyboardHelp(false)}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
