// Market Forces pure helpers: no DOM, no storage, no network. js/app.js uses them in the browser
// (window.MFCore) and tools/test-app.mjs tests them in Node (module.exports).
(function (root) {
  'use strict';
  const COMPARE_MAX = 3;
  const STALE_DAYS = 90;

  // ---- Deep links: #theme=gold&ticker=GLD, #q=copper&kind=fund, &compare=A,B, &weights=A,B, &sim=id, &div=1&freq=monthly&streak=10 ----
  function symbolList(value, has) {
    return [...new Set(String(value || '').toUpperCase().split(',').map(symbol => symbol.trim()).filter(symbol => symbol && has(symbol)))];
  }
  // Returns null when the hash holds no state (for example #start-here); otherwise the state it names.
  // ctx: {hasTheme(id), hasSymbol(symbol), currentTheme}. indexPicks is null when weights is absent, so the caller keeps its picks.
  const DIV_FREQUENCIES = ['weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'irregular'];
  const DIV_STREAKS = [1, 5, 10, 25]; // 1 means any recorded raise streak
  function parseDiv(params) {
    const freqRaw = (params.get('freq') || '').toLowerCase();
    const frequency = DIV_FREQUENCIES.includes(freqRaw) ? freqRaw : null;
    const streakRaw = (params.get('streak') || '').toLowerCase();
    const streakNum = streakRaw === 'any' ? 1 : Number(streakRaw);
    const streak = DIV_STREAKS.includes(streakNum) ? streakNum : null;
    const pays = params.get('div') === '1' || frequency !== null || streak !== null;
    return {divPays: pays, divFrequency: pays ? frequency : null, divStreak: pays ? streak : null};
  }
  function parseHash(raw, ctx) {
    raw = String(raw || '').replace(/^#/, '');
    if (!raw.includes('=')) return null;
    const params = new URLSearchParams(raw);
    const theme = params.get('theme');
    const kind = params.get('kind');
    const query = (params.get('q') || '').trim().slice(0, 200);
    const ticker = (params.get('ticker') || '').trim().toUpperCase();
    const compare = params.get('compare');
    const weights = params.get('weights');
    const compareMode = compare !== null;
    const indexMode = weights !== null && !compareMode;
    const div = parseDiv(params);
    return {
      query,
      theme: theme === 'all' || theme === 'saved' || (theme && ctx.hasTheme(theme)) ? theme : (query ? ctx.currentTheme : 'gold'),
      kind: ['stock', 'fund'].includes(kind) ? kind : 'all',
      ticker: ctx.hasSymbol(ticker) ? ticker : null,
      compareMode,
      comparePicks: compareMode ? symbolList(compare, ctx.hasSymbol).slice(0, COMPARE_MAX) : null,
      indexMode,
      indexPicks: indexMode ? symbolList(weights, ctx.hasSymbol) : null,
      sim: params.get('sim'),
      divPays: div.divPays,
      divFrequency: div.divFrequency,
      divStreak: div.divStreak
    };
  }
  function buildHash(state, openSim) {
    const params = new URLSearchParams();
    if (state.query) params.set('q', state.query); else params.set('theme', state.theme);
    if (state.kind !== 'all') params.set('kind', state.kind);
    if (state.selected) params.set('ticker', state.selected);
    if (state.compareMode) params.set('compare', state.comparePicks.join(','));
    if (state.indexMode) params.set('weights', state.indexPicks.join(','));
    if (state.divPays) {
      params.set('div', '1');
      if (state.divFrequency) params.set('freq', state.divFrequency);
      if (state.divStreak) params.set('streak', String(state.divStreak));
    }
    if (openSim) params.set('sim', openSim);
    return '#' + params.toString().replace(/%2C/gi, ',');
  }
  // A ticker matches the Pays dividends filter (and optional frequency / raise-streak subfilters).
  function dividendMatches(item, filter) {
    if (!filter || !filter.divPays) return true;
    const d = item && item.dividend;
    if (!d || d.pays !== true) return false;
    if (filter.divFrequency && d.frequency !== filter.divFrequency) return false;
    if (filter.divStreak) {
      const years = d.consecutiveYearsRaised;
      if (typeof years !== 'number' || years < filter.divStreak) return false;
    }
    return true;
  }
  const FREQ_LABEL = {weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', 'semi-annual': 'Semi-annual', annual: 'Annual', irregular: 'Irregular'};
  // Short badge copy for a row or research panel. Null when there is no dividend record.
  function dividendBadge(dividend) {
    if (!dividend) return null;
    if (dividend.pays === true) {
      const parts = [];
      if (dividend.frequency && FREQ_LABEL[dividend.frequency]) parts.push(FREQ_LABEL[dividend.frequency]);
      if (dividend.status) parts.push(dividend.status);
      if (typeof dividend.consecutiveYearsRaised === 'number') parts.push('raised ' + dividend.consecutiveYearsRaised + ' yr' + (dividend.consecutiveYearsRaised === 1 ? '' : 's'));
      if (!parts.length) parts.push('Pays dividends');
      return {text: parts.join(' · '), pays: true, checked: dividend.checked || null, sources: Array.isArray(dividend.sources) ? dividend.sources : []};
    }
    if (dividend.pays === false) return {text: 'No dividend', pays: false, checked: dividend.checked || null, sources: Array.isArray(dividend.sources) ? dividend.sources : []};
    return null;
  }

  // ---- Search ----
  const words = query => String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
  const themeText = theme => (theme.name + ' ' + theme.tags).toLowerCase();
  function matchingThemes(themes, query) {
    const list = words(query);
    if (!list.length) return [];
    return themes.filter(theme => list.every(word => themeText(theme).includes(word)));
  }
  // Higher is better. 0 means no match. Exact symbol beats a phrase in a theme's everyday words,
  // which beats the same phrase inside a fund name (so "index fund" lists Building blocks before CPER).
  function scoreInstrument(item, query, ctx = {}) {
    const q = String(query || '').trim().toLowerCase();
    const list = words(q);
    if (!list.length) return 0;
    const symbol = item.symbol.toLowerCase();
    const name = item.name.toLowerCase();
    const text = (item.symbol + ' ' + item.name + ' ' + item.exposure + ' ' + item.description + ' ' + (item.issuer || '')).toLowerCase();
    const inThemes = (ctx.themes || []).filter(theme => theme.symbols.includes(item.symbol));
    let score = 0;
    if (symbol === q) score += 1000;
    else if (list.length === 1 && symbol.startsWith(q)) score += 200;
    // A whole phrase in a theme's everyday words: funds first, since a beginner typing "index fund" wants the fund.
    if (inThemes.some(theme => (' ' + themeText(theme) + ' ').includes(' ' + q + ' '))) score += item.kind === 'fund' ? 60 : 30;
    if (inThemes.some(theme => list.every(word => themeText(theme).includes(word)))) score += 20;
    if (name.includes(q)) score += 40;
    if (list.every(word => text.includes(word))) score += 10;
    if (ctx.noteMatches && ctx.noteMatches(item.symbol, q)) score += 5;
    return score;
  }
  // Same matches as before (a theme match, every word in the ticker's text, or a note), now ranked.
  function searchInstruments(instruments, themes, query, noteMatches) {
    const scored = instruments.map((item, i) => ({item, i, score: scoreInstrument(item, query, {themes, noteMatches})})).filter(entry => entry.score > 0);
    scored.sort((a, b) => b.score - a.score || a.i - b.i);
    return scored.map(entry => entry.item);
  }

  // ---- "Not covered here, and why" for searches this beginner directory leaves out on purpose ----
  const INVESTOR_GOV = 'https://www.investor.gov/introduction-investing';
  // Searches for option-income funds (covered calls, 0DTE) match a theme here, so they skip the "options trading" note.
  const OPTION_INCOME = /\b(covered\s+calls?|option\s+income|options\s+income|0dte)\b/;
  const NOT_COVERED = [
    {id: 'crypto', test: /\b(crypto\w*|bitcoin|btc|ethereum|ether|eth|solana|dogecoin|doge|stablecoins?|ibit|fbtc|gbtc|blockchain|nfts?)\b/,
      title: 'Crypto is not covered here',
      text: 'Bitcoin and other crypto funds follow a digital asset with no earnings, interest, or dividends, and prices can swing by large amounts in days. This beginner directory leaves them out on purpose.',
      links: [['Crypto assets · Investor.gov', 'https://www.investor.gov/additional-resources/spotlight/crypto-assets']]},
    {id: 'leveraged', skip: /\bultra\s+option\s+income\b/, test: /\b(leverag\w*|inverse|[23]x|ultra\w*|triple|bull\s+3x|bear\s+3x|tqqq|sqqq|soxl|soxs|upro|spxu|spxs|tna|tza|short\s+etf|short\s+fund)\b/,
      title: 'Leveraged and inverse funds are not covered here',
      text: 'These funds reset every day, so over weeks or months they can end up far from 2× or −1× the index, even losing money when the index rises. They are built for short-term trading, not for beginners.',
      links: [['Leveraged and inverse ETFs · Investor.gov', 'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/sec']]},
    {id: 'options', skip: OPTION_INCOME, test: /\b(options?|calls?|puts?|strike|expiration|leaps)\b/,
      title: 'Options trading is not covered here',
      text: 'An option is a contract that can expire worthless, and your broker has to approve you to trade them. Learn how the underlying stock or fund works first; this page covers those. Funds that sell options for income are listed under Option-income (weekly payers).',
      links: [['Options · Investor.gov', 'https://www.investor.gov/introduction-investing/investing-basics/glossary/options']],
      themes: ['option-income']},
    {id: 'single-bonds', test: /\b(individual\s+bonds?|single\s+bonds?|cusip|cds?|certificates?\s+of\s+deposit|savings\s+bonds?|i\s?bonds?|treasury\s?direct)\b/,
      title: 'Single bonds and CDs are not listed by ticker',
      text: 'Individual bonds trade by CUSIP number through a broker, CDs come from banks, and U.S. savings bonds come from TreasuryDirect, so none of them has a ticker here. For a fund of Treasury bills, see SGOV; for bond funds, see Building blocks and Corporate & muni bonds.',
      links: [['Bonds · Investor.gov', 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/bonds-or-fixed-income-products/bonds'], ['TreasuryDirect', 'https://www.treasurydirect.gov/']],
      themes: ['building-blocks', 'credit-bonds']},
    {id: 'accounts', test: /\b(401\s?k|401\(k\)|ira|roth|hsa|529|brokerage\s+account|money\s+market|savings\s+account|high\s+yield\s+savings)\b/,
      title: 'Accounts are not tickers',
      text: 'A 401(k), IRA, or brokerage account is where you hold investments, not an investment itself. Money market funds and savings accounts are offered by your bank or broker. Broad funds like those in Building blocks are what people often hold inside these accounts.',
      links: [['Investing basics · Investor.gov', INVESTOR_GOV]],
      themes: ['building-blocks']}
  ];
  function notCovered(query) {
    const q = ' ' + String(query || '').toLowerCase().trim() + ' ';
    if (q.trim().length < 2) return null;
    const hit = NOT_COVERED.find(entry => entry.test.test(q) && !(entry.skip && entry.skip.test(q)));
    return hit ? {id: hit.id, title: hit.title, text: hit.text, links: hit.links, themes: hit.themes || []} : null;
  }

  // In-page resource hints for searches that point at a guide section, not a missing ticker.
  const RESOURCE_HINTS = [
    {id: 'dividend-screeners',
      test: /\b(dividend\s+screeners?|monthly\s+dividends?|dividend\s+aristocrats?|dividend\s+champions?|ccc\s+list)\b/,
      title: 'Dividend screeners & databases',
      text: 'This directory is a starting set, not a complete list of dividend payers. Open Dividend screeners & databases for free sites that track how often companies pay and how consistently they have raised payouts.',
      href: '#dividend-screeners',
      linkLabel: 'Open Dividend screeners & databases'},
    {id: 'weekly-payers',
      test: /\b(weekly\s+(dividends?|pay\w*|income|distributions?)|pays?\s+weekly|option\s+income|options\s+income|covered\s+calls?|0dte)\b/,
      title: 'Weekly payers and option-income funds',
      text: 'A few ETFs pay every week, and most of them earn that income by selling options. This directory lists a small set under Option-income (weekly payers). For the full market, open Dividend screeners & databases, which includes a weekly dividend ETF list.',
      href: '#dividend-screeners',
      linkLabel: 'Open Dividend screeners & databases'}
  ];
  function resourceHint(query) {
    const q = ' ' + String(query || '').toLowerCase().trim() + ' ';
    if (q.trim().length < 2) return null;
    const hit = RESOURCE_HINTS.find(entry => entry.test.test(q));
    return hit ? {id: hit.id, title: hit.title, text: hit.text, href: hit.href, linkLabel: hit.linkLabel} : null;
  }

  // ---- Backup merge: {app:'market-forces', version:1, exportedAt, notes, watchlist}. Merges, never deletes. ----
  function mergeBackup(text, current, hasSymbol) {
    let data;
    try { data = typeof text === 'string' ? JSON.parse(text) : text; } catch { throw new Error('That file is not valid JSON. Nothing changed.'); }
    const validNotes = data && typeof data.notes === 'object' && data.notes !== null && !Array.isArray(data.notes);
    const validList = data && Array.isArray(data.watchlist);
    if (!data || data.app !== 'market-forces' || (!validNotes && !validList)) throw new Error('That file is not a Market Forces backup. Nothing changed.');
    let addedNotes = 0;
    let addedSaved = 0;
    const notes = {...current.notes};
    if (validNotes) {
      for (const [symbol, list] of Object.entries(data.notes)) {
        if (!/^[A-Z0-9.\-]{1,12}$/.test(symbol) || !Array.isArray(list)) continue;
        const merged = Array.isArray(notes[symbol]) ? [...notes[symbol]] : [];
        const seen = new Set(merged.map(note => note && note.id));
        const texts = new Set(merged.map(note => note && (note.text + '|' + note.at)));
        for (const note of list) {
          if (!note || typeof note.text !== 'string' || !note.text.trim() || typeof note.id !== 'string') continue;
          if (seen.has(note.id) || texts.has(note.text + '|' + note.at)) continue;
          merged.push({id: note.id, text: note.text.slice(0, 2000), at: typeof note.at === 'string' ? note.at : ''});
          seen.add(note.id);
          addedNotes++;
        }
        merged.sort((a, b) => String(b.at).localeCompare(String(a.at)));
        if (merged.length) notes[symbol] = merged;
      }
    }
    const watchlist = [...current.watchlist];
    if (validList) for (const symbol of data.watchlist) if (typeof symbol === 'string' && hasSymbol(symbol) && !watchlist.includes(symbol)) { watchlist.push(symbol); addedSaved++; }
    return {notes, watchlist, addedNotes, addedSaved};
  }

  // ---- Freshness ----
  function parseDay(iso) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
    if (!match) return null;
    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return date.getUTCMonth() === Number(match[2]) - 1 ? date : null;
  }
  function daysSince(iso, now = new Date()) {
    const date = parseDay(iso);
    if (!date) return null;
    const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.floor((today - date.getTime()) / 86400000);
  }
  const isStale = (iso, now, days = STALE_DAYS) => { const age = daysSince(iso, now); return age !== null && age > days; };
  // What the stale banner needs: the oldest reviewed date in a list of entries, and how many are past the limit.
  function freshness(entries, now = new Date(), days = STALE_DAYS) {
    const dates = entries.map(entry => entry && entry.reviewed).filter(iso => parseDay(iso));
    const oldest = dates.sort()[0] || null;
    return {oldest, staleCount: dates.filter(iso => isStale(iso, now, days)).length, missing: entries.length - dates.length};
  }

  // ---- Document title per view ----
  function pageTitle(view) {
    const app = 'Market Forces';
    const parts = [];
    if (view.sim) parts.push(view.sim);
    if (view.compare) parts.push(view.compare.length ? 'Compare ' + view.compare.join(', ') : 'Compare tickers');
    else if (view.weights) parts.push(view.weights.length ? 'Index weights: ' + view.weights.join(', ') : 'Index weights');
    else if (view.ticker) parts.push(view.ticker + (view.tickerName ? ' (' + view.tickerName + ')' : ''));
    if (view.query) parts.push('Search “' + view.query + '”');
    else if (view.themeName && !view.compare && !view.weights) parts.push(view.themeName);
    parts.push(app);
    return parts.join(' · ');
  }

  const api = {COMPARE_MAX, STALE_DAYS, DIV_FREQUENCIES, DIV_STREAKS, parseHash, buildHash, matchingThemes, scoreInstrument, searchInstruments, notCovered, NOT_COVERED, resourceHint, RESOURCE_HINTS, dividendMatches, dividendBadge, mergeBackup, parseDay, daysSince, isStale, freshness, pageTitle};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MFCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
