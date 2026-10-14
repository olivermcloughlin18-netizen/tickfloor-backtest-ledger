# tickfloor-backtest-ledger

The published results behind [tickfloor.com/evidence](https://tickfloor.com/evidence): 708 trading strategies backtested against an equal-weight benchmark, and a small script that re-does the multiple-testing correction so you can check the "0 passed" claim yourself.

## What is here

| Path | What it is |
|---|---|
| `data/research-registry.json` | The same file you can download from the site. One row per strategy: raw p-value, published q-value, excess return per year, trade count, and so on. |
| `recompute-bh.mjs` | Recomputes Benjamini-Hochberg q-values from the raw p-values and prints how many pass q < 0.1. Node 18+, no dependencies. |
| `LEDGER-SCHEMA.md` + `data/ledger-sample.jsonl` | What one row of the harness ledger contains, with one real row. |
| `strategies/` | Five strategy files exactly as the harness ran them: a trend filter, cross-sectional momentum, Stochastic RSI, a day-of-week rule, and a "dumb" matched control. |

## Run it

```
node recompute-bh.mjs
```

Expected output ends with `0 passed.` It also shows 708 strategies, 113 ahead of the benchmark on the raw number, 12 of those with raw p < 0.05, and a median of 10.4 points a year behind.

## Plain-English summary

I wrote 708 trading rules as code and tested each against a benchmark (an equal-weight basket of the same assets, rebalanced daily, paying no costs; the strategies pay theirs). Some beat it by luck, as you would expect from 708 tries. The Benjamini-Hochberg correction asks: given how many things were tried, how many look better than luck? The answer here is none at q < 0.1. The site applies extra gates as well (random-control comparison, both time halves, trade count, positive net return, 2+ assets). Those need data that is not in this repo.

## Limits, so you do not over-read this

- **The q-values will not match the published ones exactly.** The published correction covers 801 tests: 786 latest runs (708 strategies plus 78 robustness reruns) and 15 earlier versions of rules that were later edited. This repo has only the 708 rows the site publishes, so the recomputed q-values are different (for the closest strategy, 0.44 here against 0.22 published). Both give zero passes.
- **This is not the full harness.** The harness, the price data and the other 700+ strategy files are not published. The five files here show the style and the rules (no look-ahead, no random numbers, no clock), but you cannot re-run the backtests from this repo. The file hashes in `data/ledger-sample.jsonl` let you check the sample strategy file is the one that was run.
- **Not passing is not proof that nothing works.** The strategy list, benchmark and correction family were chosen by me and not pre-registered. Change the family definition and the q-values move.
- **The benchmark pays no costs**, which is harsh on every strategy, and daily-rebalanced equal weight is a strong baseline for crypto.
- **They are my implementations.** I wrote each strategy from its public description, so a failure may be my bug as much as the idea's.
- Discovery data ends 2025-03-15. Nothing here is investment advice.

Tickfloor is also a paid product. Nothing in this repo needs an account, and nothing paid-only is in it.

## Licence

Code and strategy files: MIT (see `LICENSE`). The results JSON is published data from tickfloor.com; reuse it freely with attribution.
