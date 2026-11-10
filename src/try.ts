import { scrapePage } from "./scrape";
import { chunkText } from "./chunk";

(async () => {
  const page = await scrapePage("https://expressjs.com/en/guide/routing.html");
  const chunks = chunkText(page.text);
  console.log(page.title, page.text.length, "chars ->", chunks.length, "chunks");
  console.log(chunks[0]);
})();