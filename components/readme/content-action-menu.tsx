"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Sparkles, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export type ActionType = "shorten" | "expand" | "rephrase" | "refine"

type Props = {
  selectedText: string
  position: { x: number; y: number } | null
  onAction: (action: ActionType, selectedText: string) => Promise<string>
  onApplyEdit: (newText: string) => void
  onClose: () => void
}

export function ContentActionMenu({ selectedText, position, onAction, onApplyEdit, onClose }: Props) {
  const [loadingAction, setLoadingAction] = useState<ActionType | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const menu = document.getElementById("action-menu")
      if (menu && !menu.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (position) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)

      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleEscape)
      }
    }
  }, [position, onClose])

  const handleAction = async (action: ActionType) => {
    setLoadingAction(action)
    setError(null)

    try {
      const result = await onAction(action, selectedText)
      onApplyEdit(result)
      onClose()
    } catch (err) {
      setError(`Failed to ${action} text. Please try again.`)
      setLoadingAction(null)
    }
  }

  if (!position || !selectedText) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        id="action-menu"
        className="fixed z-50 bg-background border border-[hsl(var(--readme-border))] rounded-lg shadow-lg p-1"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        initial={{ opacity: 0, scale: 0.8, y: -5 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -5 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex flex-col gap-1 min-w-max">
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm font-medium hover:bg-[hsl(var(--readme-primary))/10] text-[hsl(var(--readme-text))]"
            onClick={() => handleAction("shorten")}
            disabled={loadingAction !== null}
          >
            {loadingAction === "shorten" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Shortening...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Shorten
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm font-medium hover:bg-[hsl(var(--readme-primary))/10] text-[hsl(var(--readme-text))]"
            onClick={() => handleAction("expand")}
            disabled={loadingAction !== null}
          >
            {loadingAction === "expand" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Expanding...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Expand
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm font-medium hover:bg-[hsl(var(--readme-primary))/10] text-[hsl(var(--readme-text))]"
            onClick={() => handleAction("rephrase")}
            disabled={loadingAction !== null}
          >
            {loadingAction === "rephrase" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rephrasing...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Rephrase
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-sm font-medium hover:bg-[hsl(var(--readme-primary))/10] text-[hsl(var(--readme-text))]"
            onClick={() => handleAction("refine")}
            disabled={loadingAction !== null}
          >
            {loadingAction === "refine" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refining...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Refine
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="text-xs text-red-500 mt-2 px-2 py-1 text-center border-t border-[hsl(var(--readme-border))] pt-2">
            {error}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
