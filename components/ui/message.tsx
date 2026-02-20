"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
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
}

export function MessageContent({ markdown = false, children, className, ...props }: MessageContentProps) {
  return (
    <div className={cn("px-4 py-3 rounded-2xl shadow-sm", className)} {...props}>
      {markdown ? (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            // Security: Disable raw HTML and dangerous features
            disallowedElements={["script", "iframe", "object", "embed", "form", "input", "button"]}
            unwrapDisallowed={false}
            components={{
              // Security: Sanitize links to prevent javascript: and data: URLs
              a: ({ href, children, ...props }) => {
                if (href && (href.startsWith("javascript:") || href.startsWith("data:") || href.startsWith("vbscript:"))) {
                  return <span {...props}>{children}</span>
                }
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                )
              },
              // Security: Sanitize images to prevent data: URLs and VBScript
              img: ({ src, ...props }) => {
                if (src && (src.startsWith("javascript:") || src.startsWith("data:") || src.startsWith("vbscript:"))) {
                  return null
                }
                return <img src={src} {...props} />
              },
            }}
          >
            {children as string}
          </ReactMarkdown>
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
