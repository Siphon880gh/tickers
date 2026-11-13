# Accessibility pass · 2026-11-13

Checked on index.html and about.html with headless Chrome at 1400 px and 390 px, using a contrast script (WCAG 2.x relative luminance) against the page's CSS and a DOM check for headings, names, ids, and ARIA references.

## Contrast

| Element | Text / background | Ratio | Result |
|---|---|---|---|
| Muted body text (`--muted` #56697a) | on #fff / on page #f2f5f8 | 5.68 / 5.19 | Pass AA |
| Grey term underline (non-text indicator) | #8a9aa8 on #fff, before | 2.89 | Below 3:1 |
| Grey term underline, after | #6b7c8c on #fff | 4.30 | Pass (3:1 non-text) |
| Purple simulation phrases (`--sim` #6d28d9) | on #fff | 7.10 | Pass AAA |
| Level tag Basic, after | #0f6a4f on #ecf8f3 (was #13795b, 4.93) | 6.04 | Pass AA; size 10 → 11 px |
| Level tag Next step | #1d4f65 on #eaf3f8 | 7.92 | Pass |
| Level tag Advanced | #8a3b12 on #fdf1e8 | 6.97 | Pass |
| Badges: Fund / Stock / Saved / Futures, Notes, Estimate | #455e73 on #eef2f6 · #355586 on #ebf0fb · #0d5a60 on #e8f5f4 · #835500 on #fff1d8 | 6.02 · 6.58 · 7.10 · 5.77 | Pass AA |
| Notes count badge | #fff on #9a6a11 | 4.73 | Pass AA |
| Search placeholder | #617384 on #fff | 4.89 | Pass AA |
| New: stale banner, storage warning, not-covered note, backup nudge | #5c4200 on #fff6e0 · #7a1f14 on #fdecea · #2f2550 on #f6f1ff · #4d3700 on #fff6e0 | 8.73 · 9.03 · 12.62 · 10.48 | Pass AAA |
| New: reviewed date, stale variant | #56697a on #fafcfe · #6b4a00 on #fff6e0 | 5.52 · 7.49 | Pass AA |
| Masthead and featured links on navy #102438 | #c4d6e2, #e3eef3, #fff | 10.6–15.8 | Pass |

The simulation table's current-column tint is purple at 15% on white (#e9dff9); purple text on it is 5.54, pass.

## Headings and structure

- One `h1` per page. Order on the main page: h1, then h2 (welcome card when shown, theme or search topic), h3 (results, guide sections), and h2 for the research panel (its own `aside` landmark) with h3 groups. No skipped levels on the theme, compare, or index-weights views, or on about.html.
- No unnamed buttons, links, or fields; no duplicate ids; every `aria-describedby`, `aria-labelledby`, and `aria-controls` points at an element that exists.

## Less screen-reader noise

- Simulation phrases had both `aria-describedby` ("Opens a short simulation") and a `title` with the same words, so some screen readers read it twice. The `title` is gone from all 21 static and every generated phrase.
- Grey definition words had a `title`; they now use one hidden hint, "Shows a short definition", through `aria-describedby`.
- The decorative ▶ after each phrase uses `content: "▶" / ""`, so it is not read aloud where alternative text for generated content is supported.
- New banners use `role="status"` (stale) or `role="alert"` (storage blocked, failed load) only when shown; the not-covered note and backup nudge are `role="note"`, so they are not announced on every keystroke.

## Not changed

- Theme strip on phones scrolls sideways, as before; every theme is still a button in reading order.
- Smooth scrolling to the research panel respects `prefers-reduced-motion`.
