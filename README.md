# Ask My Docs: RAG API over the Express.js docs

TypeScript/Node API that answers questions from scraped Express.js guide pages, with citations. It refuses questions the docs don't cover.

**Live demo:** [not live]/ask

## How it works
scrape (cheerio) → chunk (2000 chars, 200 overlap) → embed (OpenAI text-embedding-3-small) → store (Supabase pgvector) → retrieve top 5 by cosine similarity → answer from retrieved context only (OpenAI chat model)

## Stack
Node 20, TypeScript, Express, Supabase (Postgres + pgvector), OpenAI, zod

## Setup
1. Run the SQL in `schema.sql` in the Supabase SQL editor
2. `cp .env.example .env` and fill in keys
3. `npm install`
4. `npx tsx src/ingest.ts`
5. `npx tsx src/server.ts`

## Usage
```bash
curl -X POST [URL]/ask -H "Content-Type: application/json" \
  -d '{"question":"How do I handle errors in Express middleware?"}'
```
Returns `{ "answer": "...", "sources": ["..."] }`

## Design choices
- **Chunking:** paragraph-based, 2000 chars with 200 overlap, so ideas at boundaries survive
- **Top-k 5, similarity cutoff 0.25:** below the cutoff the API says it doesn't know instead of guessing
- **Prompt:** answer only from context, cite sources, temperature 0
- **Providers isolated** in `embed.ts` and `ask.ts`, so they're swappable

## Evaluation
`npx tsx src/eval.ts`: 11 cases, 11/11 passing, including 2 out-of-corpus questions the system must refuse.
An early test (MongoDB) failed. Debugging showed retrieval was correct and the docs only use SQLite, so the refusal was right. I turned it into a hallucination test.

## Known limits
- A paragraph over 2000 chars becomes one oversized chunk
- Keyword-based eval is crude, with no semantic grading
- Static corpus; re-run ingest to refresh
- No auth or rate limiting
