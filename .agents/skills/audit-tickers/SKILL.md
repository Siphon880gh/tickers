---
name: audit-tickers
description: >-
  Checks every ticker in the directory against current listings, names, and
  fund structures, and flags missing common tickers. Use when the user asks
  to double-check, audit, verify, or update tickers, symbols, fund names, or
  whether the catalog is still accurate.
---

# Audit the ticker catalog

Check the catalog as it is today. Do not treat the copy in `index.html` as proof that a symbol, name, or fund structure is still right.

## Read the catalog

`index.html` holds `instruments` and `themes`. Every theme `symbols` entry must match an instrument `symbol`. Note orphans both ways: a symbol in a theme that is not in `instruments`, and an instrument that no theme lists.

`researchLinks(item)` builds research links from `kind`, `exposure`, `issuer`, and `official`. An audit of those links means checking those fields, not a stored URL list.

## Check each ticker

For every instrument, confirm with a current source (issuer page, exchange listing, or fund page):

- The symbol still identifies this security on a U.S. exchange. Watch for renames, such as a company that changed its ticker.
- The name matches the current company or fund name.
- `kind` is still right: operating company versus fund, trust, or commodity pool.
- `exposure` still describes what it holds. A futures fund must include `futures` in `exposure`. A bullion trust stays `Bullion`. A currency trust stays `Currency trust`.
- `issuer` is the current sponsor, for funds.
- `official`, when set, still opens the issuer or investor-relations page. A dead or unrelated URL should be replaced or cleared.

Also read each theme's `description`, `connection`, and macro `links`. Fix a link that no longer points at the stated source.

## Missing tickers

For each existing theme, name common U.S.-listed stocks or funds a beginner would expect that are absent. Prefer liquid, plain exposure. Do not add leveraged or inverse products. Do not invent a new theme in this pass.

A missing ticker is a proposal, not an automatic edit.

## Report, then edit

Lead with the findings:

- **Update** — what is wrong, the current fact, and the source
- **Remove** — symbol is no longer that security, or the instrument is broken
- **Add** — symbol, name, kind, exposure, and which existing theme it belongs on
- **Keep** — only mention a ticker here if you checked it and it is accurate; do not list the whole catalog as a keep list

Do not edit `index.html` until the user says which findings to apply. When applying, update `instruments` and every theme `symbols` list together so the two stay in sync.
