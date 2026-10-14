// Recomputes Benjamini-Hochberg adjusted p-values (q) from the public results file.
// Usage: node recompute-bh.mjs [data/research-registry.json]     (Node 18+, no dependencies)
import { readFileSync } from "node:fs";

const load = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), "utf8"));
const published = load("./data/research-registry.json"); // 708 rows the site shows
const family = load("./data/family-pvalues.json"); // all 801 distinct tests the site corrects over

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
const clean = (p) => (Number.isFinite(p) && p >= 0 && p <= 1 ? p : 1);

// 1) The method the site uses: BH over the whole family of 801 tests.
const qFam = bhAdjust(family.map((r) => clean(r.p)));
const famMismatch = family.filter((r, i) => Math.abs(qFam[i] - r.qPublished) > 1e-9).length;
const passedFam = qFam.filter((q) => q < Q_MAX).length;
console.log(`family size M:                           ${family.length}`);
console.log(`recomputed q differs from published q:   ${famMismatch} rows`);
console.log(`lowest recomputed q:                     ${Math.min(...qFam).toFixed(3)}`);
console.log(`passing BH q < ${Q_MAX} (801-test family):   ${passedFam}`);

// 2) Sensitivity: BH over only the 708 published rows (what you get if you ignore the 93 extra tests).
const q708 = bhAdjust(published.map((r) => clean(r.p)));
console.log(`passing BH q < ${Q_MAX} (708 rows only):     ${q708.filter((q) => q < Q_MAX).length}   (lowest q ${Math.min(...q708).toFixed(3)})`);

// 3) Published q column vs the family run, for the 708 shown rows.
console.log(`passing q < ${Q_MAX} (published q column):   ${published.filter((r) => r.q < Q_MAX).length}`);

const ahead = published.filter((r) => r.excessAnnual > 0);
const median = published.map((r) => r.excessAnnual).sort((a, b) => a - b)[published.length >> 1];
console.log(`\n${published.length} strategies shown; ${ahead.length} ahead of benchmark on the raw number; ${ahead.filter((r) => r.p < 0.05).length} of those have raw p < 0.05; median excess ${(median * 100).toFixed(1)} points a year.`);
console.log(passedFam === 0 && q708.every((q) => q >= Q_MAX) ? "0 passed under both families." : "SOMETHING PASSED: check the output above.");
