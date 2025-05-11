"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  ArrowUp,
  Copy,
  Check,
  Mic,
  GitBranch,
  GitMerge,
  GitPullRequest,
  GitCommit,
  Clock,
  Zap,
  GitGraph,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  CornerDownLeft,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import ReactMarkdown from "react-markdown"


type ChatMessage = {
  role: "user" | "assistant"
  content: string
  id: string
  timestamp: Date
  feedback?: "like" | "dislike" | null
}

type SuggestionCardProps = {
  icon: React.ReactNode
  title: string
  description: string
  prompt: string
  color: string
  keywords: string[]
}

export default function AIChat() {
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

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamContent, setStreamContent] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const [filteredSuggestions, setFilteredSuggestions] = useState<SuggestionCardProps[]>(suggestionCards)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const { toast } = useToast()
  const isMobile = useMobile()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamContent])

  // Hide welcome screen when there are messages
  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false)
    } else {
      setShowWelcome(true)
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
      id: Date.now().toString(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setStreamContent("") // Clear any previous streaming content

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
        }),
      })

      if (!response.ok) throw new Error("Failed to fetch response")

      const reader = response.body?.getReader()
      if (!reader) throw new Error("Response body is null")

      let accumulatedContent = ""

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunkText = new TextDecoder().decode(value)
            const lines = chunkText.split("\n\n")

            for (const line of lines) {
              if (!line.trim() || !line.startsWith("data:")) continue

              const data = line.replace("data:", "").trim()
              if (data === "[DONE]") break

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  accumulatedContent += parsed.content
                  setStreamContent(accumulatedContent)
                }
              } catch (e) {
                console.error("Error parsing JSON from stream:", e, data)
              }
            }
          }

          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: accumulatedContent,
              id: Date.now().toString(),
              timestamp: new Date(),
              feedback: null,
            },
          ])

          setIsLoading(false)
        } catch (error) {
          console.error("Error processing stream:", error)
          setIsLoading(false)
        }
      }

      processStream()
    } catch (error) {
      console.error("Error fetching response:", error)
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast({
      title: "Copied to clipboard",
      description: "The message has been copied to your clipboard.",
      duration: 2000,
    })
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleFeedback = (id: string, type: "like" | "dislike") => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === id) {
          return {
            ...message,
            feedback: message.feedback === type ? null : type,
          }
        }
        return message
      }),
    )

    toast({
      title: type === "like" ? "Feedback: Helpful" : "Feedback: Not Helpful",
      description: "Thank you for your feedback!",
      duration: 2000,
    })
  }

  const handleSuggestionClick = async (prompt: string) => {
    setInput(prompt)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Update suggestions based on input
  useEffect(() => {
    if (!input.trim()) {
      setFilteredSuggestions(suggestionCards)
      return
    }

    const filtered = suggestionCards.filter((card) => {
      const inputLower = input.toLowerCase()
      return (
        card.keywords.some((keyword) => keyword.toLowerCase().includes(inputLower)) ||
        card.title.toLowerCase().includes(inputLower) ||
        card.description.toLowerCase().includes(inputLower)
      )
    })

    setFilteredSuggestions(filtered)
  }, [input])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    // Filtering is handled by the useEffect above
  }

  // Format timestamp
  const formatMessageTime = (date: Date) => {
    return format(date, "h:mm a")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar />

        <main className="flex-1 flex flex-col relative pt-24">
          {/* Chat messages area */}
          <div
            ref={chatContainerRef}
            className={cn(
              "flex-1 overflow-y-auto pb-32 md:pb-40",
              showWelcome ? "flex items-center justify-center" : "",
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
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn("group", message.role === "user" ? "flex justify-end" : "flex justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] md:max-w-[75%]",
                          message.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start",
                        )}
                      >
                        <div className="flex items-center mb-1 text-xs text-muted-foreground">
                          {message.role === "user" ? (
                            <>
                              <Clock className="h-3 w-3 mr-1" />
                              {formatMessageTime(message.timestamp)}
                            </>
                          ) : (
                            <>
                              <span className="font-medium mr-1">Git Friend</span> •{" "}
                              {formatMessageTime(message.timestamp)}
                            </>
                          )}
                        </div>

                        <div
                          className={cn(
                            "px-4 py-3 rounded-2xl shadow-sm",
                            message.role === "user"
                              ? "bg-primary text-white rounded-tr-sm"
                              : "bg-card border border-border rounded-tl-sm",
                          )}
                        >
                          {message.role === "assistant" ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown
                                components={{
                                  a: ({ node, ...props }) => (
                                    <Badge
                                      variant="outline"
                                      className="inline-flex items-center gap-1.5 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      onClick={() => window.open(props.href, '_blank')}
                                    >
                                      <span className="h-3 w-3 rounded-full flex items-center justify-center bg-primary/10">
                                        <GitBranch className="h-2 w-2" />
                                      </span>
                                      {props.children}
                                    </Badge>
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{message.content}</div>
                          )}
                        </div>

                        {message.role === "assistant" && (
                          <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                                      onClick={() => copyToClipboard(message.content, message.id)}
                                    >
                                      {copiedId === message.id ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Copy to clipboard</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-8 w-8 rounded-full",
                                        message.feedback === "like"
                                          ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                      )}
                                      onClick={() => handleFeedback(message.id, "like")}
                                    >
                                      <ThumbsUp className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Helpful</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={cn(
                                        "h-8 w-8 rounded-full",
                                        message.feedback === "dislike"
                                                                                  ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                      )}
                                      onClick={() => handleFeedback(message.id, "dislike")}
                                    >
                                      <ThumbsDown className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Not helpful</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Response Stream */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[85%] md:max-w-[75%] flex flex-col items-start">
                        <div className="flex items-center mb-1 text-xs text-muted-foreground">
                          <span className="font-medium mr-1">Git Friend</span> • {formatMessageTime(new Date())}
                        </div>
                        <div className="px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm bg-card border border-border">
                          {streamContent ? (
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <ReactMarkdown
                                components={{
                                  a: ({ node, ...props }) => (
                                    <Badge
                                      variant="outline"
                                      className="inline-flex items-center gap-1.5 text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                                      onClick={() => window.open(props.href, '_blank')}
                                    >
                                      <span className="h-3 w-3 rounded-full flex items-center justify-center bg-primary/10">
                                        <GitBranch className="h-2 w-2" />
                                      </span>
                                      {props.children}
                                    </Badge>
                                  ),
                                }}
                              >
                                {streamContent}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                <Zap className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-sm text-muted-foreground">AI is thinking...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Fixed input at the bottom */}
          <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-background/80 backdrop-blur-xl border-t border-border shadow-lg z-10">
            <div className="container max-w-4xl mx-auto px-4 md:px-0">
              <form onSubmit={handleSubmit} className="relative">
                <Card
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isInputFocused ? "ring-2 ring-primary/50" : "",
                  )}
                >
                  <CardContent className="p-0">
                    <div className="relative">

                      <Input
                        ref={inputRef}
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="Ask about Git or GitHub..."
                        className="border-0 pl-16 pr-12 py-6 text-base focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                        disabled={isLoading}
                      />

                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {input.trim() ? (
                          <Button
                            type="submit"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 transition-colors"
                            disabled={isLoading}
                          >
                            <ArrowUp className="h-5 w-5 text-white" />
                          </Button>
                        ) :(
                          <>
                          </>
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

