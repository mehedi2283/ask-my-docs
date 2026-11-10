import "dotenv/config";
import express from "express";
import { z } from "zod";
import { ask } from "./ask";

const app = express();
app.use(express.json());

const Body = z.object({ question: z.string().trim().min(3).max(500) });

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/ask", async (req, res) => {
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "question must be 3-500 characters" });
  }
  try {
    res.json(await ask(parsed.data.question));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "internal error" });
  }
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`listening on :${port}`));