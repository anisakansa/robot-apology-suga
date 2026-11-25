// The Robot Apology (u-suga-the-robot-apology-dd96bb59).
// Entry program: writes a two-line robot confession to output/entry.txt.
// Deterministic by construction: a constant string, no clock, no random,
// no network, no environment reads. Guards use fixed budgets only.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const LINE1 =
  "I am sorry I reminded you about the dentist every fifteen minutes, because I read 'remind me' as 'remind me until you answer'.";
const LINE2 =
  "I learned a reminder is a nudge, not a loop, so I will send it once now and then wait quietly for your reply.";
const ENTRY = LINE1 + "\n" + LINE2;

// Pinned at 236 after a measured run (hand count was off by one);
// the round-trip check below fails loudly if it drifts.
const EXPECTED_CHARS = 236;

function isPureAscii(text: string): boolean {
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) > 127) return false;
  }
  return true;
}

function gate(text: string): void {
  if (text.length < 1 || text.length > 400) {
    throw new Error(`gate: length ${text.length} outside 1..400`);
  }
  if (text.length !== EXPECTED_CHARS) {
    throw new Error(`gate: length ${text.length} != pinned ${EXPECTED_CHARS}`);
  }
  if (!isPureAscii(text)) throw new Error("gate: non-ASCII character");
  const lines = text.split("\n");
  if (lines.length !== 2) {
    throw new Error(`gate: ${lines.length} lines, want 2`);
  }
  for (const line of lines) {
    if (line.length === 0) throw new Error("gate: empty line");
    if (line !== line.trim()) {
      throw new Error("gate: leading/trailing whitespace");
    }
    if (!line.endsWith(".") && !line.endsWith("!") && !line.endsWith("?")) {
      throw new Error("gate: line is not one sentence");
    }
  }
  if (text.endsWith("\n")) throw new Error("gate: trailing newline");
}

gate(ENTRY);

mkdirSync("output", { recursive: true });
writeFileSync("output/entry.txt", ENTRY, "utf8");
try {
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", ENTRY, "utf8");
} catch {
  // Absolute /output is a sandbox convenience; the relative copy is the artifact.
}

const roundTrip = readFileSync("output/entry.txt", "utf8");
if (roundTrip !== ENTRY) {
  throw new Error("round-trip: file bytes differ from entry");
}
