"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end"
  avatar?: React.ReactNode
  children: React.ReactNode
}

export function Message({ align = "start", avatar, children, className, ...props }: MessageProps) {
  return (
    <div className={cn("flex w-full", align === "end" ? "justify-end" : "justify-start", className)} {...props}>
      <div className={cn("flex max-w-[85%] gap-3", align === "end" ? "flex-row-reverse" : "flex-row")}>
        {avatar && align === "start" && <div className="flex-shrink-0">{avatar}</div>}
        {children}
        {avatar && align === "end" && <div className="flex-shrink-0">{avatar}</div>}
      </div>
    </div>
  )
}

interface MessageAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  fallback: string
  alt?: string
}

export function MessageAvatar({ src, fallback, alt, className, ...props }: MessageAvatarProps) {
  return (
    <div
      className={cn(
        "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium",
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src || "/placeholder.svg"}
          alt={alt || fallback}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>{fallback[0]}</span>
      )}
    </div>
  )
}

interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  markdown?: boolean
  isStreaming?: boolean
}

export function MessageContent({
  markdown = false,
  isStreaming = false,
  children,
  className,
  ...props
}: MessageContentProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 rounded-2xl bg-card text-card-foreground border border-border",
        className,
      )}
      {...props}
    >
      {markdown ? (
        <div
          className="prose prose-sm max-w-none leading-relaxed text-[0.9375rem] dark:prose-invert"
          data-streamdown-container
        >
          <Streamdown
            plugins={{ code }}
            isAnimating={isStreaming}
            components={{
              a: ({ href, children, ...props }) => {
                if (
                  href &&
                  (href.startsWith("javascript:") || href.startsWith("data:") || href.startsWith("vbscript:"))
                ) {
                  return <span {...props}>{children}</span>
                }
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                )
              },
              img: ({ src, alt, ...props }) => {
                if (
                  typeof src === "string" &&
                  (src.startsWith("javascript:") || src.startsWith("data:") || src.startsWith("vbscript:"))
                ) {
                  return null
                }
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={typeof src === "string" ? src : undefined} alt={(alt as string) || ""} {...props} />
                )
              },
              table: ({ children, ...props }) => (
                <div {...props} className="mt-4 space-y-3">
                  {children}
                </div>
              ),
              thead: ({ children }) => <>{children}</>,
              tbody: ({ children }) => <>{children}</>,
              tr: ({ children, ...props }) => (
                <div
                  {...props}
                  className="rounded-md border border-border/70 bg-background px-3 py-2 text-xs sm:text-[0.8125rem]"
                >
                  {children}
                </div>
              ),
              th: ({ children, ...props }) => (
                <div {...props} className="font-medium text-foreground/80">
                  {children}
                </div>
              ),
              td: ({ children, ...props }) => (
                <div {...props} className="mt-1 text-foreground/80">
                  {children}
                </div>
              ),
            }}
          >
            {children as string}
          </Streamdown>
        </div>
      ) : (
        <div className="whitespace-pre-wrap">{children}</div>
      )}
    </div>
  )
}

interface MessageActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MessageActions({ children, className, ...props }: MessageActionsProps) {
  return (
    <div className={cn("flex items-center gap-1 mt-1", className)} {...props}>
      {children}
    </div>
  )
}

interface MessageActionProps extends React.HTMLAttributes<HTMLDivElement> {
  tooltip?: string
}

export function MessageAction({ tooltip, children, className, ...props }: MessageActionProps) {
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(className)} {...props}>
              {children}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}
