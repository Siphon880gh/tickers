# Market Forces · usefulness roadmap

Date: 2026-11-12

## Who this is for

Beginners who pick an economic theme (gold, rates, AI chips) and want to know which common tickers connect to it, what kind of exposure each one is, and where to start reading. The app stays a static, dependency-free page: no prices, no recommendations, no build step.

## What already works

Theme and group navigation, search across themes and tickers, a stock/fund filter, research links built per ticker by `researchLinks(item)`, index-weight mode with dated snapshots, notes kept in the browser with a "Has notes" filter, a research checklist, the "Add / edit with AI" helper, print, reduced motion, and a mobile layout.

## Gaps found while reading the code

- Nothing is in the URL. Refresh, Back, or sharing a link always lands on Gold / GLD.
- `relatedThemes()` exists in `js/app.js` but is never shown, so a reader on NVDA does not see that it sits in Technology, Semiconductors, Growth, and AI.
- Exposure labels (Bullion, Commodity futures, Currency trust, bond funds) are shown but never explained, except one futures warning.
- There is no way to put two or three tickers next to each other, which is the most common next step after "which of these should I read about?"
- Notes live only in one browser with no backup, and there is no way to keep a short list of tickers to come back to.
- The masthead says "October 2026 directory" by hand while `catalog.json` already has an `updated` date.
- Catalog checks (every theme symbol exists, no duplicates) are done by hand each time.

## Epics and milestones

Ordered by value for effort. Each milestone is one commit.

### Epic 1 · Keep the catalog trustworthy

- [x] **M1.1 Catalog check script.** `tools/check-catalog.mjs` runs with plain `node` (no packages).
  - Exits non-zero and names the problem when: JSON does not parse, a theme symbol is missing from `instruments`, a symbol is duplicated, a theme id is duplicated, a required field is missing, `kind` is not `stock`/`fund`, a fund has no `issuer`, `group`/`category` is outside the allowed list, or a link is not `https://`.
  - Warns (does not fail) on instruments no theme lists and index-weight symbols not in the catalog.
  - README gets a one-line "check the catalog" section; both local skills mention running it.
- [x] **M1.2 Directory date from data.** The masthead date comes from `catalog.updated` instead of hand-written text.
  - Acceptance: changing `updated` changes the masthead; a missing or bad date hides the date instead of showing "Invalid Date".

### Epic 2 · Find your way back (links that remember)

- [x] **M2.1 Deep links.** The URL hash holds the theme, the selected ticker, the search text, and the stock/fund filter (`#theme=gold&ticker=GLD`, `#q=copper&kind=fund`).
  - Acceptance: refresh keeps the view; Back/Forward move between themes and tickers; a link with an unknown theme or ticker falls back to the default view without an error; typing in search does not flood history (replaceState while typing).
- [x] **M2.2 Copy link and keyboard shortcuts.** "Copy link" in the research panel copies the deep link and confirms through the live region. `/` focuses search; `Esc` in search clears it.
  - Acceptance: works with keyboard only; falls back to selecting the URL text when the clipboard is blocked; `/` does nothing while typing in an input or textarea.

### Epic 3 · Understand what you are looking at

- [x] **M3.1 "Also appears in" themes.** The research panel lists every theme that includes the selected ticker as buttons that open that theme.
  - Acceptance: NVDA shows Technology, Semiconductors, Growth, and AI & chip demand; the current theme is marked; buttons are keyboard reachable.
- [x] **M3.2 Exposure explainer.** Each ticker shows a short plain-language "What you would own" note for its exposure type (a business, a stock fund, a bond fund, Treasury bills, bullion trust, futures fund, currency trust). The research checklist gets a matching glossary.
  - Acceptance: every one of the 87 instruments maps to exactly one type; no figures, prices, or yields are stated; the existing futures warning stays.

### Epic 4 · Compare a few tickers

- [x] **M4.1 Compare mode.** A "Compare" toggle (like Index weights) lets a reader check up to 3 tickers and see them side by side: type, exposure, issuer, what you would own, themes, and the main research links for each.
  - Acceptance: Compare and Index weights are mutually exclusive; a 4th pick is refused with a spoken message; picks survive switching themes; the compare view is in the URL (`compare=GLD,IAU`); print shows the comparison.

### Epic 5 · Keep your research

- [x] **M5.1 Watchlist.** "Save" on the research panel adds a ticker to a watchlist kept in this browser (new key `market-forces-watchlist`; `market-forces-notes` unchanged). A "Saved tickers" nav item lists them and rows show a Saved badge.
  - Acceptance: saving/removing updates nav count and badge immediately; survives refresh; an empty watchlist explains how to save.
- [x] **M5.2 Back up and restore.** Download notes and watchlist as one JSON file; restore merges a file back in without duplicating notes.
  - Acceptance: export → clear storage → import restores everything; importing the same file twice adds nothing; a bad file shows a plain error and changes nothing.
- [x] **M5.3 Search your notes.** Search text also matches the reader's own notes, and a match says it came from a note.
  - Acceptance: a word only in a note finds that ticker; the result row shows "Matches your note".

### Epic 6 · Follow-ups added while building

- [x] **M6.1 Index-weight picks in the URL.** Index weights mode and its checked tickers go in the hash (`weights=NVDA,AAPL`), like Compare.
  - Acceptance: a shared index-weights link opens in that mode with those picks; unknown symbols are dropped; leaving the mode removes the parameter.
- [x] **M6.2 Agent tools and docs for the new features.** The page's `document.modelContext` tools gain a read-only `compare_tickers` tool, and the README lists what the page can do (deep links, compare, saved tickers, backup, shortcuts).
  - Acceptance: the tool rejects unknown symbols and more than 3 symbols, and returns the same fields as the Compare table; README matches the page.

### Epic 7 · Why-it-matters simulations

- [x] **M7.1 Underlined phrases with stepped simulations, copied from Tool Training.** Dotted purple phrases ▶ open one shared popover (a bottom sheet on a phone) with a goal, a SAMPLE candlestick tape or table, Next / Previous / Replay and arrow keys, and "What this shows" plus "Why we are doing this" on every step. 19 simulations cover wrappers, futures rolls, producers vs commodities, margins, duration, yields, gold and real rates, currencies, inflation, earnings, Financials columns, fees, index concentration (from the dated snapshot), fund holdings, sentiment, defensive sectors, AI valuations, dividends, and position size. Phrases are structured refs in `js/simulations.js`; `sim=<id>` in the hash opens one.
  - Acceptance: `node tools/test-simulations.mjs` passes; every underline resolves; Escape, Close, or the backdrop closes and returns focus; closing removes `sim=`; existing deep links, search, notes, compare, and index weights still work.

## Not in scope

Live prices, live charts (the simulations use labeled SAMPLE tapes only), screening by numbers, or any buy/sell signal. New tickers or themes go through the `add-theme` skill with live sources, not this roadmap.
