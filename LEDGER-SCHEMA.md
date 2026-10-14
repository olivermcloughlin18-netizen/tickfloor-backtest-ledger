# Ledger schema

Every backtest run appends one JSON object per line to an append-only ledger (`ledger.jsonl`, not published in full). `data/ledger-sample.jsonl` is one real row (`sma200_qqq`). Each row ties a result to the exact strategy source, data and harness that produced it, by SHA-256 hash.

| Field | Meaning |
|---|---|
| `id`, `name`, `family`, `source` | Identity. A changed strategy file under the same `id` counts as a new test, so tuning is visible. `source` is the paper or content the rule came from. |
| `mode`, `assetClass`, `timeframe`, `assets`, `nAssets` | `signal` (one position per asset) or `portfolio` (cross-sectional ranking); asset class; bar size; the assets traded. |
| `strategyPath`, `resultPath` | Where the strategy file and full result lived in the private repo. |
| `sourceSha256` | SHA-256 of the strategy file. `shasum -a 256 strategies/sma200_qqq.mjs` gives the same value. |
| `dataSha256`, `harnessSha256` | Hashes of the price data and the harness code at run time (the data and harness are not published). |
| `metricsVersion` | Version of the metrics code. |
| `ranAt`, `recomputedAt` | Timestamps. |
| `pExcess` | Raw p-value for "excess return over the benchmark is zero or less". Feeds the Benjamini-Hochberg step. |
| `excessAnnual` | Strategy minus benchmark return per year (0.01 = 1 point). |
| `cagr`, `bhCagr` | Strategy and benchmark compound annual return after costs (benchmark pays none). |
| `sharpe`, `bhSharpe`, `pSharpe` | Sharpe ratios and the p-value for the Sharpe difference. |
| `maxDD`, `bhMaxDD` | Maximum drawdown, strategy and benchmark. |
| `trades`, `rebalances`, `exposure` | Trade count (signal mode), rebalance count (portfolio mode), share of time invested. |
| `netExpectancy` | Average net result per trade. |
| `randomPercentile`, `randomSharpePercentile` | Where the strategy sits against random-entry controls with the same exposure (0.95 = better than 95% of them). |
| `halfExcess`, `halfSharpeDiff` | The same excess return and Sharpe difference computed separately on the two halves of the discovery window. |

## Pass rule

A strategy passes only if all hold: Benjamini-Hochberg q < 0.1 over the whole ledger family; random-control percentile at least 0.95; positive excess in both halves; enough trades (30 in signal mode, 36 rebalances in portfolio mode); positive net CAGR; at least 2 assets. `recompute-bh.mjs` checks only the first gate, because the rest need data that is not published.

The public `research-registry.json` carries a subset of these fields: `id`, `name`, `family`, `assetClass`, `beatBuyHoldAfterCosts`, `run`, `excessAnnual`, `p` (= `pExcess`), `q`, `trades`, `nAssets`, `timeframe`, `dataEnd`, `benchmark`, `evidencePath`. A `run` id ending `__robN` is a robustness rerun of the strategy, so its p and q can differ from the original run's.
