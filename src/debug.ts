import { embedText } from "./embed";
import { supabase } from "./db";

(async () => {
  const q = process.argv[2] ?? "How do I connect Express to MongoDB?";
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: await embedText(q),
    match_count: 5,
  });
  if (error) throw error;
  for (const m of data) {
    console.log(m.similarity.toFixed(3), m.url);
    console.log(m.content.slice(0, 200).replace(/\n/g, " "), "\n");
  }
})();