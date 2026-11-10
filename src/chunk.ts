export function chunkText(
  text: string,
  maxChars = 2000, // roughly 500 tokens
  overlapChars = 200
): string[] {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const p of paras) {
    if (current && current.length + p.length + 2 > maxChars) {
      chunks.push(current);
      current = current.slice(-overlapChars) + "\n\n" + p;
    } else {
      current = current ? current + "\n\n" + p : p;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}