"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { ContentActionMenu, type ActionType } from "./content-action-menu"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { RotateCcw, RotateCw } from "lucide-react"

type Props = {
  markdown: string
  onMarkdownChange: (markdown: string) => void
  onAIAction?: (action: ActionType, selectedText: string) => Promise<string>
  isLoading?: boolean
}

// History management for undo/redo
interface HistoryEntry {
  markdown: string
  timestamp: number
}

export function EditablePreview({ markdown, onMarkdownChange, onAIAction, isLoading = false }: Props) {
  const [selectedText, setSelectedText] = useState("")
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([{ markdown, timestamp: Date.now() }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const previewRef = useRef<HTMLDivElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync external markdown changes to history
  useEffect(() => {
    if (markdown !== history[historyIndex]?.markdown) {
      addToHistory(markdown)
    }
  }, [markdown])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) {
        e.preventDefault()
        handleRedo()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [historyIndex, history])

  const addToHistory = useCallback(
    (newMarkdown: string) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push({ markdown: newMarkdown, timestamp: Date.now() })
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)

      // Auto-save with debounce
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        onMarkdownChange(newMarkdown)
      }, 500)
    },
    [history, historyIndex, onMarkdownChange]
  )

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onMarkdownChange(history[newIndex].markdown)
    }
  }, [historyIndex, history, onMarkdownChange])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onMarkdownChange(history[newIndex].markdown)
    }
  }, [historyIndex, history, onMarkdownChange])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.toString().length === 0) {
      setMenuPosition(null)
      setSelectedText("")
      return
    }

    const text = selection.toString()
    setSelectedText(text)

    // Get position for the menu
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    setMenuPosition({
      x: rect.left + rect.width / 2 - 75,
      y: rect.top - 10,
    })
  }, [])

  const handleAIAction = useCallback(
    async (action: ActionType, selectedText: string): Promise<string> => {
      if (!onAIAction) {
        throw new Error("AI actions not configured")
      }
      return onAIAction(action, selectedText)
    },
    [onAIAction]
  )

  const handleApplyEdit = useCallback(
    (newText: string) => {
      if (!selectedText || !previewRef.current) return

      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      try {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        range.insertNode(document.createTextNode(newText))

        // Update the markdown to reflect the change
        const updatedMarkdown = previewRef.current.innerText
        addToHistory(updatedMarkdown)
        setMenuPosition(null)
        setSelectedText("")
      } catch (err) {
        console.error("Error applying edit:", err)
      }
    },
    [selectedText, addToHistory]
  )

  return (
    <motion.div
      className="w-full h-full flex flex-col bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[hsl(var(--readme-border))]">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-medium text-[hsl(var(--readme-text))]">Preview</h2>
          {/* Undo/Redo Controls */}
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <span className="text-xs text-[hsl(var(--readme-text-muted))]">Select text to edit or refine</span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <div
          ref={previewRef}
          className="prose prose-sm max-w-none dark:prose-invert prose-p:text-[hsl(var(--readme-text))] prose-h1:text-[hsl(var(--readme-text))] prose-h2:text-[hsl(var(--readme-text))] prose-h3:text-[hsl(var(--readme-text))] prose-h4:text-[hsl(var(--readme-text))] prose-h5:text-[hsl(var(--readme-text))] prose-h6:text-[hsl(var(--readme-text))] prose-a:text-[hsl(var(--readme-primary))] prose-strong:text-[hsl(var(--readme-text))] prose-code:text-[hsl(var(--readme-text))] prose-pre:bg-[hsl(var(--readme-bg))] prose-blockquote:text-[hsl(var(--readme-text-muted))] relative cursor-text"
          contentEditable={!isLoading}
          suppressContentEditableWarning
          onMouseUp={handleTextSelection}
          onKeyUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
          onInput={() => {
            if (previewRef.current) {
              addToHistory(previewRef.current.innerText)
            }
          }}
          spellCheck="false"
        >
          <Streamdown
            markdown={history[historyIndex]?.markdown || markdown}
            components={{
              code,
            }}
          />
        </div>
      </div>

      {/* AI Action Menu */}
      {onAIAction && (
        <ContentActionMenu
          selectedText={selectedText}
          position={menuPosition}
          onAction={handleAIAction}
          onApplyEdit={handleApplyEdit}
          onClose={() => {
            setMenuPosition(null)
            setSelectedText("")
          }}
        />
      )}
    </motion.div>
  )
}
