import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import { buildAiCloneSystemInstruction } from "@/lib/ai-clone-prompt";

export const runtime = "nodejs";

const MODEL_ID = "gemini-2.5-flash";

const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 8000;

type ChatMessage = { role: "user" | "assistant"; content: string };

function toGeminiHistory(messages: ChatMessage[]) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages = (body as { messages?: ChatMessage[] }).messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Expected a non-empty messages array." }, { status: 400 });
  }

  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json(
      { error: `At most ${MAX_MESSAGES} messages are allowed per request.` },
      { status: 400 },
    );
  }

  for (const m of messages) {
    if (
      !m ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string"
    ) {
      return NextResponse.json(
        { error: "Each message must have role 'user' | 'assistant' and string content." },
        { status: 400 },
      );
    }
    if (m.content.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json(
        { error: `Each message must be at most ${MAX_MESSAGE_CHARS} characters.` },
        { status: 400 },
      );
    }
  }

  const last = messages[messages.length - 1];
  if (last.role !== "user") {
    return NextResponse.json(
      { error: "The last message in the thread must be from the user." },
      { status: 400 },
    );
  }

  const prior = messages.slice(0, -1);
  for (let i = 0; i < prior.length; i++) {
    const expected = i % 2 === 0 ? "user" : "assistant";
    if (prior[i].role !== expected) {
      return NextResponse.json(
        { error: "Messages must alternate starting with user: user, assistant, user, …" },
        { status: 400 },
      );
    }
  }

  const systemInstruction = buildAiCloneSystemInstruction();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      systemInstruction,
    });

    const history = toGeminiHistory(prior);
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(last.content);
    const text = result.response.text();

    return NextResponse.json({ reply: text });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gemini request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
