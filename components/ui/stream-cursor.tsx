"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface StreamCursorProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "blink" | "pulse" | "solid"
}

export const StreamCursor = React.forwardRef<HTMLSpanElement, StreamCursorProps>(
  ({ variant = "blink", className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-block h-5 w-0.5 bg-current",
          variant === "blink" && "animate-blink",
          variant === "pulse" && "animate-pulse",
          className,
        )}
        {...props}
      />
    )
  },
)

StreamCursor.displayName = "StreamCursor"
