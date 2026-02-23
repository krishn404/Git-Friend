"use client"

import { useState, useCallback, useRef } from "react"

export type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  feedback?: "like" | "dislike" | null
  isStreaming?: boolean
}

export type UseChatStreamReturn = {
  messages: ChatMessage[]
  isLoading: boolean
  streamContent: string
  error: string | null
  
  // Actions
  addMessage: (message: ChatMessage) => void
  updateStreamContent: (content: string) => void
  appendToStreamContent: (chunk: string) => void
  completeStream: () => void
  clearMessages: () => void
  updateMessageFeedback: (messageId: string, feedback: "like" | "dislike" | null) => void
}

export function useChatStream(): UseChatStreamReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamContent, setStreamContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const messageIdRef = useRef<string | null>(null)

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message])
  }, [])

  const updateStreamContent = useCallback((content: string) => {
    setStreamContent(content)
  }, [])

  const appendToStreamContent = useCallback((chunk: string) => {
    setStreamContent((prev) => prev + chunk)
  }, [])

  const completeStream = useCallback(() => {
    setMessages((prev) => {
      if (prev.length === 0) return prev
      const lastMessage = prev[prev.length - 1]
      if (lastMessage.role === "assistant") {
        return [
          ...prev.slice(0, -1),
          {
            ...lastMessage,
            content: streamContent,
            isStreaming: false,
          },
        ]
      }
      return prev
    })
    setStreamContent("")
  }, [streamContent])

  const clearMessages = useCallback(() => {
    setMessages([])
    setStreamContent("")
    setError(null)
    messageIdRef.current = null
  }, [])

  const updateMessageFeedback = useCallback((messageId: string, feedback: "like" | "dislike" | null) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, feedback } : msg))
    )
  }, [])

  return {
    messages,
    isLoading,
    streamContent,
    error,
    addMessage,
    updateStreamContent,
    appendToStreamContent,
    completeStream,
    clearMessages,
    updateMessageFeedback,
  }
}
