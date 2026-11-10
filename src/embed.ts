import "dotenv/config";
import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "text-embedding-3-small";

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += 100) {
    const res = await openai.embeddings.create({
      model: MODEL,
      input: texts.slice(i, i + 100),
    });
    out.push(...res.data.map((d) => d.embedding));
  }
  return out;
}

export async function embedText(text: string): Promise<number[]> {
  return (await embedTexts([text]))[0];
}