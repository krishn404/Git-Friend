"use client"

import { useState, useCallback, useRef } from "react"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { ContentActionMenu, type ActionType } from "./content-action-menu"
import { motion } from "framer-motion"

type Props = {
  markdown: string
  onMarkdownChange: (markdown: string) => void
  onAIAction?: (action: ActionType, selectedText: string) => Promise<string>
  isLoading?: boolean
}

export function EditablePreview({ markdown, onMarkdownChange, onAIAction, isLoading = false }: Props) {
  const [selectedText, setSelectedText] = useState("")
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

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
        onMarkdownChange(updatedMarkdown)
      } catch (err) {
        console.error("Error applying edit:", err)
      }
    },
    [selectedText, onMarkdownChange]
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
        <h2 className="text-sm font-medium text-[hsl(var(--readme-text))]">Preview</h2>
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
          spellCheck="false"
        >
          <Streamdown
            markdown={markdown}
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
