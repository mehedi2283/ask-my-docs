import { scrapeAll } from "./scrape";
import { chunkText } from "./chunk";
import { embedTexts } from "./embed";
import { supabase } from "./db";

async function main() {
  const pages = await scrapeAll();

  for (const page of pages) {
    const chunks = chunkText(page.text);
    if (chunks.length === 0) continue;

    const embeddings = await embedTexts(chunks);

    const rows = chunks.map((content, i) => ({
      url: page.url,
      title: page.title,
      chunk_index: i,
      content,
      embedding: embeddings[i],
    }));

    // delete old rows for this URL so re-running doesn't create duplicates
    const del = await supabase.from("documents").delete().eq("url", page.url);
    if (del.error) throw del.error;

    const ins = await supabase.from("documents").insert(rows);
    if (ins.error) throw ins.error;

    console.log(`ingested ${chunks.length} chunks <- ${page.url}`);
  }
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});