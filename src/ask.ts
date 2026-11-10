import { openai, embedText } from "./embed";
import { supabase } from "./db";

const TOP_K = 5;
const MIN_SIMILARITY = 0.25; // tune after testing

export type Answer = { answer: string; sources: string[] };

export async function ask(question: string): Promise<Answer> {
  const queryEmbedding = await embedText(question);

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: TOP_K,
  });
  if (error) throw error;

  const matches = (data ?? []).filter(
    (m: any) => m.similarity >= MIN_SIMILARITY
  );

  if (matches.length === 0) {
    return { answer: "I don't know based on the available docs.", sources: [] };
  }

  const context = matches
    .map((m: any, i: number) => `[${i + 1}] (${m.url})\n${m.content}`)
    .join("\n\n---\n\n");

  const completion = await openai.chat.completions.create({
    model: process.env.CHAT_MODEL ?? "gpt-4o-mini",
    temperature: 0,
    messages: [
      {
        role: "system",
        content:
          "Answer the question using ONLY the provided context. " +
          "If the context does not contain the answer, say you don't know. " +
          "Be concise. Cite sources like [1], [2].",
      },
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  const sources = [...new Set<string>(matches.map((m: any) => m.url))];
  return {
    answer: completion.choices[0].message.content ?? "",
    sources,
  };
}