import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function GET() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You generate concise, useful Git and GitHub prompts. Return only valid JSON.",
        },
        {
          role: "user",
          content:
            'Generate four timely, diverse questions a developer could ask about Git or GitHub. Return exactly this JSON object shape: {"suggestions":["question one","question two","question three","question four"]}.',
        },
      ],
      model: process.env.GROQ_SUGGESTIONS_MODEL ?? "llama-3.1-8b-instant",
      temperature: 0.9,
      max_completion_tokens: 120,
      stream: false,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content ?? "";
    const cleaned = raw.replace(/```[a-z]*\n?/gi, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object in response");

    const parsed = JSON.parse(match[0]) as { suggestions?: unknown };
    const suggestions = parsed.suggestions;
    if (!Array.isArray(suggestions) || suggestions.length === 0 || !suggestions.every((item) => typeof item === "string")) {
      throw new Error("Invalid suggestions response");
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 4) });
  } catch (error: unknown) {
    console.error("Suggestions fetch failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ suggestions: [], error: "Suggestions are temporarily unavailable" }, { status: 502 });
  }
}
