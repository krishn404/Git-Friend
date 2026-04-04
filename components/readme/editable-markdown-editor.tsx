"use client"

import { useState, useCallback, useRef, useEffect } from "react"
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

export function EditableMarkdownEditor({ markdown, onMarkdownChange, onAIAction, isLoading = false }: Props) {
  const [selectedText, setSelectedText] = useState("")
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([{ markdown, timestamp: Date.now() }])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [cursorLine, setCursorLine] = useState(1)
  const [cursorCol, setCursorCol] = useState(1)
  const editorRef = useRef<HTMLDivElement>(null)
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

  const updateCursorPosition = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || !editorRef.current) return

    const range = selection.getRangeAt(0)
    const preRange = range.cloneRange()
    preRange.selectNodeContents(editorRef.current)
    preRange.setEnd(range.endContainer, range.endOffset)

    const text = preRange.toString()
    const lines = text.split("\n")
    const currentLine = lines.length
    const currentCol = lines[lines.length - 1].length + 1

    setCursorLine(currentLine)
    setCursorCol(currentCol)
  }, [])

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.toString().length === 0) {
      setMenuPosition(null)
      setSelectedText("")
      updateCursorPosition()
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
  }, [updateCursorPosition])

  const handleContentChange = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      if (editorRef.current) {
        const updatedMarkdown = editorRef.current.innerText
        onMarkdownChange(updatedMarkdown)
      }
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

  const handleApplyEdit = useCallback(
    (newText: string) => {
      if (!selectedText) return

      const selection = window.getSelection()
      if (!selection) return

      // Replace selected text with new text
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(newText))

      // Update the markdown
      if (editorRef.current) {
        const updatedMarkdown = editorRef.current.innerText
        addToHistory(updatedMarkdown)
        setMenuPosition(null)
        setSelectedText("")
      }
    },
    [selectedText, addToHistory]
  )

  // Count lines for line numbers
  const lines = markdown.split("\n")
  const lineCount = lines.length

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
          <h2 className="text-sm font-medium text-[hsl(var(--readme-text))]">Raw Markdown</h2>
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
        <span className="text-xs text-[hsl(var(--readme-text-muted))]">Directly edit markdown source</span>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Line Numbers */}
        <div className="bg-[hsl(var(--readme-bg))] border-r border-[hsl(var(--readme-border))] px-3 py-4 text-right text-xs text-[hsl(var(--readme-text-muted))] font-mono select-none overflow-hidden">
          {Array.from({ length: history[historyIndex]?.markdown.split("\n").length || lineCount }, (_, i) => (
            <div key={i} className="h-6 leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto flex flex-col">
          <div
            ref={editorRef}
            className="flex-1 p-4 font-mono text-sm text-[hsl(var(--readme-text))] bg-[hsl(var(--readme-card-bg))] whitespace-pre-wrap break-words outline-none resize-none"
            contentEditable={!isLoading}
            suppressContentEditableWarning
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
            onInput={() => {
              if (editorRef.current) {
                addToHistory(editorRef.current.innerText)
              }
            }}
            spellCheck="false"
            data-gramm="false"
          >
            {history[historyIndex]?.markdown || markdown}
          </div>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-[hsl(var(--readme-bg))] border-t border-[hsl(var(--readme-border))] text-xs text-[hsl(var(--readme-text-muted))]">
        <div className="flex items-center gap-4">
          <span>Line {cursorLine}, Column {cursorCol}</span>
          <span className="text-[hsl(var(--readme-text-muted))]">
            {(history[historyIndex]?.markdown || markdown).length} characters
          </span>
        </div>
        <span className="text-[hsl(var(--readme-text-muted))]">
          {(history[historyIndex]?.markdown || markdown).split("\n").length} lines
        </span>
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
