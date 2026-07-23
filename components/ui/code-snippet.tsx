"use client"

import { useState, useRef } from "react"
import { Check, Copy } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface CodeSnippetProps {
  code: string
  language?: string
  showLineNumbers?: boolean
  className?: string
}

export function CodeSnippet({ code, language = "bash", showLineNumbers = false, className }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const codeRef = useRef<HTMLPreElement>(null)

  const copyToClipboard = async () => {
    if (!navigator.clipboard) {
      toast({
        title: "Copy failed",
        description: "Your browser doesn't support clipboard access",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Code snippet has been copied to your clipboard",
        duration: 2000,
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy code to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={cn("relative my-4 rounded-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <Badge variant="outline" className="text-xs font-mono">
          {language}
        </Badge>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-4 w-4 text-foreground" /> : <Copy className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Copied!" : "Copy code"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <pre
        ref={codeRef}
        className={cn(
          "p-4 overflow-x-auto bg-muted/30 text-sm font-mono",
          showLineNumbers && "line-numbers",
          "dark:bg-muted/10"
        )}
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}
