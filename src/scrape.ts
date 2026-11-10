import * as cheerio from "cheerio";

export type Page = { url: string; title: string; text: string };

export const URLS = [
  "https://expressjs.com/en/starter/hello-world.html",
  "https://expressjs.com/en/guide/routing.html",
  "https://expressjs.com/en/guide/using-middleware.html",
  "https://expressjs.com/en/guide/writing-middleware.html",
  "https://expressjs.com/en/guide/error-handling.html",
  "https://expressjs.com/en/guide/debugging.html",
  "https://expressjs.com/en/guide/behind-proxies.html",
  "https://expressjs.com/en/guide/database-integration.html",
];

export async function scrapePage(url: string): Promise<Page> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const $ = cheerio.load(await res.text());

  $("script, style, nav, header, footer, aside").remove();

  const root = ["main", "article", "#page-doc", ".content"]
    .map((s) => $(s).first())
    .find((el) => el.length > 0) ?? $("body");

  const parts: string[] = [];
  root.find("h1, h2, h3, p, li, pre").each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    if (t) parts.push(t);
  });

  return { url, title: $("title").text().trim(), text: parts.join("\n\n") };
}

export async function scrapeAll(urls = URLS): Promise<Page[]> {
  const pages: Page[] = [];
  for (const url of urls) {
    try {
      pages.push(await scrapePage(url));
      console.log("scraped", url);
    } catch (e) {
      console.error("failed", url, e);
    }
    await new Promise((r) => setTimeout(r, 500)); // be polite
  }
  return pages;
}