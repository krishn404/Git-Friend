"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  ArrowUp,
  GitBranch,
  GitMerge,
  GitPullRequest,
  GitCommit,
  Sparkles,
  CornerDownLeft,
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { SuggestionCard } from "@/components/ui/suggestion-card"
import Image from "next/image"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/ui/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { StreamdownMessage } from "@/components/ui/streamdown-message"
import { ChatContainer } from "@/components/ui/chat-container"
import { StreamCursor } from "@/components/ui/stream-cursor"
import { useChatStream } from "@/hooks/use-chat-stream"


type SuggestionCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  prompt: string
  color: string
  keywords: string[]
}

export default function AIChat() {
  const {
    messages,
    isLoading,
    streamContent,
    addMessage,
    appendToStreamContent,
    completeStream,
    clearMessages,
    updateMessageFeedback,
  } = useChatStream()

  const suggestionCards: SuggestionCardProps[] = [
    {
      icon: <GitBranch className="h-5 w-5" />,
      title: "Git Branching",
      description: "Learn about creating and managing branches",
      prompt: "How do I create and manage branches in Git?",
      color: "text-primary",
      keywords: ["branch", "create", "switch", "checkout", "git branch"],
    },
    {
      icon: <GitMerge className="h-5 w-5" />,
      title: "Merge Conflicts",
      description: "Resolve conflicts when merging branches",
      prompt: "How do I resolve merge conflicts in Git?",
      color: "text-primary",
      keywords: ["merge", "conflict", "resolve", "git merge"],
    },
    {
      icon: <GitPullRequest className="h-5 w-5" />,
      title: "Pull Requests",
      description: "Create and manage pull requests",
      prompt: "What's the best way to create a pull request on GitHub?",
      color: "text-primary",
      keywords: ["pull request", "pr", "github", "review"],
    },
    {
      icon: <GitCommit className="h-5 w-5" />,
      title: "Commit Best Practices",
      description: "Write better commit messages",
      prompt: "What are some best practices for writing good commit messages?",
      color: "text-primary",
      keywords: ["commit", "message", "best practice", "git commit"],
    },
  ]

  const [input, setInput] = useState("")
  const [showWelcome, setShowWelcome] = useState(true)
  const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestionCardProps[]>(suggestionCards)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const { toast } = useToast()
  const isMobile = useMobile()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamContent])

  // Toggle welcome screen
  useEffect(() => {
    setShowWelcome(messages.length === 0)
  }, [messages])

  // Handle chat submission with streaming
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!input.trim()) return

      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: input,
        timestamp: new Date(),
      }

      const assistantMessageId = Date.now().toString() + "_ai"

      addMessage(userMessage)
      addMessage({
        id: assistantMessageId,
        role: "assistant" as const,
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      })

      setInput("")

      // Abort previous request if still in flight
      abortControllerRef.current?.abort()
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: userMessage.content }],
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) throw new Error("Failed to fetch response")
        if (!response.body) throw new Error("No response body")

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        // Token-by-token streaming
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          appendToStreamContent(chunk)
        }

        completeStream()
      } catch (error: any) {
        if (error?.name === "AbortError") {
          console.log("[v0] Stream interrupted by user")
          return
        }
        console.error("[v0] Stream error:", error)
        toast({
          title: "Error",
          description: "Failed to get response. Please try again.",
          variant: "destructive",
        })
      }
    },
    [input, addMessage, appendToStreamContent, completeStream, toast],
  )

  const handleFeedback = useCallback(
    (messageId: string, type: "like" | "dislike" | null) => {
      updateMessageFeedback(messageId, type)
      if (type) {
        toast({
          title: type === "like" ? "Helpful!" : "Thank you for the feedback",
          duration: 1500,
        })
      }
    },
    [updateMessageFeedback, toast],
  )

  const handleSuggestionClick = useCallback((prompt: string) => {
    setInput(prompt)
    inputRef.current?.focus()
  }, [])

  // Filter suggestions based on input
  useEffect(() => {
    if (!input.trim()) {
      setFilteredSuggestions(suggestionCards)
      return
    }

    const inputLower = input.toLowerCase()
    setFilteredSuggestions(
      suggestionCards.filter(
        (card) =>
          card.keywords.some((keyword) => keyword.toLowerCase().includes(inputLower)) ||
          card.title.toLowerCase().includes(inputLower) ||
          card.description.toLowerCase().includes(inputLower),
      ),
    )
  }, [input])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e as unknown as React.FormEvent)
      }
    },
    [handleSubmit],
  )

  const formatMessageTime = (date: Date) => format(date, "h:mm a")

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 flex flex-col relative pt-24">
          {/* Messages Area */}
          <div
            ref={chatContainerRef}
            className={cn(
              "flex-1 overflow-y-auto pb-32 md:pb-40",
              showWelcome && "flex items-center justify-center",
              "bg-background",
            )}
          >
            {showWelcome ? (
              <div className="container max-w-full mx-auto px-4 md:px-8">
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center gap-6 mb-8">
                    
                    <div className="text-left">
                      <h1 className="text-4xl font-bold text-foreground">
                        Git Friend <span className="text-primary">AI Assistant</span>
                      </h1>
                      <p className="text-xl text-muted-foreground mt-2">
                        Your personal Git and GitHub expert
                      </p>
                    </div>
                  </div>
                  <div className="max-w-2xl mx-auto bg-muted/50 rounded-xl p-6 backdrop-blur-sm">
                    <p className="text-lg text-muted-foreground">
                      Ask anything about version control and get instant, accurate answers. 
                      From basic Git commands to complex GitHub workflows, I'm here to help you 
                      master your version control journey.
                    </p>
                  </div>
                </div>

                <div className="max-w-3xl mx-auto mt-12 pb-32">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestionCards.map((card, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <SuggestionCard
                          icon={card.icon}
                          title={card.title}
                          description={card.description}
                          onClick={() => handleSuggestionClick(card.prompt)}
                        />
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    className="mt-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <p className="text-muted-foreground mb-4">Or type your own question below</p>
                    <div className="flex justify-center">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
                      >
                        <CornerDownLeft className="h-6 w-6 text-primary" />
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="container max-w-4xl mx-auto px-4 md:px-8 py-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    !message.isStreaming && (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <StreamdownMessage
                          role={message.role}
                          content={message.content}
                          feedback={message.feedback}
                          onFeedback={(feedback) => handleFeedback(message.id, feedback)}
                        />
                      </motion.div>
                    )
                  ))}

                  {/* Streaming Response */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <StreamdownMessage
                        role="assistant"
                        content={streamContent}
                        isStreaming={true}
                      />
                      {!streamContent && (
                        <div className="flex items-center gap-2 ml-4 mt-3 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Generating response...</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-background/80 backdrop-blur-xl border-t border-border shadow-lg z-10">
            <div className="container max-w-4xl mx-auto px-4 md:px-0">
              <form onSubmit={handleSubmit} className="relative">
                <Card
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isInputFocused && "ring-2 ring-primary/50",
                  )}
                >
                  <CardContent className="p-0">
                    <div className="relative flex items-center">
                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="Ask about Git or GitHub..."
                        className="border-0 pl-4 pr-14 py-4 text-base focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 flex items-center gap-1">
                        {input.trim() && (
                          <Button
                            type="submit"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90 transition-colors"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 text-white animate-spin" />
                            ) : (
                              <ArrowUp className="h-4 w-4 text-white" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </form>

              {!showWelcome && (
                <AnimatePresence>
                  {(input.trim() || !isMobile) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="flex flex-wrap gap-2">
                        {input.trim() ? (
                          filteredSuggestions.length > 0 ? (
                            <>
                              <div className="w-full mb-1 text-xs text-muted-foreground">
                                Suggestions based on your input:
                              </div>
                              {filteredSuggestions.slice(0, 3).map((suggestion, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="group"
                                >
                                  <Badge
                                    variant="outline"
                                    className="cursor-pointer hover:bg-muted transition-colors border-input hover:border-primary flex items-center gap-1.5 group-hover:border-primary text-foreground py-1.5"
                                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                                  >
                                    <span className="h-4 w-4 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                      {suggestion.icon}
                                    </span>
                                    {suggestion.title}
                                  </Badge>
                                </motion.div>
                              ))}
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground py-1">
                              No matching suggestions. Press Enter to send your message.
                            </div>
                          )
                        ) : (
                          <>
                            <div className="w-full mb-1 text-xs text-muted-foreground">Quick suggestions:</div>
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-muted transition-colors border-input hover:border-primary flex items-center gap-1.5 text-foreground py-1.5"
                              onClick={() => handleSuggestionClick("How do I create a branch in Git?")}
                            >
                              <span className="h-4 w-4 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                <GitBranch className="h-3 w-3" />
                              </span>
                              Create a branch
                            </Badge>
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-muted transition-colors border-input hover:border-primary flex items-center gap-1.5 text-foreground py-1.5"
                              onClick={() => handleSuggestionClick("How do I resolve merge conflicts?")}
                            >
                              <span className="h-4 w-4 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                <GitMerge className="h-3 w-3" />
                              </span>
                              Resolve conflicts
                            </Badge>
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-muted transition-colors border-input hover:border-primary flex items-center gap-1.5 text-foreground py-1.5"
                              onClick={() => handleSuggestionClick("What's the best way to create a pull request?")}
                            >
                              <span className="h-4 w-4 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                                <GitPullRequest className="h-3 w-3" />
                              </span>
                              Create pull request
                            </Badge>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

