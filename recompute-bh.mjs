// Recomputes Benjamini-Hochberg adjusted p-values (q) from the public results file.
// Usage: node recompute-bh.mjs [data/research-registry.json]     (Node 18+, no dependencies)
import { readFileSync } from "node:fs";

const file = process.argv[2] ?? new URL("./data/research-registry.json", import.meta.url);
const rows = JSON.parse(readFileSync(file, "utf8"));

// Same algorithm as the harness ledger: sort p ascending, q_(r) = min over s >= r of p_(s) * m / s.
function bhAdjust(ps) {
  const m = ps.length;
  const order = ps.map((p, i) => [p, i]).sort((a, b) => a[0] - b[0]);
  const q = new Array(m);
  let run = 1;
  for (let r = m - 1; r >= 0; r--) {
    run = Math.min(run, (order[r][0] * m) / (r + 1));
    q[order[r][1]] = run;
  }
  return q;
}

const Q_MAX = 0.1;
const q = bhAdjust(rows.map((r) => (Number.isFinite(r.p) && r.p >= 0 && r.p <= 1 ? r.p : 1)));
rows.forEach((r, i) => (r.qRecomputed = q[i]));

const ahead = rows.filter((r) => r.excessAnnual > 0);
const rawSig = ahead.filter((r) => r.p < 0.05);
const passed = rows.filter((r) => r.qRecomputed < Q_MAX);
const best = [...rows].sort((a, b) => a.qRecomputed - b.qRecomputed).slice(0, 5);
const median = [...rows.map((r) => r.excessAnnual)].sort((a, b) => a - b)[rows.length >> 1];
const pct = (x) => (x * 100).toFixed(1);

console.log(`strategies in file:                      ${rows.length}`);
console.log(`ahead of the benchmark (raw excess > 0): ${ahead.length}`);
console.log(`...of those with raw p < 0.05:           ${rawSig.length}`);
console.log(`median excess return per year:           ${pct(median)} points`);
console.log(`passing BH q < ${Q_MAX} (recomputed):        ${passed.length}`);
console.log(`passing BH q < ${Q_MAX} (published q col):   ${rows.filter((r) => r.q < Q_MAX).length}`);
console.log("\nfive lowest recomputed q (id, raw p, recomputed q, published q):");
for (const r of best) console.log(`  ${r.id.padEnd(46)} p=${r.p.toFixed(4)}  q=${r.qRecomputed.toFixed(3)}  published q=${r.q.toFixed(3)}`);
console.log(passed.length === 0 ? "\n0 passed." : `\n${passed.length} passed.`);
