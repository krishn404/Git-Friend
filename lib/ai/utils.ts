/**
 * Utility functions for AI chat operations
 * Handles message formatting, streaming, and processing
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export interface StreamingMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  feedback?: "like" | "dislike" | null
  isStreaming?: boolean
}

/**
 * Builds the messages array for API request
 * Includes system prompt and user messages
 */
export function buildMessagesForAPI(userMessage: string, systemPrompt: string): ChatMessage[] {
  return [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: userMessage,
    },
  ]
}

/**
 * Validates a streaming chunk from the API
 */
export function isValidStreamChunk(chunk: string): boolean {
  return typeof chunk === "string" && chunk.length > 0
}

/**
 * Sanitizes user input before sending to API
 */
export function sanitizeUserInput(input: string): string {
  return input.trim().slice(0, 10000)
}

/**
 * Extracts code blocks from markdown content
 */
export function extractCodeBlocks(content: string): Array<{ language: string; code: string }> {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g
  const blocks: Array<{ language: string; code: string }> = []
  let match

  while ((match = codeBlockRegex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || "plaintext",
      code: match[2],
    })
  }

  return blocks
}

/**
 * Formats timestamp for message display
 */
export function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

/**
 * Creates unique message ID
 */
export function generateMessageId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
