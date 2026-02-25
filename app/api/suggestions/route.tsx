import { NextResponse } from "next/server"
import { Groq } from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function GET() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant. When asked for a JSON array, return ONLY the raw JSON array — no markdown, no code fences, no explanation.",
        },
        {
          role: "user",
          content:
            'Generate 4 short, diverse, interesting question suggestions a developer might ask about Git or GitHub. Return only a raw JSON array of 4 strings. Example: ["Question one?","Question two?","Question three?","Question four?"]',
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 1.0, // Higher temp = more variety each load
      max_completion_tokens: 200,
      stream: false,
    })

    const raw = completion.choices?.[0]?.message?.content ?? ""

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```[a-z]*\n?/gi, "").trim()

    // Extract JSON array
    const match = cleaned.match(/\[[\s\S]*\]/)
    if (!match) throw new Error("No JSON array in response")

    const parsed = JSON.parse(match[0])
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid suggestions array")

    return NextResponse.json({ suggestions: parsed.slice(0, 4) })
  } catch (error: any) {
    console.error("Suggestions fetch failed:", error?.message)
    return NextResponse.json({ suggestions: null }, { status: 500 })
  }
}