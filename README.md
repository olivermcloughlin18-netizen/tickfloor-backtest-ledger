# tickfloor-backtest-ledger

The published results behind [tickfloor.com/evidence](https://tickfloor.com/evidence): 708 trading strategies backtested against an equal-weight benchmark, and a small script that re-does the multiple-testing correction so you can check the "0 passed" claim yourself.

## What is here

| Path | What it is |
|---|---|
| `data/research-registry.json` | The same file you can download from the site. One row per strategy: raw p-value, published q-value, excess return per year, trade count, and so on. |
| `data/family-pvalues.json` | The raw p-value of every one of the 801 distinct tests the correction runs over (id, source hash, p, published q). The 708 rows above are the subset the site displays. |
| `recompute-bh.mjs` | Recomputes Benjamini-Hochberg q-values over all 801 p-values, checks they equal the published ones, and prints how many pass q < 0.1. Node 18+, no dependencies. |
| `LEDGER-SCHEMA.md` + `data/ledger-sample.jsonl` | What one row of the harness ledger contains, with one real row. |
| `strategies/` | Five strategy files exactly as the harness ran them: a trend filter, cross-sectional momentum, Stochastic RSI, a day-of-week rule, and a "dumb" matched control. |

## Run it

```
node recompute-bh.mjs
```

Expected: family size 801, `recomputed q differs from published q: 0 rows`, `0` passing at q < 0.1, and the last line `0 passed under both families.` It also shows 708 strategies displayed, 113 ahead of the benchmark on the raw number, 12 of those with raw p < 0.05, and a median of 10.4 points a year behind.

## Plain-English summary

I wrote 708 trading rules as code and tested each against a benchmark (an equal-weight basket of the same assets, rebalanced daily, paying no costs; the strategies pay theirs). Some beat it by luck, as you would expect from 708 tries. The Benjamini-Hochberg correction asks: given how many things were tried, how many look better than luck? The answer here is none at q < 0.1, whether you correct over 801 tests or only the 708 shown. The site applies extra gates as well (random-control comparison, both time halves, trade count, positive net return, 2+ assets). Those need data that is not in this repo.

## Limits, so you do not over-read this

- **The correction runs over 801 tests, not the 708 displayed.** 786 ids (708 strategies plus 78 robustness reruns) and 15 earlier versions of rules that were later edited. An edited rule counts as a new test, so tuning makes every result harder to pass. The script uses all 801 and reproduces the published q-values exactly. If you correct over only the 708 displayed rows you get different, larger q-values (lowest 0.44 against 0.22) and still 0 passes; the script prints both. The lowest q in the full family is 0.16, on an earlier version of a rule that is not among the displayed rows.
- **This is not the full harness.** The harness, the price data and the other 700+ strategy files are not published. The five files here show the style and the rules (no look-ahead, no random numbers, no clock), but you cannot re-run the backtests from this repo. The file hashes in `data/ledger-sample.jsonl` let you check the sample strategy file is the one that was run.
- **Not passing is not proof that nothing works.** The strategy list, benchmark and correction family were chosen by me and not pre-registered. Change the family definition and the q-values move.
- **The benchmark pays no costs**, which is harsh on every strategy, and daily-rebalanced equal weight is a strong baseline for crypto.
- **They are my implementations.** I wrote each strategy from its public description, so a failure may be my bug as much as the idea's.
- Discovery data ends 2025-03-15. Nothing here is investment advice.

Tickfloor is also a paid product. Nothing in this repo needs an account, and nothing paid-only is in it.

## Licence

Code and strategy files: MIT (see `LICENSE`). The results JSON is published data from tickfloor.com; reuse it freely with attribution.
