import { NextResponse } from "next/server"
import { Groq } from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, text } = body

    if (!text || !action) {
      return NextResponse.json(
        { error: "Missing required fields: text and action" },
        { status: 400 }
      )
    }

    // Map actions to prompts
    const promptMap: Record<string, string> = {
      shorten: "Make this text more concise and concise while preserving the key information. Remove redundancy.",
      expand: "Expand this text with more detail, explanation, and context. Make it more comprehensive.",
      rephrase: "Rewrite this text in clearer, more professional language. Improve readability.",
      refine:
        "Improve the quality, clarity, and professionalism of this text. Fix any issues and make it more engaging.",
    }

    const prompt = promptMap[action] || "Improve this text."

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional README editor. Your task is to refine markdown content. Always respond with only the refined text, nothing else. Do not add explanations or markdown formatting around your response.",
        },
        {
          role: "user",
          content: `${prompt}\n\nOriginal text:\n${text}`,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_completion_tokens: 2000,
      top_p: 1,
    })

    const refinedText = completion.choices[0]?.message?.content || text

    return NextResponse.json({
      refinedText: refinedText.trim(),
      success: true,
    })
  } catch (error) {
    console.error("Text refinement error:", error)
    return NextResponse.json(
      { error: "Failed to refine text", success: false },
      { status: 500 }
    )
  }
}
