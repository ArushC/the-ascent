export type LlmConfig = { apiKey: string; baseUrl: string; model: string };

const DEFAULT_LLM_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_LLM_MODEL = "gpt-4o-mini";

/** Reads the private provider settings; no API key means fallback-only mode. */
export function getLlmConfig(): LlmConfig | null {
  const apiKey = process.env.LLM_API_KEY?.trim();
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: normalizeLlmBaseUrl(process.env.LLM_BASE_URL),
    model: process.env.LLM_MODEL?.trim() || DEFAULT_LLM_MODEL,
  };
}

/** Removes trailing slashes so the chat-completions path can be appended once. */
export function normalizeLlmBaseUrl(baseUrl: string | undefined): string {
  return (baseUrl?.trim() || DEFAULT_LLM_BASE_URL).replace(/\/+$/, "");
}

/** Makes one provider request and returns the assistant's parsed JSON object. */
export async function requestJsonCompletion(
  config: LlmConfig,
  messages: Array<{ role: "system" | "user"; content: string }>,
  options: { temperature?: number } = {},
): Promise<unknown> {
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.model,
      response_format: { type: "json_object" },
      temperature: options.temperature,
      messages,
    }),
  });

  if (!response.ok) throw new Error(`LLM request failed with status ${response.status}.`);

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = completion.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new Error("LLM response did not include JSON content.");
  return JSON.parse(content) as unknown;
}
