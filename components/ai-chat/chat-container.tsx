"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean
}

export const ChatContainer = React.forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ className, isLoading = false, children, ...props }, ref) => {
    const scrollAreaRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (scrollAreaRef.current) {
        // Auto-scroll to bottom when messages change
        const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }
    }, [children])

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col h-full bg-background overflow-hidden",
          className,
        )}
        {...props}
      >
        <ScrollArea className="flex-1">
          <div
            ref={scrollAreaRef}
            className={cn(
              "flex flex-col gap-4 p-6",
              "group", // For hover states on messages
            )}
          >
            {children}
          </div>
        </ScrollArea>
      </div>
    )
  },
)

ChatContainer.displayName = "ChatContainer"
