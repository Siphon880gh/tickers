---
name: add-theme
description: >-
  Asks which resource, marketing force, or industry to add, then chooses
  current U.S.-listed tickers and the research links for that theme. Use when
  the user wants to add a resource, market force, marketing force, industry,
  asset, economic theme, or sector to the ticker directory.
---

# Add a theme

Ask before researching. If the user has not named a topic, ask which resource, marketing force, or industry they want to add. Do not pick one for them.

If they already named it, restate that topic in one line and continue.

## Where the catalog lives

The catalog is `data/catalog.json`. `index.html` is the page. `js/app.js` builds links and renders the directory. There is no server.

- A stock object has `symbol`, `name`, `kind` (`stock`), `exposure`, `description`, and optional `official`
- A fund object has the same fields, `kind` (`fund`), and `issuer`
- Each theme is `{id, name, mark, group, symbols, tags, description, connection, links}`
- `group` is `Assets`, `Industries`, `Markets`, or `Economic forces`
- Market themes also set `category` to `Size`, `Region`, `Style`, or `Asset class`
- `links` is `[[title, url], ...]` for the theme's macro sources, not per-ticker links
- `researchLinks(item)` in `js/app.js` builds every ticker's research links from `kind`, `exposure`, `issuer`, and `official`

A ticker's research links are not a hand-written list. Set the fields `researchLinks` already reads. Put `futures` in `exposure` when the fund holds commodity or currency futures. Use `Bullion` or `Currency trust` when holdings must come from the issuer page instead of Stock Analysis.

## Choose the tickers

1. Read `instruments` and `themes` first. Reuse a symbol that is already in the catalog. Do not add a second copy.
2. Look up current U.S.-listed stocks and funds for this topic. Confirm the symbol, legal name, stock-versus-fund type, and issuer or investor-relations URL from a current source. Do not rely on memory for symbols.
3. Keep the set small and ordinary: the usual fund or trust, plus the businesses a beginner would actually compare. Skip leveraged, inverse, and single-stock products.
4. Say what exposure each ticker is. A miner, a stock ETF, a bullion trust, and a futures fund are different.
5. Write theme copy in the same voice as the existing themes: what to research, and the economic connection. These are starting points, not buy or sell recommendations.
6. Add one or two primary macro links (an official statistics series or the issuer), the same way existing themes do.

## Show the proposal, then edit

Show the theme fields and each new or reused ticker. For each ticker, list the research-link groups `researchLinks` will produce (overview, financials or fund documents, news, sentiment).

Edit `data/catalog.json` only after the user accepts the proposal. Add new instruments beside related entries, and include every new symbol in the theme's `symbols` array. A theme symbol must exist in `instruments`.

Change `researchLinks` in `js/app.js` only when a new exposure type needs a different holdings or filings rule. Say why.
