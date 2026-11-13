'use strict';
// Underlined phrases that open a why-it-matters simulation, and the one shared popover that plays them.
// Copied from Tool Training in the stocks trainer (Simulation.tsx and simWalk.ts), rewritten in plain JavaScript.
// The walk rules at the top are pure, so tools/test-simulations.mjs checks them without a browser.
(function (root) {
  const MIN_SIM_STEPS = 5;
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const stepCount = sim => sim.kind === 'bars' ? sim.bars.length : sim.steps.length;
  // `shown` is how many steps are revealed; the current step is shown - 1.
  const startWalk = sim => { const total = stepCount(sim); return {shown: clamp(sim.start, 1, Math.max(1, total)), total}; };
  const nextStep = s => s.shown < s.total ? {...s, shown: s.shown + 1} : s;
  const prevStep = s => s.shown > 1 ? {...s, shown: s.shown - 1} : s;
  const atStart = s => s.shown <= 1;
  const atEnd = s => s.shown >= s.total;
  const currentIndex = s => s.shown - 1;
  function stepCopy(sim, s) {
    const i = currentIndex(s);
    if (sim.kind === 'bars') { const b = sim.bars[i]; return {label: b.label, what: b.what, why: b.why}; }
    const st = sim.steps[i];
    return {label: sim.columns[st.col] || '', what: st.what, why: st.why};
  }
  const walkProgress = (sim, s) => (sim.kind === 'bars' ? 'Bar ' : 'Step ') + s.shown + ' of ' + s.total;
  function visibleColumns(sim, s) {
    const maxCol = Math.max(0, ...sim.steps.slice(0, s.shown).map(st => st.col));
    const cur = sim.steps[currentIndex(s)];
    return {visible: sim.columns.map((_, i) => i).filter(i => i === 0 || i <= maxCol), current: cur.col, row: cur.row};
  }
  function candleLayout(bars, width, height, pad = 8) {
    const hi = Math.max(...bars.map(b => b.high));
    const lo = Math.min(...bars.map(b => b.low));
    const span = hi - lo || 1;
    const y = p => pad + (1 - (p - lo) / span) * (height - pad * 2);
    const slot = width / Math.max(1, bars.length);
    const bodyW = Math.max(3, Math.min(22, slot * 0.6));
    const boxes = bars.map((b, i) => { const x = slot * i + slot / 2; return {x, bodyX: x - bodyW / 2, bodyW, yHigh: y(b.high), yLow: y(b.low), yOpen: y(b.open), yClose: y(b.close), up: b.close >= b.open}; });
    return {boxes, y, slot};
  }
  // Problems with a set of simulations; empty when everything is well-formed.
  function simulationProblems(sims) {
    const out = [];
    const ids = sims.map(s => s.id);
    if (new Set(ids).size !== ids.length) out.push('duplicate simulation id');
    for (const s of sims) {
      if (!/^[a-z0-9-]+$/.test(s.id)) out.push(s.id + ': id should be lowercase words and dashes');
      if (stepCount(s) < MIN_SIM_STEPS) out.push(s.id + ': fewer than ' + MIN_SIM_STEPS + ' steps');
      if (s.start < 1 || s.start >= stepCount(s)) out.push(s.id + ': start must leave at least one Next');
      if (!/SAMPLE|simulated/i.test(s.tape)) out.push(s.id + ': tape must say SAMPLE or simulated');
      if (!s.title || s.goal.length < 40 || s.takeaway.length < 20) out.push(s.id + ': title, goal, or takeaway too short');
      const steps = s.kind === 'bars' ? s.bars : s.steps;
      steps.forEach((st, i) => {
        if (!st.what || st.what.length < 15) out.push(s.id + '#' + i + ': what too short');
        if (!st.why || st.why.length < 30) out.push(s.id + '#' + i + ': why too short');
      });
      if (s.kind === 'bars') {
        s.bars.forEach((b, i) => { if (!(b.low <= Math.min(b.open, b.close) && b.high >= Math.max(b.open, b.close))) out.push(s.id + '#' + i + ': OHLC out of order'); });
      } else if (s.kind === 'columns') {
        for (const r of s.rows) if (r.length !== s.columns.length) out.push(s.id + ': row "' + r[0] + '" width');
        s.steps.forEach((st, i) => {
          if (st.col < 1 || st.col >= s.columns.length) out.push(s.id + '#' + i + ': col out of range');
          if (st.row !== undefined && (st.row < 0 || st.row >= s.rows.length)) out.push(s.id + '#' + i + ': row out of range');
        });
      } else out.push(s.id + ': unknown kind');
    }
    return out;
  }

  const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // One underlined control. Native <button>, so Enter and Space open it.
  const trigger = (sim, text) => '<button type="button" class="sim-trigger" data-sim="' + escapeHTML(sim) + '" aria-haspopup="dialog" aria-expanded="false" aria-describedby="sim-trigger-hint" title="Opens a short simulation">' + escapeHTML(text) + '</button>';
  // A grey-underlined word with a plain-language definition (a toggletip, not a walk).
  const termTrigger = (term, text) => '<button type="button" class="term-tip" data-term="' + escapeHTML(term) + '" aria-expanded="false" title="Show a plain-language definition">' + escapeHTML(text) + '</button>';
  // A ref id of 'term:<id>' is a definition; anything else is a simulation id.
  const refTrigger = (id, text) => String(id).startsWith('term:') ? termTrigger(String(id).slice(5), text) : trigger(id, text);
  // Lesson text: plain runs and {text, sim} or {text, term} triggers, as in Tool Training's ToolText.
  const toolText = parts => (Array.isArray(parts) ? parts : [parts]).map(p => typeof p === 'string' ? escapeHTML(p) : p.term ? termTrigger(p.term, p.text) : trigger(p.sim, p.text)).join('');
  // Plain copy plus [phrase, sim] refs: each phrase is found by exact match, in order. A missing phrase stays plain.
  function richText(plain, refs) {
    const text = String(plain);
    const found = (refs || []).map(([phrase, sim]) => ({phrase, sim, at: text.indexOf(phrase)})).filter(r => r.at >= 0).sort((a, b) => a.at - b.at);
    let html = '';
    let pos = 0;
    for (const r of found) {
      if (r.at < pos) continue;
      html += escapeHTML(text.slice(pos, r.at)) + refTrigger(r.sim, r.phrase);
      pos = r.at + r.phrase.length;
    }
    return html + escapeHTML(text.slice(pos));
  }

  const walk = {MIN_SIM_STEPS, stepCount, startWalk, replayWalk: startWalk, nextStep, prevStep, atStart, atEnd, currentIndex, stepCopy, walkProgress, visibleColumns, candleLayout};
  const api = {walk, simulationProblems, trigger, termTrigger, toolText, richText};
  if (typeof document === 'undefined') { if (typeof module !== 'undefined' && module.exports) module.exports = api; return; }

  // ---------- The popover (browser only) ----------
  const MARK_TAG = {high: 'High', low: 'Low', earnings: 'E', news: 'N', dividend: 'D', signal: 'S'};
  const MARK_NAME = {high: 'high of the window', low: 'low of the window', earnings: 'earnings report', news: 'headline', dividend: 'ex-dividend', signal: 'signal'};
  const fmt = n => Number(n).toFixed(2);
  const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';
  let sims = [];
  let layer = null;
  let current = null;
  let state = null;
  let returnTo = null;
  let prevOverflow = '';
  let terms = {};
  let backStack = [];
  let tip = null;
  let tipFrom = null;
  const byId = id => sims.find(s => s.id === id);

  function candleSVG(sim, s) {
    const W = 320, H = 150, LABEL = 14;
    const {boxes, y, slot} = candleLayout(sim.bars, W, H);
    const cur = currentIndex(s);
    const b = sim.bars[cur];
    let out = '<svg class="sim-chart" viewBox="0 0 ' + W + ' ' + (H + LABEL) + '" role="img" aria-label="' + escapeHTML('SAMPLE candlestick chart, ' + s.shown + ' of ' + s.total + ' bars shown. Current bar ' + b.label + ': open ' + b.open + ', high ' + b.high + ', low ' + b.low + ', close ' + b.close + (b.mark ? ', marked ' + MARK_NAME[b.mark] : '') + (b.readout ? ', ' + b.readout : '') + '.') + '">';
    out += '<rect x="' + slot * cur + '" y="0" width="' + slot + '" height="' + (H + LABEL) + '" class="sim-current" data-current-bar="' + cur + '"/>';
    sim.bars.forEach((bar, i) => {
      const g = boxes[i];
      if (i >= s.shown) { out += '<line x1="' + g.x + '" x2="' + g.x + '" y1="' + (H - 6) + '" y2="' + (H - 2) + '" class="sim-slot"/>'; return; }
      const cls = g.up ? 'sim-up' : 'sim-down';
      const top = Math.min(g.yOpen, g.yClose);
      const bodyH = Math.max(1, Math.abs(g.yClose - g.yOpen));
      out += '<g data-bar="' + i + '" class="' + cls + '" opacity="' + (i === cur ? 1 : 0.7) + '"><line x1="' + g.x + '" x2="' + g.x + '" y1="' + g.yHigh + '" y2="' + g.yLow + '" stroke-width="1.2"/><rect x="' + g.bodyX + '" y="' + top + '" width="' + g.bodyW + '" height="' + bodyH + '" stroke-width="' + (i === cur ? 1.5 : 0.5) + '"/><text x="' + g.x + '" y="' + (H + LABEL - 3) + '" text-anchor="middle" class="sim-axis">' + escapeHTML(bar.label) + '</text></g>';
    });
    sim.bars.slice(0, s.shown).forEach((bar, i) => {
      if (!bar.mark) return;
      const g = boxes[i];
      if (bar.mark === 'high' || bar.mark === 'low') {
        const py = y(bar.mark === 'high' ? bar.high : bar.low);
        out += '<g class="sim-mark-line"><line x1="0" x2="' + W + '" y1="' + py + '" y2="' + py + '" stroke-dasharray="4 3"/><text x="' + (g.x < W / 2 ? W - 4 : 4) + '" y="' + (bar.mark === 'high' ? py - 3 : py + 9) + '" text-anchor="' + (g.x < W / 2 ? 'end' : 'start') + '">' + MARK_TAG[bar.mark] + ' ' + fmt(bar.mark === 'high' ? bar.high : bar.low) + '</text></g>';
        return;
      }
      const cy = Math.max(8, g.yHigh - 9);
      out += '<g class="sim-mark"><circle cx="' + g.x + '" cy="' + cy + '" r="6"/><text x="' + g.x + '" y="' + (cy + 3) + '" text-anchor="middle">' + MARK_TAG[bar.mark] + '</text></g>';
    });
    if (b.readout) {
      const g = boxes[cur];
      const pw = Math.min(W - 4, b.readout.length * 4.6 + 10);
      const px = Math.min(W - pw - 2, Math.max(2, g.x - pw / 2));
      const above = g.yHigh - 30 > 0;
      const py = above ? g.yHigh - 30 : Math.min(H - 16, g.yLow + 6);
      out += '<g class="sim-readout" data-readout><line x1="' + g.x + '" x2="' + g.x + '" y1="' + (above ? py + 14 : py) + '" y2="' + (above ? g.yHigh - 2 : g.yLow + 2) + '"/><rect x="' + px + '" y="' + py + '" width="' + pw + '" height="14" rx="3"/><text x="' + (px + pw / 2) + '" y="' + (py + 10) + '" text-anchor="middle">' + escapeHTML(b.readout) + '</text></g>';
    }
    out += '</svg>';
    const howTo = sim.id !== 'bar-reading' && byId('bar-reading') ? ' ' + trigger('bar-reading', 'How to read a bar') : '';
    return '<figure class="sim-figure">' + out + '<figcaption>' + escapeHTML(sim.tape) + '. Green closed above its open, red below. Tags: E earnings, N headline, D ex-dividend. The pill beside a bar is a SAMPLE reading for that bar.' + howTo + '</figcaption></figure>';
  }
  function columnTable(sim, s) {
    const {visible, current: col, row} = visibleColumns(sim, s);
    const head = sim.columns.map((c, i) => '<th scope="col"' + (i === col ? ' class="sim-col-current" data-current-col="' + i + '"' : '') + (visible.includes(i) ? '' : ' aria-hidden="true"') + '>' + (visible.includes(i) ? escapeHTML(c) : '…') + '</th>').join('');
    const body = sim.rows.map((r, ri) => '<tr' + (ri === row ? ' class="sim-row-current"' : '') + '>' + r.map((cell, ci) => {
      const cls = [ci === col ? 'sim-col-current' : '', ci === col && ri === row ? 'sim-cell-current' : ''].filter(Boolean).join(' ');
      const tag = ci === 0 ? 'th scope="row"' : 'td';
      return '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>' + (visible.includes(ci) ? escapeHTML(cell) : '') + '</' + tag.split(' ')[0] + '>';
    }).join('') + '</tr>').join('');
    return '<figure class="sim-figure"><div class="sim-table-wrap"><table class="sim-table"><caption class="sr-only">' + escapeHTML(sim.tape + '. ' + walkProgress(sim, s) + ', current column ' + sim.columns[col] + (row !== undefined ? ', row ' + sim.rows[row][0] : '') + '.') + '</caption><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div><figcaption>' + escapeHTML(sim.tape) + '. Columns appear as the walk reaches them; the highlighted cell is the current step.</figcaption></figure>';
  }
  function update() {
    const sim = current;
    const s = state;
    const copy = stepCopy(sim, s);
    const unit = sim.kind === 'bars' ? 'bar' : 'step';
    const b = sim.kind === 'bars' ? sim.bars[currentIndex(s)] : null;
    layer.querySelector('[data-sim-visual]').innerHTML = sim.kind === 'bars' ? candleSVG(sim, s) : columnTable(sim, s);
    layer.querySelector('[data-sim-step]').innerHTML =
      '<p class="sim-progress"><strong>' + walkProgress(sim, s) + '</strong>' + (copy.label ? ' · ' + escapeHTML(copy.label) : '') + (b ? ' · O ' + fmt(b.open) + ' H ' + fmt(b.high) + ' L ' + fmt(b.low) + ' C ' + fmt(b.close) : '') + (b && b.readout ? ' · ' + escapeHTML(b.readout) : '') + '</p>' +
      '<div class="sim-what"><p class="sim-kicker">What this ' + unit + ' shows</p><p>' + escapeHTML(copy.what) + '</p></div>' +
      '<div class="sim-why"><p class="sim-kicker">Why we are doing this</p><p>' + escapeHTML(copy.why) + '</p></div>' +
      (atEnd(s) ? '<p class="sim-takeaway" data-sim-takeaway><strong>Takeaway: </strong>' + escapeHTML(sim.takeaway) + '</p>' : '');
    const prev = layer.querySelector('[data-sim-prev]');
    const next = layer.querySelector('[data-sim-next]');
    prev.disabled = atStart(s);
    next.disabled = atEnd(s);
    prev.textContent = '← Previous ' + unit;
    next.textContent = 'Next ' + unit + ' →';
    if (document.activeElement && document.activeElement.disabled) (next.disabled ? layer.querySelector('[data-sim-replay]') : next).focus();
  }
  function setTriggers(id, expanded) {
    for (const el of document.querySelectorAll('.sim-trigger[data-sim="' + id + '"]')) {
      el.setAttribute('aria-expanded', String(expanded));
      if (expanded) el.setAttribute('aria-controls', 'sim-dialog'); else el.removeAttribute('aria-controls');
    }
  }
  function ensureLayer() {
    if (layer) return layer;
    layer = document.createElement('div');
    layer.className = 'sim-layer';
    layer.hidden = true;
    layer.innerHTML = '<div class="sim-backdrop" data-sim-close aria-hidden="true"></div><div class="sim-panel" id="sim-dialog" role="dialog" aria-modal="true" aria-labelledby="sim-title" aria-describedby="sim-goal">' +
      '<div class="sim-head"><div><p class="sim-eyebrow"><span class="sim-level" data-sim-level></span> <span data-sim-tape></span></p><h2 id="sim-title"></h2></div><button type="button" class="sim-close" data-sim-close aria-label="Close simulation">Close ✕</button></div>' +
      '<div class="sim-body"><div class="sim-before" data-sim-before hidden></div><p class="sim-goal" id="sim-goal"><strong>Goal: </strong><span data-sim-goal></span></p><div data-sim-visual></div><div class="sim-step" data-sim-step aria-live="polite"></div>' +
      '<div class="sim-controls"><button type="button" class="sim-button" data-sim-prev>← Previous</button><button type="button" class="sim-button sim-primary" data-sim-next>Next →</button><button type="button" class="sim-button" data-sim-replay>↺ Replay</button></div>' +
      '<p class="sim-fine">SAMPLE figures, simulated, unless a step names a dated value from this page. Educational, not buy or sell advice. Keys: ← → step, Esc closes.</p></div></div>';
    document.body.appendChild(layer);
    layer.addEventListener('click', event => {
      if (event.target.closest('[data-sim-back]')) { const back = backStack.pop(); if (back) open(back, null, {fromBack: true}); return; }
      if (event.target.closest('[data-sim-close]')) { close(); return; }
      if (event.target.closest('[data-sim-next]')) { state = nextStep(state); update(); return; }
      if (event.target.closest('[data-sim-prev]')) { state = prevStep(state); update(); return; }
      if (event.target.closest('[data-sim-replay]')) { state = startWalk(current); update(); }
    });
    layer.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return; }
      if (event.key === 'ArrowRight') { event.preventDefault(); state = nextStep(state); update(); return; }
      if (event.key === 'ArrowLeft') { event.preventDefault(); state = prevStep(state); update(); return; }
      if (event.key === 'Tab') {
        const items = [...layer.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null || el === document.activeElement);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    return layer;
  }
  function open(id, from, opts = {}) {
    const sim = byId(id);
    if (!sim) return false;
    ensureLayer();
    // A walk link inside a definition returns focus to the word that opened the definition.
    if (from && tip && tip.contains(from)) from = tipFrom;
    hideTip(false);
    // Opening a walk from inside the popover (a prerequisite or caption link) keeps the original return target
    // and remembers where to go back to.
    const inside = Boolean(from && layer.contains(from));
    if (current) setTriggers(current.id, false);
    else { prevOverflow = document.body.style.overflow; backStack = []; }
    if (inside && current && current.id !== sim.id && !opts.fromBack) backStack.push(current.id);
    else if (!inside && !opts.fromBack) { backStack = []; returnTo = from || null; }
    current = sim;
    state = startWalk(sim);
    layer.querySelector('[data-sim-tape]').textContent = 'Simulation · ' + sim.tape;
    const level = layer.querySelector('[data-sim-level]');
    level.textContent = sim.levelName || '';
    level.className = 'sim-level' + (sim.level ? ' sim-level-' + sim.level : '');
    level.hidden = !sim.levelName;
    const before = layer.querySelector('[data-sim-before]');
    const back = backStack.length ? byId(backStack[backStack.length - 1]) : null;
    const pre = (sim.before || []).filter(byId).map(pid => '<span class="sim-pre">' + escapeHTML((api.prereqLabel && api.prereqLabel[pid]) || 'Read first:') + ' ' + trigger(pid, byId(pid).title) + '</span>');
    before.innerHTML = (back ? '<button type="button" class="sim-back" data-sim-back>← Back to ' + escapeHTML(back.title) + '</button>' : '') + pre.join('');
    before.hidden = !back && !pre.length;
    layer.querySelector('#sim-title').textContent = sim.title;
    layer.querySelector('[data-sim-goal]').textContent = sim.goal;
    layer.querySelector('.sim-panel').dataset.sim = sim.id;
    update();
    layer.hidden = false;
    document.body.style.overflow = 'hidden';
    setTriggers(sim.id, true);
    layer.querySelector('.sim-panel').scrollTop = 0;
    layer.querySelector('[data-sim-next]').focus();
    if (api.onChange) api.onChange(sim.id);
    return true;
  }
  function close() {
    if (!current) return;
    const id = current.id;
    setTriggers(id, false);
    current = null;
    state = null;
    layer.hidden = true;
    document.body.style.overflow = prevOverflow;
    backStack = [];
    const target = returnTo && returnTo.isConnected ? returnTo : document.querySelector('.sim-trigger[data-sim="' + id + '"]');
    returnTo = null;
    if (target) target.focus({preventScroll: false});
    if (api.onChange) api.onChange(null);
  }
  // ---------- Term toggletips: a grey-underlined word shows a short definition beside it ----------
  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement('div');
    tip.className = 'term-pop';
    tip.id = 'term-pop';
    tip.hidden = true;
    tip.innerHTML = '<div role="status" aria-live="polite" data-term-body></div>';
    document.body.appendChild(tip);
    return tip;
  }
  function placeTip(from) {
    const r = from.getBoundingClientRect();
    const width = Math.min(288, document.documentElement.clientWidth - 16);
    tip.style.width = width + 'px';
    const left = Math.min(Math.max(8, r.left + window.scrollX), window.scrollX + document.documentElement.clientWidth - width - 8);
    tip.style.left = left + 'px';
    tip.style.top = (r.bottom + window.scrollY + 6) + 'px';
  }
  function showTip(id, from) {
    const t = terms[id];
    if (!t) return false;
    ensureTip();
    if (tipFrom && tipFrom !== from) tipFrom.setAttribute('aria-expanded', 'false');
    tipFrom = from;
    from.setAttribute('aria-expanded', 'true');
    from.setAttribute('aria-controls', 'term-pop');
    tip.hidden = false;
    tip.dataset.term = id;
    tip.querySelector('[data-term-body]').innerHTML = '<p><strong>' + escapeHTML(t.term) + ':</strong> ' + escapeHTML(t.def) + '</p>' + (t.sim && byId(t.sim) ? '<p class="term-walk">Walk: ' + trigger(t.sim, byId(t.sim).title) + '</p>' : '') + '<button type="button" class="term-close" data-term-close aria-label="Close definition">Close ✕</button>';
    placeTip(from);
    return true;
  }
  function hideTip(refocus) {
    if (!tip || tip.hidden) return;
    tip.hidden = true;
    const from = tipFrom;
    tipFrom = null;
    if (from) { from.setAttribute('aria-expanded', 'false'); from.removeAttribute('aria-controls'); if (refocus && from.isConnected) from.focus(); }
  }
  document.addEventListener('click', event => {
    const el = event.target.closest('.term-tip[data-term]');
    if (el) { event.preventDefault(); if (tipFrom === el && !tip.hidden) hideTip(false); else showTip(el.dataset.term, el); return; }
    if (event.target.closest('[data-term-close]')) { hideTip(true); return; }
    if (tip && !tip.hidden && !event.target.closest('.term-pop')) hideTip(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && tip && !tip.hidden && !current) { event.preventDefault(); hideTip(true); }
  });
  window.addEventListener('resize', () => hideTip(false));

  const LEVEL_ORDER = {basic: 0, next: 1, advanced: 2};
  const levelTag = s => s.levelName ? '<span class="sim-level sim-level-' + escapeHTML(s.level) + '">' + escapeHTML(s.levelName) + '</span> ' : '';
  const listItem = s => '<li data-sim-item="' + escapeHTML(s.id) + '">' + levelTag(s) + trigger(s.id, s.title) + ' <span class="sim-count">· ' + stepCount(s) + (s.kind === 'bars' ? ' bars' : ' steps') + '</span><span class="sim-list-goal">' + escapeHTML(s.goal) + '</span></li>';
  // The supplement list in the research guide, like Tool Training's "Simulations: why each check matters". Basic first.
  function renderList(box) {
    if (!box) return;
    box.innerHTML = sims.map((s, i) => ({s, i})).sort((a, b) => (LEVEL_ORDER[a.s.level] ?? 3) - (LEVEL_ORDER[b.s.level] ?? 3) || a.i - b.i).map(({s}) => listItem(s)).join('');
  }
  // The pinned "Start here" walks, in reading order.
  function renderStartHere(box, ids) {
    if (!box) return;
    box.innerHTML = (ids || []).map(byId).filter(Boolean).map(listItem).join('');
  }
  document.addEventListener('click', event => {
    const el = event.target.closest('.sim-trigger[data-sim]');
    if (!el) return;
    event.preventDefault();
    open(el.dataset.sim, el);
  });
  Object.assign(api, {
    init(list, termMap) { sims = Array.isArray(list) ? list : []; terms = termMap || {}; },
    open, close, renderList, renderStartHere, showTip, hideTip,
    tipOpen: () => Boolean(tip && !tip.hidden),
    prereqLabel: null,
    has: id => Boolean(byId(id)),
    current: () => current ? current.id : null,
    isOpen: () => Boolean(current),
    state: () => state ? {...state} : null,
    onChange: null
  });
  root.MFSimPopover = api;
})(typeof window !== 'undefined' ? window : globalThis);
