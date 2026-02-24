"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/ui/navbar"
import { ChatPromptInput } from "@/components/chat/chat-prompt-input"
import { AIResponse } from "@/components/chat/ai-response"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  isStreaming?: boolean
}

const SUGGESTIONS = [
  "Explain Git branching in simple terms.",
  "How do I safely resolve merge conflicts?",
  "Walk me through creating a pull request.",
  "Show best practices for commit messages.",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  const chatRef = useRef<HTMLDivElement | null>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const hasMessages = messages.length > 0

  // Keep viewport gently pinned near the latest content while streaming.
  useEffect(() => {
    if (!autoScroll) return
    const el = chatRef.current
    if (!el) return

    const threshold = 48
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    if (distanceFromBottom > threshold) return

    el.scrollTop = el.scrollHeight
  }, [messages, autoScroll])

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    const target = event.currentTarget
    const threshold = 48
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
    const el = chatRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    setAutoScroll(true)
    setShowScrollToBottom(false)
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

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput("")
    setIsStreaming(true)
    setAutoScroll(true)
    setShowScrollToBottom(false)

    try {
      const controller = new AbortController()
      abortControllerRef.current = controller

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: trimmed },
          ],
        }),
        signal: controller.signal,
      })

      if (!response.body) {
        throw new Error("Missing response body")
      }

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

  const handleStop = () => {
    abortControllerRef.current?.abort()
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <Navbar />
        <main className="flex-1 pt-16">
          <div className="chat-editorial flex h-[calc(100vh-4rem)] flex-col px-4 pb-4 md:px-6">
            <div
              ref={chatRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto hide-scrollbar"
            >
              <div className="space-y-10 py-6 md:py-10">
                {!hasMessages && (
                  <section className="mt-8 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base md:leading-loose">
                    <p className="font-medium text-foreground">
                      A calm space for Git and GitHub questions.
                    </p>
                    <p>
                      Ask in your own words and Git Friend will respond with clear, editorial answers
                      designed for focused reading.
                    </p>
                  </section>
                )}

                {messages.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[75%] text-right text-sm leading-relaxed text-foreground/90 md:text-[0.975rem] md:leading-relaxed">
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-start">
                      <AIResponse content={message.content} isStreaming={message.isStreaming} />
                    </div>
                  ),
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="mt-4 pt-3">
              <ChatPromptInput
                value={input}
                onChange={setInput}
                onSubmit={handleSubmit}
                isStreaming={isStreaming}
                onStop={handleStop}
                suggestions={SUGGESTIONS}
              />
            </div>

            {showScrollToBottom && (
              <div className="pointer-events-none fixed bottom-20 left-0 right-0 flex justify-center">
                <button
                  type="button"
                  onClick={scrollToBottomSmooth}
                  className="pointer-events-auto rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground hover:bg-muted"
                >
                  Scroll to latest
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

