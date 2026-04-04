"use client"

import { useState, useCallback, useRef } from "react"
import { ContentActionMenu, type ActionType } from "./content-action-menu"
import { motion } from "framer-motion"

type Props = {
  markdown: string
  onMarkdownChange: (markdown: string) => void
  onAIAction?: (action: ActionType, selectedText: string) => Promise<string>
  isLoading?: boolean
}

export function EditableMarkdownEditor({ markdown, onMarkdownChange, onAIAction, isLoading = false }: Props) {
  const [selectedText, setSelectedText] = useState("")
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)

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
        onMarkdownChange(updatedMarkdown)
      }
    },
    [selectedText, onMarkdownChange]
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
        <h2 className="text-sm font-medium text-[hsl(var(--readme-text))]">Raw Markdown</h2>
        <span className="text-xs text-[hsl(var(--readme-text-muted))]">Directly edit markdown source</span>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Line Numbers */}
        <div className="bg-[hsl(var(--readme-bg))] border-r border-[hsl(var(--readme-border))] px-3 py-4 text-right text-xs text-[hsl(var(--readme-text-muted))] font-mono select-none overflow-hidden">
          {Array.from({ length: lineCount }, (_, i) => (
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
            onInput={handleContentChange}
            spellCheck="false"
            data-gramm="false"
          >
            {markdown}
          </div>
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
