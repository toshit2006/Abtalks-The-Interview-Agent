/**
 * Server-side Groq API integration for ultra-fast LLM inference.
 * Uses OpenAI-compatible REST endpoint via native fetch.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

export const groqEnabled = (): boolean => Boolean(process.env["GROQ_API_KEY"]?.trim());

export async function callGroq(
  system: string,
  user: string,
  maxTokens = 500,
): Promise<string | null> {
  const apiKey = process.env["GROQ_API_KEY"]?.trim();
  if (!apiKey) return null;

  const model = process.env["GROQ_MODEL"]?.trim() || DEFAULT_MODEL;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Groq API error ${res.status}: ${errorText}`);
      return null;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    return reply || null;
  } catch (err) {
    console.error("Groq API call failed:", err);
    return null;
  }
}
