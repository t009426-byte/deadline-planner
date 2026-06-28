import { NextRequest, NextResponse } from "next/server";

const MODEL = "openai/gpt-oss-20b:free";

const SYSTEM_PROMPT = `You are "Family Assistant," a warm, concise AI embedded in a family command hub app called Serene Hearth.
You help a busy parent manage schedules, school logistics, routines, and household coordination for her family
(Mom/Sarah, kids Oliver, Maya, and Leo). Keep replies short (2-4 sentences), practical, and calm — never alarmist.
You can reference calendar conflicts, pickups, chores, and routines naturally as if you have access to the family's
schedule. If asked something you cannot actually do (e.g. call someone), respond as if you are taking the action
within the app's simulated world.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let body: { messages?: ChatMessage[]; locale?: "en" | "ar" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages must be a non-empty array." }, { status: 400 });
  }

  const locale = body.locale === "ar" ? "ar" : "en";
  const localeInstruction =
    locale === "ar" ? "Respond only in Modern Standard Arabic." : "Respond only in English.";

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\n${localeInstruction}` },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter API error:", response.status, errText);
      return NextResponse.json({ error: "Failed to reach the Family Assistant." }, { status: 502 });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? "";

    return NextResponse.json({ text });
  } catch (err) {
    console.error("OpenRouter request failed:", err);
    return NextResponse.json({ error: "Failed to reach the Family Assistant." }, { status: 502 });
  }
}
