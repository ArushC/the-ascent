type ChatMessage = { role: "system" | "user"; content: string };

async function complete(messages: ChatMessage[], json: boolean): Promise<string> {
  const apiKey = process.env.LLM_API_KEY?.trim();
  if (!apiKey) throw new Error("LLM_API_KEY is required for this workflow step.");
  const baseUrl = (process.env.LLM_BASE_URL?.trim() || "https://api.groq.com/openai/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL?.trim() || "llama-3.1-8b-instant";
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {})
    })
  });
  if (!response.ok) throw new Error(`LLM request failed (${response.status}): ${await response.text()}`);
  const body = await response.json() as { choices?: { message?: { content?: string } }[] };
  const text = body.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("LLM returned an empty response.");
  return text;
}

/** Requests an unstructured text completion from the configured LLM. */
export const requestTextCompletion = (prompt: string) => complete([{ role: "user", content: prompt }], false);

/** Requests and parses a JSON completion from the configured LLM. */
export async function requestJsonCompletion<T>(prompt: string): Promise<T> {
  return JSON.parse(await complete([{ role: "user", content: prompt }], true)) as T;
}
