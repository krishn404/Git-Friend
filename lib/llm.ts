import { Groq } from "groq-sdk"
import OpenAI from "openai"

/**
 * Shared chat client for every LLM call in Git-Friend.
 *
 * By default the app talks to Groq exactly as before. Setting `LITELLM_BASE_URL`
 * routes every call through a LiteLLM proxy instead, so Git-Friend can reach
 * 100+ providers (OpenAI, Anthropic, Gemini, Bedrock, Azure, self-hosted, ...)
 * behind one OpenAI-compatible endpoint — keys, spend limits and fallbacks
 * centralised in the proxy.
 *
 * The LiteLLM branch uses the OpenAI SDK (already a dependency and the wire
 * format Groq's SDK implements), returned behind the `Groq` type so every
 * existing `groq.chat.completions.create(...)` call site stays byte-for-byte
 * unchanged.
 */
export function getLLMClient(): Groq {
  const litellmBase = process.env.LITELLM_BASE_URL?.trim()
  if (litellmBase) {
    const client = new OpenAI({
      baseURL: litellmBase.replace(/\/+$/, ""),
      // Fall back to GROQ_API_KEY so an existing deployment keeps working when
      // the proxy reuses the same credential.
      apiKey: process.env.LITELLM_API_KEY?.trim() || process.env.GROQ_API_KEY || "",
    })
    // Groq's SDK is the OpenAI chat-completions wire format, so the OpenAI
    // client is drop-in for the `chat.completions.create` calls used here.
    return client as unknown as Groq
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY! })
}

/**
 * Resolve the model id for a call. When a LiteLLM proxy is configured,
 * `LITELLM_MODEL` (a proxy model alias) overrides the Groq model; otherwise the
 * caller's Groq model is used unchanged.
 */
export function resolveModel(groqModel: string): string {
  if (process.env.LITELLM_BASE_URL?.trim()) {
    return process.env.LITELLM_MODEL?.trim() || groqModel
  }
  return groqModel
}

/** Whether a LiteLLM proxy is configured. */
export function isLiteLLMEnabled(): boolean {
  return Boolean(process.env.LITELLM_BASE_URL?.trim())
}
