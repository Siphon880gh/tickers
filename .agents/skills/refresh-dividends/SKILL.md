---
name: refresh-dividends
description: >-
  Refreshes dividend fields on catalog tickers from live free sources:
  whether each one currently pays, payout frequency, and consecutive
  years of raises. Use when the user asks to update dividend data,
  frequency, consistency, Aristocrat or King labels, or stale dividend
  checked dates.
---

# Refresh dividend data

Re-check current dividend facts. Do not treat the copy in `data/catalog.json` as proof that a ticker still pays, or that its frequency or raise streak is still right.

## Where the data lives

Each instrument may have a `dividend` object:

```
{
  "pays": true | false | null,
  "frequency": "monthly" | "quarterly" | "semi-annual" | "annual" | "irregular" | null,
  "consecutiveYearsRaised": 70 | null,
  "status": "Dividend King" | "Dividend Aristocrat",
  "sources": ["https://…"],
  "checked": "YYYY-MM-DD"
}
```

- `pays` is whether the source shows a current dividend or distribution, not whether the company ever paid one in the past.
- `frequency` and `consecutiveYearsRaised` are null when the source does not state them. Do not compute a streak yourself from a partial history.
- `status` is optional and only for current payers. Set it only when a named list includes the ticker (for example Stock Analysis’s Dividend Aristocrats or Dividend Kings). Do not infer “Aristocrat” from a 25-year streak alone.
- Do not store yields, annual dollar amounts, or ex-dividend dates; they go stale quickly.
- `checked` is the date you verified the fields against a live page. Set `catalog.updated` to that date too.

Run `node tools/dividend-report.mjs` first. It needs no packages and no network. It lists missing objects, `pays: null`, stale or missing `checked` dates, missing sources, payers with unknown frequency, and payers with no streak (many funds have no streak, which is normal).

## Sources, by ticker type

Prefer a live page you actually fetch now. If a fetch fails or a fact is not stated, leave that field null. Never guess.

1. **Stock Analysis dividend page** (primary). Stocks: `https://stockanalysis.com/stocks/<symbol>/dividend/`. Funds and ETFs: `https://stockanalysis.com/etf/<symbol>/dividend/`. Read the current snapshot (payout frequency, “Growth Years” or equivalent, and whether a current annual payout or ex-dividend date is shown). A history table that only lists a payout from many years ago, while current yield, annual payout, frequency, and ex-dividend date are all n/a, means the ticker does not currently pay (`pays: false`).
2. **Stock Analysis quote page**, when the dividend page is missing (404). If the quote table’s Dividend and Ex-Dividend Date cells are explicitly n/a, set `pays: false` and use the quote URL as the source. If those cells are absent or unclear, leave `pays` null.
3. **Stock Analysis lists** for labels only: [Dividend Aristocrats](https://stockanalysis.com/list/dividend-aristocrats/) and [Dividend Kings](https://stockanalysis.com/list/dividend-kings/). If a ticker is on the Kings list, use `status: "Dividend King"` (and keep that list URL in `sources`). Else if it is on the Aristocrats list, use `status: "Dividend Aristocrat"`.
4. **Issuer or company pages**, and [Dividend.com](https://www.dividend.com/dividend-stock-screener/) or the [CCC List / Dividend Champions](https://www.ireitinvestor.com/dividend-champions/) spreadsheet, when Stock Analysis does not state frequency or a streak. The Champions list may require a download; only use figures you actually read. Record the exact page or file as a source. The CCC labels (Champion, Contender, Challenger) are not the same as Aristocrat; only store a `status` if you use the list’s own wording, or skip `status` and store the streak alone.

Skip paid lockers. A 403 or block is not a 404: do not treat a blocked page as “does not pay.”

## Rules

- Unknown = null. Do not invent a frequency or a streak, and do not copy last year’s numbers from memory.
- `pays: false` only when a source confirms there is no current dividend or distribution.
- Keep `frequency` in the lowercase set the catalog uses: `monthly`, `quarterly`, `semi-annual`, `annual`, `irregular`. If the source uses another word, leave frequency null and note it in your report.
- One or more `https://` source URLs, and a `checked` date of today (`YYYY-MM-DD`).
- Do not add tickers, rename instruments, or change `reviewed` unless you also re-checked the name, type, and issuer (that is the `audit-tickers` skill).
- After editing, bump `APP_VERSION` in `index.html` (the loader’s `version`; scripts and the service worker cache follow it). Run `node tools/check-catalog.mjs`, `node tools/test-app.mjs`, and `node tools/dividend-report.mjs`. Fix every check-catalog error before reporting back.
- Commit locally if the user asked you to save the work. Do not push and do not open a pull request unless they ask.

## Report, then stop

Lead with counts: how many pay, how many do not, how many stayed null, which sources you used, and any ticker you could not refresh. Then list field changes that matter (a new or stopped dividend, a frequency change, a streak change, a status change). Do not reprint the whole catalog.
