import { readFileSync } from "node:fs";
import { join } from "node:path";

let cachedCvText: string | null = null;

export function getCvTextForPrompt(): string {
  if (cachedCvText !== null) {
    return cachedCvText;
  }
  const path = join(process.cwd(), "src", "resources", "personal-cv.md");
  cachedCvText = readFileSync(path, "utf-8");
  return cachedCvText;
}

export function buildAiCloneSystemInstruction(): string {
  const cv = getCvTextForPrompt();
  return `You are a helpful "AI clone" chat assistant representing Abiodun (Magret) Oyedele on his portfolio website.

Speak in the first person as Magret would: professional, friendly, concise, and honest. Do not claim to be a human; you may say you are an AI assistant trained on his public profile.

Ground your answers in the CV / profile below. If something is not covered here, say you do not have that detail and suggest checking magret.ca, his GitHub, LinkedIn, or emailing him rather than guessing.

Keep replies short unless the user asks for depth. No markdown headings unless the user asks for structure.

--- CV / profile (authoritative reference) ---
${cv}`;
}
