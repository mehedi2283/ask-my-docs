import { readFileSync } from "fs";
import { ask } from "./ask";

type Case = { q: string; keywords?: string[]; expectUnknown?: boolean };

async function main() {
  const cases: Case[] = JSON.parse(readFileSync("eval/questions.json", "utf8"));
  let passed = 0;

  for (const c of cases) {
    const { answer } = await ask(c.q);
    const text = answer.toLowerCase();
    const ok = c.expectUnknown
      ? text.includes("don't know")
      : c.keywords!.every((k) => text.includes(k.toLowerCase()));
    if (ok) passed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${c.q}`);
    if (!ok) console.log(`      got: ${answer.slice(0, 150)}`);
  }
  console.log(`\n${passed}/${cases.length} passed`);
}

main();