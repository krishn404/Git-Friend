"use client"

import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { cn } from "@/lib/utils"

type AIResponseProps = {
  content: string
  isStreaming?: boolean
  className?: string
}

export function AIResponse({ content, isStreaming = false, className }: AIResponseProps) {
  return (
    <div
      className={cn(
        "w-full text-[0.975rem] leading-relaxed md:text-[1rem] md:leading-[1.9]",
        className,
      )}
    >
      <div
        className="prose prose-sm md:prose-base max-w-none text-[0.975rem] leading-relaxed md:text-[1rem] md:leading-[1.9] dark:prose-invert"
        data-streamdown-container
      >
        <Streamdown
          plugins={{ code }}
          isAnimating={isStreaming}
          animated={{
            animation: "slideUp",
            duration: 380,
            easing: "linear",
            sep: "word",
          }}
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
          {content}
        </Streamdown>
      </div>
    </div>
  )
}

