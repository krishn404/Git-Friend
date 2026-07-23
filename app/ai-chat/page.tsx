"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Menu, X } from "lucide-react"
import { useQuery, useMutation } from "convex/react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/ui/navbar"
import { ChatPromptInput } from "@/components/chat/chat-prompt-input"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatHistorySidebar } from "@/components/chat/chat-history-sidebar"
import { Button } from "@/components/ui/button"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
}

const FALLBACK_SUGGESTIONS = [
  "Explain Git branching in simple terms.",
  "How do I safely resolve merge conflicts?",
  "Walk me through creating a pull request.",
  "Show best practices for commit messages.",
]

export default function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS)
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSessionId, setActiveSessionId] = useState<Id<"chatSessions"> | null>(null)
  const chatRef = useRef<HTMLDivElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Convex mutations and queries
  const sessions = useQuery(api.chatSessions.listForUser)
  const createSession = useMutation(api.chatSessions.create)
  const addMessage = useMutation(api.chatMessages.add)
  const touchSession = useMutation(api.chatSessions.touch)
  
  // Get messages for active session
  const sessionMessages = useQuery(
    activeSessionId ? api.chatMessages.listForSession : undefined,
    activeSessionId ? { chatSessionId: activeSessionId } : undefined
  )

  const hasMessages = messages.length > 0

  // Fetch dynamic suggestions from dedicated Groq-powered endpoint
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch("/api/suggestions")
        if (!res.ok) throw new Error("Suggestions request failed")

        const data = await res.json()
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSuggestions(data.suggestions)
        }
      } catch {
        // Silently fall back to hardcoded suggestions
      } finally {
        setSuggestionsLoading(false)
      }
    }

    fetchSuggestions()
  }, [])

  useEffect(() => {
    if (!autoScroll || !chatRef.current) return
    chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "auto" })
  }, [messages, autoScroll])

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    const target = event.currentTarget
    const threshold = 64
    const atBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - threshold

    if (!atBottom && autoScroll) {
      setAutoScroll(false)
      setShowScrollToBottom(true)
    } else if (atBottom && !autoScroll) {
      setAutoScroll(true)
      setShowScrollToBottom(false)
    }
  }

  const scrollToBottomSmooth = () => {
    if (!chatRef.current) return
    chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" })
    setAutoScroll(true)
    setShowScrollToBottom(false)
  }

  const streamChat = async (opts: {
    userContent: string
    history: ChatMessage[]
    assistantId: string
    sessionId: Id<"chatSessions">
  }) => {
    const { userContent, history, assistantId, sessionId } = opts

    try {
      const controller = new AbortController()
      abortControllerRef.current = controller

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userContent },
          ],
        }),
        signal: controller.signal,
      })

      if (!response.body) throw new Error("Missing response body")

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const segments = buffer.split("\n\n")
        buffer = segments.pop() ?? ""

        for (const segment of segments) {
          if (!segment.trim().startsWith("data:")) continue
          const data = segment.replace("data:", "").trim()
          if (!data || data === "[DONE]") continue

          try {
            const parsed = JSON.parse(data)
            const delta =
              parsed.content ??
              parsed.delta?.content ??
              parsed.choices?.[0]?.delta?.content ??
              ""

            if (delta) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, content: msg.content + delta } : msg,
                ),
              )
            }
          } catch (error) {
            console.error("Error parsing stream chunk", error, data)
          }
        }
      }
    } catch (error) {
      if ((error as any)?.name !== "AbortError") {
        console.error("Chat request failed", error)
      }
    } finally {
      setMessages((prev) => {
        const updated = prev.map((msg) =>
          msg.id === assistantId ? { ...msg, isStreaming: false } : msg,
        )

        // Save assistant message to Convex
        const assistantMsg = updated.find((m) => m.id === assistantId)
        if (assistantMsg && assistantMsg.content && sessionId) {
          void addMessage({
            chatSessionId: sessionId,
            role: "assistant",
            content: assistantMsg.content,
          })
          void touchSession({ sessionId })
        }

        return updated
      })
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

    try {
      // Create a new session if one doesn't exist
      let sessionId = activeSessionId
      if (!sessionId) {
        sessionId = await createSession({
          title: trimmed.slice(0, 50), // Use first message as title
        })
        setActiveSessionId(sessionId)
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
      }
      const assistantId = `assistant-${Date.now()}`
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      }

      const history = [...messages, userMessage]

      // Save user message to Convex
      await addMessage({
        chatSessionId: sessionId,
        role: "user",
        content: trimmed,
      })

      setMessages((prev) => [...prev, userMessage, assistantMessage])
      setInput("")
      setIsStreaming(true)
      setAutoScroll(true)
      setShowScrollToBottom(false)

      await streamChat({ userContent: trimmed, history, assistantId, sessionId })
    } catch (error) {
      console.error("Failed to send message:", error)
      setIsStreaming(false)
    }
  }

  const handleRegenerate = async () => {
    if (isStreaming || messages.length < 2 || !activeSessionId) return

    const lastAssistantIndex = [...messages].reverse().findIndex((m) => m.role === "assistant")
    if (lastAssistantIndex === -1) return

    const assistantGlobalIndex = messages.length - 1 - lastAssistantIndex
    const assistantMessage = messages[assistantGlobalIndex]
    const previous = messages[assistantGlobalIndex - 1]

    if (!assistantMessage || previous?.role !== "user") return

    const userContent = previous.content
    const assistantId = assistantMessage.id
    const history = messages.slice(0, assistantGlobalIndex)

    setMessages((prev) =>
      prev.map((msg, idx) =>
        idx === assistantGlobalIndex ? { ...msg, content: "", isStreaming: true } : msg,
      ),
    )
    setIsStreaming(true)
    setAutoScroll(true)
    setShowScrollToBottom(false)

    await streamChat({ userContent, history, assistantId, sessionId: activeSessionId })
  }

  const handleStop = () => {
    abortControllerRef.current?.abort()
  }

  const handleNewChat = () => {
    setActiveSessionId(null)
    setMessages([])
    setInput("")
    setSidebarOpen(false)
  }

  const handleSelectSession = (sessionId: Id<"chatSessions">) => {
    setActiveSessionId(sessionId)
    setMessages([])
    setSidebarOpen(false)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            <div className="flex-1">
              <Navbar />
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-row overflow-hidden">
          {/* Sidebar - mobile drawer or desktop sidebar */}
          {sidebarOpen && (
            <ChatHistorySidebar
              activeSessionId={activeSessionId}
              onSelectSession={handleSelectSession}
              onNewChat={handleNewChat}
              className="hidden lg:flex"
            />
          )}

          {/* Mobile overlay - closes sidebar when selecting session */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-10 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Scrollable message area */}
          <div
            ref={chatRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto"
          >
            <div className="mx-auto w-full max-w-[960px] px-4">
              <div className="mx-auto w-full max-w-[680px] pb-36 pt-6">
                {!hasMessages ? (
                  <div className="flex flex-col items-center justify-center gap-8 mt-[10%]">
                    <div className="space-y-3 text-center">
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                        Git Friend Chat
                      </p>
                      <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                        Ask anything about Git or GitHub.
                      </h1>
                      <p className="max-w-xl text-sm text-muted-foreground">
                        Get step-by-step guidance, conflict resolutions, and best practices,
                        rendered with rich markdown, code blocks, and live streaming.
                      </p>
                    </div>

                    <div className="grid w-full gap-3 md:grid-cols-2">
                      {suggestionsLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className="rounded-2xl border border-border bg-card p-4"
                            >
                              <div className="h-4 w-3/4 animate-pulse rounded-md bg-muted" />
                              <div className="mt-2 h-3 w-1/2 animate-pulse rounded-md bg-muted/50" />
                            </div>
                          ))
                        : suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setInput(suggestion)}
                              className="group rounded-2xl border border-border bg-card p-4 text-left transition hover:border-foreground/30 hover:bg-muted/20"
                            >
                              <p className="text-sm font-medium text-foreground group-hover:text-foreground">
                                {suggestion}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Click to prefill the prompt and send.
                              </p>
                            </button>
                          ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {messages.map((message, index) => {
                      const isLastAssistant =
                        message.role === "assistant" &&
                        index === messages.length - 1 &&
                        messages[index - 1]?.role === "user"

                      return (
                        <ChatMessage
                          key={message.id}
                          id={message.id}
                          role={message.role}
                          content={message.content}
                          isStreaming={message.isStreaming}
                          onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                        />
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating sticky input bar */}
          <div className="fixed inset-x-0 bottom-0 z-20 bg-background">
            <div className="mx-auto w-full max-w-[960px] px-4 pb-5 pt-3">
              <div className="mx-auto flex w-full max-w-[680px] flex-col items-stretch gap-2">
                <div className="rounded-[24px] border border-border bg-card shadow-sm">
                  <ChatPromptInput
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSubmit}
                    isStreaming={isStreaming}
                    onStop={handleStop}
                    suggestions={suggestions}
                  />
                </div>
                {hasMessages && (
                  <p className="text-center text-[12px] text-muted-foreground">
                    AI can make mistakes. Please double-check responses.
                  </p>
                )}
              </div>
            </div>
          </div>

          {showScrollToBottom && (
            <div className="pointer-events-none fixed bottom-28 left-0 right-0 flex justify-center">
              <button
                type="button"
                onClick={scrollToBottomSmooth}
                className="pointer-events-auto rounded-full border border-border bg-card/90 px-3 py-1 text-xs text-foreground shadow-sm hover:bg-muted"
              >
                Scroll to latest
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
