# Market Forces

By Weng (Weng Fei Fung)

![Last Commit](https://img.shields.io/github/last-commit/Siphon880gh/tickers/main)
<a target="_blank" href="https://github.com/Siphon880gh" rel="nofollow"><img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" alt="Github" data-canonical-src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" style="max-width:8.5ch;"></a>
<a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow"><img src="https://img.shields.io/badge/LinkedIn-blue?style=flat&logo=linkedin&labelColor=blue" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue" style="max-width:10ch;"></a>
<a target="_blank" href="https://www.youtube.com/@WengTeachesCode/" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-red?style=flat&logo=youtube&labelColor=red" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red" style="max-width:10ch;"></a>

Beginner’s directory of common stocks and funds, grouped by economic theme, with research links for each ticker.

![First visit: the welcome card and the Building blocks theme with VTI's research panel](screenshots/directory.png)

![Research links for the Newmont stock, with the date its entry was last checked](screenshots/stock-research.png)

<img src="screenshots/phone.png" alt="Market Forces on a phone, showing the Corporate & muni bonds theme" width="320">

## What you can do

- **Browse by theme.** Assets, industries, markets, and economic forces, each with the economic connection and one or two primary sources.
- **Open a ticker's research.** Overview, financials or fund documents, news, and discussion links, plus a plain note on what you would own (one company, a stock fund, a bond fund, Treasury bills, a bullion trust, a futures fund, or a currency trust) and every theme the ticker appears in.
- **Compare up to 3 tickers.** Turn on Compare and check tickers to see type, exposure, issuer, themes, and main links side by side. It compares structure, not performance.
- **See index weights.** Index weights shows where a ticker sits in dated index snapshots.
- **Save tickers and keep notes.** Both stay in this browser. Search also finds words in your notes. Back up and restore them from the research guide.
- **Share or bookmark a view.** The address keeps the theme, ticker, search, filter, and Compare or Index weights picks, for example `#theme=gold&ticker=GLD` or `#theme=gold&compare=GLD,IAU,NEM`. Copy link on the research panel copies it.
- **Keyboard.** Press `/` to search and `Esc` to clear it.
- **Step through why it matters.** Dotted purple phrases ▶ in theme text, the research panel, Compare, Index weights, and the research guide open a short simulation, copied from Tool Training in the stocks trainer: a SAMPLE chart or table you step through with Next, Previous, Replay, or the arrow keys. Each step says what it shows and why we are looking. `#…&sim=duration` opens one directly. The research guide lists all 42, Basic first, and every theme underlines at least one. Each walk is tagged Basic, Next step, or Advanced, and a walk that builds on another shows “New to …? ▶” at the top.
- **Start here for beginners.** “New to researching a ticker? Start here” opens a three-step how-to and seven Basic walks in reading order: what a stock is, how to read a bar, what an index and market cap are, the bond seesaw, compounding, diversification, and defining your downside.
- **Plain-language words.** Grey underlined words (ETF, Treasury, maturity, futures, spot, market cap, issuer, prospectus, and about 20 more) show a one-line definition; Esc or a click elsewhere closes it. Every research link has a short line saying what it opens.
- **Welcome and About.** A first visit shows a short welcome card (Got it hides it for good) and opens the research guide once. [About, FAQ, and disclaimer](about.html) covers where the data comes from, how current it is, and where notes are kept.
- **Building blocks and bond funds.** Broad funds (VTI, VXUS, BND, BNDX, SGOV, and the all-in-one AOR) and Corporate & muni bonds (LQD, HYG, MUB). Search understands everyday words such as *index fund*, *retirement*, *junk bonds*, or *tax free*.
- **Not covered, and why.** Searching for crypto, leveraged or inverse funds, options, single bonds or CDs, or an account type explains why this beginner directory leaves it out, with an Investor.gov link.
- **How current it is.** Each research panel shows when that entry was last checked. A banner appears when entries or the index-weights snapshot are more than 90 days old (`?asof=2027-03-01` previews a later date). Index weights say "Not in this snapshot" rather than showing zero.
- **Works offline and installs.** After one visit the page, directory, and walks load offline; browsers can install it from the manifest. The service worker is network first, so new versions and localhost edits show at once. `?nosw` removes it.
- **Keeps your notes safe.** After 3 new notes since your last backup, the notes panel suggests one. A private window or blocked storage shows a warning.
- **Phone.** Tapping a ticker scrolls to its research; *Back to the ticker list* returns. The *Add / edit with AI* helper for maintainers sits in the footer.

No live prices. These are research starting points, not buy or sell recommendations. Educational, not buy or sell advice.

## Check the catalog

After editing `data/catalog.json` or `data/index-weights.json`, run `node tools/check-catalog.mjs`. It needs no packages. It fails on a theme symbol missing from `instruments`, a duplicate symbol or theme id, a missing field, an unknown group or category, or a link that is not `https://`, and warns about tickers no theme lists.

It also checks every `reviewed` date and warns when an entry or index snapshot is more than 90 days old, or when an index snapshot has no directory ticker.

After changing `js/core.js` (deep links, search ranking, not-covered notes, backup merge, freshness, titles), run `node tools/test-app.mjs`.

When you change anything under `js/` or `data/`, bump `APP_VERSION` in `index.html` (the loader's `version`). Scripts, data, and the service worker cache all follow it. Accessibility checks and results are in [docs/accessibility.md](docs/accessibility.md).

After editing simulations (`js/simulations.js`) or any theme text they underline, run `node tools/test-simulations.mjs`. It checks the step rules (Next, Previous, Replay, bounds), that every simulation has 5 or more steps with what-and-why copy and a SAMPLE label, that every underlined phrase still exists in the catalog or page and points at a real simulation, that every theme has an underline, that every walk has a level and valid prerequisites, that every defined term and research-link note is on the page, that the SAMPLE tables add up, and that the index-weights walk matches `data/index-weights.json`.
