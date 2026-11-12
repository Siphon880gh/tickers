# Market Forces

By Weng (Weng Fei Fung)

![Last Commit](https://img.shields.io/github/last-commit/Siphon880gh/tickers/main)
<a target="_blank" href="https://github.com/Siphon880gh" rel="nofollow"><img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" alt="Github" data-canonical-src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" style="max-width:8.5ch;"></a>
<a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow"><img src="https://img.shields.io/badge/LinkedIn-blue?style=flat&logo=linkedin&labelColor=blue" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue" style="max-width:10ch;"></a>
<a target="_blank" href="https://www.youtube.com/@WengTeachesCode/" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-red?style=flat&logo=youtube&labelColor=red" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red" style="max-width:10ch;"></a>

Beginner’s directory of common stocks and funds, grouped by economic theme, with research links for each ticker.

![Gold theme with research links for the GLD fund](screenshots/directory.png)

![Research links for the Newmont stock, including financials and filings](screenshots/stock-research.png)

<img src="screenshots/phone.png" alt="Market Forces on a phone" width="320">

## What you can do

- **Browse by theme.** Assets, industries, markets, and economic forces, each with the economic connection and one or two primary sources.
- **Open a ticker's research.** Overview, financials or fund documents, news, and discussion links, plus a plain note on what you would own (one company, a stock fund, a bond fund, Treasury bills, a bullion trust, a futures fund, or a currency trust) and every theme the ticker appears in.
- **Compare up to 3 tickers.** Turn on Compare and check tickers to see type, exposure, issuer, themes, and main links side by side. It compares structure, not performance.
- **See index weights.** Index weights shows where a ticker sits in dated index snapshots.
- **Save tickers and keep notes.** Both stay in this browser. Search also finds words in your notes. Back up and restore them from the research guide.
- **Share or bookmark a view.** The address keeps the theme, ticker, search, filter, and Compare or Index weights picks, for example `#theme=gold&ticker=GLD` or `#theme=gold&compare=GLD,IAU,NEM`. Copy link on the research panel copies it.
- **Keyboard.** Press `/` to search and `Esc` to clear it.

No live prices. These are research starting points, not buy or sell recommendations.

## Check the catalog

After editing `data/catalog.json` or `data/index-weights.json`, run `node tools/check-catalog.mjs`. It needs no packages. It fails on a theme symbol missing from `instruments`, a duplicate symbol or theme id, a missing field, an unknown group or category, or a link that is not `https://`, and warns about tickers no theme lists.
