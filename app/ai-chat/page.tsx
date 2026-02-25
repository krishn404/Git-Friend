"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Copy, RefreshCw } from "lucide-react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/ui/navbar"
import { Message, MessageAction, MessageActions, MessageContent } from "@/components/ui/message"
import { ChatPromptInput } from "@/components/chat/chat-prompt-input"

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
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS)
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const chatRef = useRef<HTMLDivElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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
  }) => {
    const { userContent, history, assistantId } = opts

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
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, isStreaming: false } : msg,
        ),
      )
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

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

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")
    setIsStreaming(true)
    setAutoScroll(true)
    setShowScrollToBottom(false)

    await streamChat({ userContent: trimmed, history, assistantId })
  }

  const handleRegenerate = async () => {
    if (isStreaming || messages.length < 2) return

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

    await streamChat({ userContent, history, assistantId })
  }

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => {
        setCopiedId((current) => (current === messageId ? null : current))
      }, 1800)
    } catch (error) {
      console.error("Failed to copy message", error)
    }
  }

  const handleStop = () => {
    abortControllerRef.current?.abort()
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[#f7f7f5] text-zinc-900">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
          <div className="mx-auto w-full max-w-[960px] px-4">
            <Navbar />
          </div>
        </header>

        <main className="flex flex-1 flex-col">
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
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
                        Git Friend Chat
                      </p>
                      <h1 className="text-xl font-semibold text-zinc-900 sm:text-2xl">
                        Ask anything about Git or GitHub.
                      </h1>
                      <p className="max-w-xl text-sm text-zinc-600">
                        Get step-by-step guidance, conflict resolutions, and best practices,
                        rendered with rich markdown, code blocks, and live streaming.
                      </p>
                    </div>

                    <div className="grid w-full gap-3 md:grid-cols-2">
                      {suggestionsLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                            >
                              <div className="h-4 w-3/4 animate-pulse rounded-md bg-zinc-200" />
                              <div className="mt-2 h-3 w-1/2 animate-pulse rounded-md bg-zinc-100" />
                            </div>
                          ))
                        : suggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => setInput(suggestion)}
                              className="group rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
                            >
                              <p className="text-sm font-medium text-zinc-900 group-hover:text-zinc-950">
                                {suggestion}
                              </p>
                              <p className="mt-1 text-xs text-zinc-500">
                                Click to prefill the prompt and send.
                              </p>
                            </button>
                          ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {messages.map((message, index) => {
                      const previous = messages[index - 1]
                      const anchoredPrompt =
                        message.role === "assistant" && previous?.role === "user"
                          ? previous.content
                          : undefined

                      const isLastAssistant =
                        message.role === "assistant" &&
                        index === messages.length - 1 &&
                        previous?.role === "user"

                      const isUser = message.role === "user"

                      return (
                        <Message
                          key={message.id}
                          align={isUser ? "end" : "start"}
                          className="px-0"
                          avatar={
                            !isUser ? (
                              <img
                                src="/favicon.ico"
                                alt="Git Friend"
                                className="h-7 w-7"
                              />
                            ) : undefined
                          }
                        >
                          <div className="flex min-w-0 flex-1 flex-col gap-1">
                            {anchoredPrompt && (
                              <p className="text-[11px] font-normal leading-snug text-zinc-500">
                                {anchoredPrompt}
                              </p>
                            )}
                            {isUser ? (
                              <div className="flex justify-end">
                                <MessageContent
                                  markdown={false}
                                  className="max-w-[70%] rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-2 text-sm text-zinc-900 shadow-sm"
                                >
                                  {message.content}
                                </MessageContent>
                              </div>
                            ) : (
                              <MessageContent
                                markdown
                                isStreaming={message.isStreaming}
                                className="border-transparent bg-transparent px-0 py-0 text-zinc-900"
                              >
                                {message.content}
                              </MessageContent>
                            )}
                            {message.role === "assistant" && (
                              <MessageActions className="mt-1 text-[11px] text-zinc-500">
                                <MessageAction
                                  tooltip={copiedId === message.id ? "Copied" : "Copy message"}
                                  className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 hover:bg-zinc-100 hover:text-zinc-800"
                                  onClick={() => handleCopy(message.id, message.content)}
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>{copiedId === message.id ? "Copied" : "Copy"}</span>
                                </MessageAction>
                                {isLastAssistant && (
                                  <MessageAction
                                    tooltip="Regenerate response"
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 hover:bg-zinc-100 hover:text-zinc-800"
                                    onClick={handleRegenerate}
                                  >
                                    <RefreshCw className="h-3 w-3" />
                                    <span>Regenerate</span>
                                  </MessageAction>
                                )}
                              </MessageActions>
                            )}
                          </div>
                        </Message>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating sticky input bar */}
          <div className="fixed inset-x-0 bottom-0 z-20 bg-[#f7f7f5]">
            <div className="mx-auto w-full max-w-[960px] px-4 pb-5 pt-3">
              <div className="mx-auto flex w-full max-w-[680px] flex-col items-stretch gap-2">
                <div className="rounded-[24px] border border-zinc-200 bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
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
                  <p className="text-center text-[12px] text-zinc-500">
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
                className="pointer-events-auto rounded-full border border-zinc-300 bg-white/90 px-3 py-1 text-xs text-zinc-700 shadow-sm hover:bg-zinc-50"
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