/* "Add / edit with AI" helper for harness-first apps. Drop-in, no dependencies, no build step.
 * This app has no built-in AI (that keeps it free). The panel has two accordion tiles (one open at a time):
 *   1. How it works: find this app's folder with system search, open it in Cursor, Claude Code or another AI harness,
 *      and work on the data with your own tokens.
 *   2. Your folder path: the browser remembers the folder path you type, and shows it as a path or a cd command.
 * Saved in localStorage under harnessAi:<data-app-id>:path | :mode | :openTile, so apps on one origin never collide.
 * Configure on the <script> tag:
 *   data-app-id      unique id for storage keys, e.g. app/adhd/heavy-docs (path from the weng root)
 *   data-folder      folder name to search for (required)        data-app      app name shown in the panel
 *   data-ask         step 3 text; `backticks` render as code     data-title / data-label   panel title / button label
 *   data-mount       CSS selector: put the button in that toolbar instead of floating (data-mount-where=append|prepend)
 *   data-btn-class   classes for a mounted button (reuse the toolbar's own button class)
 *   data-position    br (default) or bl for the floating button   data-offset-bottom   extra CSS length above the bottom edge
 *   data-theme       light (default) or dark                      data-accent   button colour
 *   data-parent      optional parent folder name, shown as a hint when the folder name is generic
 *   data-avoid       CSS selector(s) of fixed bottom bars; the floating button sits above whichever is showing */
(function () {
  'use strict';
  var script = document.currentScript;
  if (!script) return;
  var cfg = script.dataset || {};
  var folder = cfg.folder || '';
  if (!folder) return;
  var appId = cfg.appId || ((cfg.parent ? cfg.parent + '/' : '') + folder);
  var dark = cfg.theme === 'dark';
  var accent = cfg.accent || (dark ? '#e8eaed' : '#1f2937');
  var accentInk = cfg.accentInk || (dark ? '#1a1d21' : '#ffffff');

  /* ---- storage (namespaced per app; survives blocked storage) ---- */
  var NS = 'harnessAi:' + appId + ':';
  function load(k) { try { return window.localStorage.getItem(NS + k); } catch (e) { return null; } }
  function save(k, v) { try { if (v === null || v === '') window.localStorage.removeItem(NS + k); else window.localStorage.setItem(NS + k, v); } catch (e) { /* storage unavailable */ } }

  /* ---- path helpers ---- */
  function cleanPath(v) {
    v = String(v || '').trim();
    if (v.length > 1 && ((v[0] === '"' && v[v.length - 1] === '"') || (v[0] === "'" && v[v.length - 1] === "'"))) v = v.slice(1, -1).trim();
    return v;
  }
  function cdCommand(p) {
    if (!p) return '';
    if (/^[A-Za-z]:[\\/]/.test(p) || /^\\\\/.test(p)) return 'cd /d "' + p + '"';      // Windows cmd
    if (p === '~') return 'cd ~';
    var home = '';
    if (p.indexOf('~/') === 0) { home = '~/'; p = p.slice(2); }
    if (p.indexOf('!') !== -1) return 'cd ' + home + "'" + p.replace(/'/g, "'\\''") + "'"; // avoid shell history expansion
    return 'cd ' + home + '"' + p.replace(/(["\\$`])/g, '\\$1') + '"';
  }

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var ICON_COPY = '<svg class="hai-ico hai-ico--copy" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><svg class="hai-ico hai-ico--ok" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5"/></svg>';
  var ICON_CLEAR = '<svg class="hai-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9.5"/><path d="m15 9-6 6M9 9l6 6"/></svg>';
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); }

  var css = [
    '.hai{--hai-bg:' + (dark ? '#22262c' : '#ffffff') + ';--hai-ink:' + (dark ? '#e8eaed' : '#111827') + ';--hai-muted:' + (dark ? '#9aa3ad' : '#4b5563') + ';--hai-line:' + (dark ? '#3a414b' : '#d1d5db') + ';--hai-soft:' + (dark ? '#2a2f36' : '#f3f4f6') + ';--hai-accent:' + accent + ';--hai-accent-ink:' + accentInk + ';font-family:inherit;}',
    '.hai-float{position:fixed;z-index:2147483000;display:flex;flex-direction:column;gap:8px;pointer-events:none;}',
    '.hai-float>*{pointer-events:auto;}',
    '.hai-fab{display:inline-flex;align-items:center;gap:.45rem;min-height:44px;padding:.55rem 1rem;border:0;border-radius:999px;background:var(--hai-accent);color:var(--hai-accent-ink);font:inherit;font-size:.875rem;font-weight:600;line-height:1.1;box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer;}',
    '.hai-fab:hover{filter:brightness(1.1);}',
    '.hai-btn-short{display:none;}',
    '.hai :focus-visible,.hai-mounted:focus-visible{outline:3px solid #2563eb;outline-offset:2px;}',
    '.hai-panel{box-sizing:border-box;width:min(380px,calc(100vw - 24px));max-height:min(75vh,600px);overflow:auto;padding:14px 16px;border:1px solid var(--hai-line);border-radius:10px;background:var(--hai-bg);color:var(--hai-ink);font-size:14px;line-height:1.5;text-align:left;box-shadow:0 12px 32px rgba(0,0,0,.28);}',
    '.hai-panel[hidden],.hai-acc__body[hidden],.hai-hint[hidden]{display:none!important;}',
    '.hai-panel--fixed{position:fixed;z-index:2147483001;}',
    '.hai-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;}',
    '.hai-title{margin:0 0 6px;font-size:16px;font-weight:700;line-height:1.3;color:var(--hai-ink);}',
    '.hai-close{flex:none;min-width:32px;min-height:32px;border:0;border-radius:6px;background:transparent;color:var(--hai-muted);font:inherit;font-size:20px;line-height:1;cursor:pointer;}',
    '.hai-close:hover{background:var(--hai-soft);color:var(--hai-ink);}',
    '.hai-acc{border:1px solid var(--hai-line);border-radius:8px;overflow:hidden;}',
    '.hai-acc__h{margin:0;font-size:inherit;}',
    '.hai-acc__h+.hai-acc__body+.hai-acc__h,.hai-acc__body+.hai-acc__h,.hai-acc__h+.hai-acc__h{border-top:1px solid var(--hai-line);}',
    '.hai-acc__btn{display:flex;width:100%;align-items:center;justify-content:space-between;gap:8px;min-height:40px;padding:8px 12px;border:0;background:var(--hai-soft);color:var(--hai-ink);font:inherit;font-weight:700;text-align:left;cursor:pointer;}',
    '.hai-acc__btn:hover{filter:brightness(' + (dark ? '1.15' : '0.97') + ');}',
    '.hai-acc__chev{flex:none;transition:transform .15s ease;}',
    '.hai-acc__btn[aria-expanded="true"] .hai-acc__chev{transform:rotate(180deg);}',
    '.hai-acc__body{padding:10px 12px 4px;}',
    '.hai-panel p{margin:0 0 8px;color:var(--hai-ink);}',
    '.hai-panel ol{margin:0 0 6px;padding-left:20px;list-style:decimal;}',
    '.hai-panel li{margin:0 0 7px;}',
    '.hai-panel code,.hai-panel kbd{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.86em;overflow-wrap:anywhere;}',
    '.hai-panel kbd{padding:0 5px;border:1px solid currentColor;border-radius:4px;}',
    '.hai-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:5px;}',
    '.hai-dir{padding:2px 8px;border:1px solid var(--hai-line);border-radius:6px;background:var(--hai-soft);font-weight:700;}',
    '.hai-copy{display:inline-flex;flex:none;align-items:center;gap:.35em;white-space:nowrap;min-height:30px;padding:2px 12px;border:1px solid var(--hai-line);border-radius:999px;background:var(--hai-bg);color:var(--hai-ink);font:inherit;font-size:12px;font-weight:600;cursor:pointer;}',
    '.hai-copy:hover{background:var(--hai-soft);}',
    '.hai-copy:disabled{opacity:.5;cursor:not-allowed;}',
    '.hai-ico{flex:none;width:1em;height:1em;}',
    '.hai-ico--ok,.hai-copy.is-copied .hai-ico--copy{display:none;}',
    '.hai-copy.is-copied .hai-ico--ok{display:inline-block;}',
    '.hai-label{display:block;margin:4px 0 4px;font-weight:600;font-size:13px;}',
    '.hai-input{flex:1 1 180px;min-width:0;box-sizing:border-box;min-height:34px;padding:5px 8px;border:1px solid var(--hai-line);border-radius:6px;background:var(--hai-bg);color:var(--hai-ink);font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}',
    '.hai-switch-row{display:flex;align-items:center;gap:8px;margin:10px 0 4px;font-size:13px;}',
    '.hai-switch-row [data-hai-mode-label]{cursor:pointer;color:var(--hai-muted);}',
    '.hai-switch-row [data-hai-mode-label].is-on{color:var(--hai-ink);font-weight:700;}',
    '.hai-switch{position:relative;flex:none;width:42px;height:24px;padding:0;border:1px solid var(--hai-line);border-radius:999px;background:var(--hai-soft);cursor:pointer;}',
    '.hai-switch::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--hai-muted);transition:transform .15s ease;}',
    '.hai-switch[aria-checked="true"]{background:var(--hai-accent);border-color:var(--hai-accent);}',
    '.hai-switch[aria-checked="true"]::after{transform:translateX(18px);background:var(--hai-accent-ink);}',
    '.hai-out{display:block;flex:1 1 180px;min-width:0;padding:6px 8px;border:1px dashed var(--hai-line);border-radius:6px;background:var(--hai-soft);white-space:pre-wrap;word-break:break-all;}',
    '.hai-out.is-empty{color:var(--hai-muted);font-style:italic;}',
    '.hai-panel p.hai-role{margin:0 0 10px;padding:8px 10px;border-radius:8px;background:var(--hai-soft);font-weight:600;line-height:1.45;}',
    '.hai-badge{display:inline-block;margin-right:4px;padding:1px 8px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.03em;text-transform:uppercase;vertical-align:1px;}',
    '.hai-badge--primary{background:var(--hai-accent);color:var(--hai-accent-ink);}',
    '.hai-badge--supplementary{border:1px dashed var(--hai-muted);color:var(--hai-ink);}',
    '.hai-hint{display:block;margin-top:4px;font-size:12px;color:var(--hai-muted);}',
    '.hai-status{margin:6px 0 0!important;font-size:12px;color:var(--hai-muted)!important;}',
    '.hai-status:empty{display:none;}',
    '@media (max-width:640px){.hai-float .hai-btn-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}.hai-float .hai-fab{width:48px;height:48px;padding:0;justify-content:center;font-size:18px;}}',
    '@media print{.hai,.hai-mounted{display:none!important;}}'
  ].join('\n');

  function boot() {
    var style = document.createElement('style');
    style.setAttribute('data-hai-style', '');
    style.textContent = css;
    document.head.appendChild(style);

    var appName = cfg.app || 'This app';
    var title = cfg.title || 'Add or edit with AI';
    var label = cfg.label || 'Add / edit with AI';
    var ask = cfg.ask || 'Ask it to add, read, or edit this app\u2019s data.';
    // data-role="primary|supplementary" + data-input="<what to enter>": says plainly what this panel feeds the app
    var role = cfg.role === 'supplementary' ? 'supplementary' : (cfg.role === 'primary' ? 'primary' : '');
    var roleHtml = role && cfg.input ? '<p class="hai-role"><span class="hai-badge hai-badge--' + role + '">' + (role === 'primary' ? 'Primary' : 'Supplementary') + '</span> ' +
      (role === 'primary' ? 'This is where the app\u2019s main content comes from: ' + rich(cfg.input) + '.' : 'Optional extra: ' + rich(cfg.input) + ' the app can use to do more.') + '</p>' : '';
    var pid = 'hai-panel-' + appId.replace(/[^a-z0-9_-]/gi, '-');
    var chev = '<svg class="hai-acc__chev" width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var panel = document.createElement('section');
    panel.className = 'hai hai-panel';
    panel.id = pid;
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-labelledby', pid + '-title');
    panel.innerHTML =
      '<div class="hai-head"><h2 class="hai-title" id="' + pid + '-title">' + esc(title) + '</h2>' +
      '<button type="button" class="hai-close" data-hai-close aria-label="Close">&times;</button></div>' +
      '<div class="hai-acc">' +
      '<h3 class="hai-acc__h"><button type="button" class="hai-acc__btn" id="' + pid + '-t-about" aria-expanded="false" aria-controls="' + pid + '-p-about" data-hai-tile="about">' +
      '<span>How to add or edit with AI</span>' + chev + '</button></h3>' +
      '<div class="hai-acc__body" id="' + pid + '-p-about" role="region" aria-labelledby="' + pid + '-t-about" data-hai-body="about" hidden>' + roleHtml +
      '<p>' + esc(appName) + ' has no built-in AI, which keeps it free. Use the AI tool you already have, with your own tokens:</p>' +
      '<ol><li>Open system search (<kbd>&#8984;</kbd>&nbsp;<kbd>Space</kbd> for Spotlight on a Mac, or the Windows search box) and find the folder named:' +
      '<span class="hai-row"><code class="hai-dir">' + esc(folder) + '</code>' +
      '<button type="button" class="hai-copy" data-hai-copy aria-label="Copy folder name ' + esc(folder) + '">' + ICON_COPY + '<span>Copy</span></button></span>' +
      (cfg.parent ? '<span class="hai-hint">It sits inside a folder named <code>' + esc(cfg.parent) + '</code>.</span>' : '') + '</li>' +
      '<li>Open that folder in <strong>Cursor</strong>, <strong>Claude Code</strong>, or your favorite AI harness.</li>' +
      '<li>' + rich(ask) + '</li></ol>' +
      '<p class="hai-hint">Tip: save the folder path under <strong>Your folder path</strong> so you can skip the search next time.</p></div>' +
      '<h3 class="hai-acc__h"><button type="button" class="hai-acc__btn" id="' + pid + '-t-path" aria-expanded="false" aria-controls="' + pid + '-p-path" data-hai-tile="path">' +
      '<span>Your folder path</span>' + chev + '</button></h3>' +
      '<div class="hai-acc__body" id="' + pid + '-p-path" role="region" aria-labelledby="' + pid + '-t-path" data-hai-body="path" hidden>' +
      '<p>We can remember your folder path for you here, so next time you can copy it, or a ready-made <code>cd</code> command, without searching. It stays in this browser only.</p>' +
      '<label class="hai-label" for="' + pid + '-in">Full path to your <code>' + esc(folder) + '</code> folder</label>' +
      '<span class="hai-row"><input class="hai-input" id="' + pid + '-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="/Users/you/\u2026/' + esc(folder) + '" data-hai-path>' +
      '<button type="button" class="hai-copy" data-hai-clear aria-label="Clear saved folder path">' + ICON_CLEAR + '<span>Clear</span></button></span>' +
      '<span class="hai-hint">Mac: right-click the folder in Finder, hold <kbd>Option</kbd>, choose <em>Copy \u2026 as Pathname</em>. Windows: <kbd>Shift</kbd> + right-click, <em>Copy as path</em>.</span>' +
      '<div class="hai-switch-row"><span data-hai-mode-label="path">Path</span>' +
      '<button type="button" class="hai-switch" role="switch" aria-checked="false" aria-label="Show as a cd command" data-hai-switch></button>' +
      '<span data-hai-mode-label="command">Command</span></div>' +
      '<span class="hai-row"><code class="hai-out" data-hai-out aria-live="polite"></code>' +
      '<button type="button" class="hai-copy" data-hai-out-copy>' + ICON_COPY + '<span>Copy</span></button></span>' +
      '<p class="hai-hint" data-hai-out-hint>Paste the command into a terminal, or the path into your AI tool\u2019s Open Folder.</p></div>' +
      '</div>' +
      '<p class="hai-status" data-hai-status role="status" aria-live="polite"></p>';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', pid);
    btn.setAttribute('aria-label', title + ': how to use your own AI tool');
    btn.title = label;
    btn.innerHTML = '<span aria-hidden="true">&#10022;</span> <span class="hai-btn-label">' + esc(label) + '</span><span class="hai-btn-short" aria-hidden="true">AI</span>';

    var mount = cfg.mount ? document.querySelector(cfg.mount) : null;
    var root;
    if (mount) {
      btn.className = 'hai-mounted ' + (cfg.btnClass || '');
      if (cfg.mountWhere === 'append') mount.appendChild(btn); else mount.insertBefore(btn, mount.firstChild);
      panel.classList.add('hai-panel--fixed');
      document.body.appendChild(panel);
      root = btn;
      var sw = document.createElement('style');
      sw.textContent = '.hai-mounted .hai-btn-short{display:none;}@media (max-width:640px){.hai-mounted .hai-btn-label{display:none;}.hai-mounted .hai-btn-short{display:inline;}}';
      document.head.appendChild(sw);
    } else {
      btn.className = 'hai-fab';
      root = document.createElement('div');
      root.className = 'hai hai-float';
      var left = cfg.position === 'bl';
      root.style[left ? 'left' : 'right'] = '16px';
      root.style.alignItems = left ? 'flex-start' : 'flex-end';
      root.appendChild(panel);
      root.appendChild(btn);
      document.body.appendChild(root);
      var lift = function () {
        var extra = 0;
        if (cfg.avoid) {
          Array.prototype.forEach.call(document.querySelectorAll(cfg.avoid), function (el) {
            var r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0 && r.top > window.innerHeight / 2 && getComputedStyle(el).visibility !== 'hidden') extra = Math.max(extra, window.innerHeight - r.top);
          });
        }
        root.style.bottom = 'calc(16px + ' + Math.round(extra) + 'px + ' + (cfg.offsetBottom || '0px') + ')';
      };
      lift();
      window.addEventListener('resize', lift);
      setTimeout(lift, 800);
    }

    var status = panel.querySelector('[data-hai-status]');
    var input = panel.querySelector('[data-hai-path]');
    var sw2 = panel.querySelector('[data-hai-switch]');
    var out = panel.querySelector('[data-hai-out]');
    var outCopy = panel.querySelector('[data-hai-out-copy]');
    var outHint = panel.querySelector('[data-hai-out-hint]');

    /* ---- accordion: one tile open at a time; remember the last one opened ---- */
    function setTile(name, remember) {
      Array.prototype.forEach.call(panel.querySelectorAll('[data-hai-tile]'), function (b) {
        var on = b.getAttribute('data-hai-tile') === name;
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        panel.querySelector('[data-hai-body="' + b.getAttribute('data-hai-tile') + '"]').hidden = !on;
      });
      if (remember && name) save('openTile', name);
    }
    function storedTile() { var t = load('openTile'); return t === 'path' ? 'path' : 'about'; }
    Array.prototype.forEach.call(panel.querySelectorAll('[data-hai-tile]'), function (b) {
      b.addEventListener('click', function () {
        var name = b.getAttribute('data-hai-tile');
        if (b.getAttribute('aria-expanded') === 'true') setTile('', false); else setTile(name, true);
      });
    });

    /* ---- folder path + Path/Command switch ---- */
    function mode() { return load('mode') === 'command' ? 'command' : 'path'; }
    function render() {
      var p = cleanPath(input.value);
      var cmd = mode() === 'command';
      sw2.setAttribute('aria-checked', cmd ? 'true' : 'false');
      Array.prototype.forEach.call(panel.querySelectorAll('[data-hai-mode-label]'), function (l) { l.classList.toggle('is-on', l.getAttribute('data-hai-mode-label') === (cmd ? 'command' : 'path')); });
      var text = p ? (cmd ? cdCommand(p) : p) : '';
      out.textContent = text || (cmd ? 'cd "/your/path/' + folder + '"' : 'Type or paste the folder path above.');
      out.classList.toggle('is-empty', !text);
      outCopy.disabled = !text;
      outCopy.setAttribute('aria-label', cmd ? 'Copy cd command' : 'Copy folder path');
      outHint.hidden = !text;
    }
    input.value = load('path') || '';
    input.addEventListener('input', function () { save('path', cleanPath(input.value)); render(); });
    input.addEventListener('change', function () { var c = cleanPath(input.value); if (c !== input.value) input.value = c; save('path', c); render(); });
    panel.querySelector('[data-hai-clear]').addEventListener('click', function () { input.value = ''; save('path', null); render(); input.focus(); status.textContent = 'Saved folder path cleared.'; });
    function setMode(m) { save('mode', m); render(); }
    sw2.addEventListener('click', function () { setMode(mode() === 'command' ? 'path' : 'command'); });
    Array.prototype.forEach.call(panel.querySelectorAll('[data-hai-mode-label]'), function (l) { l.addEventListener('click', function () { setMode(l.getAttribute('data-hai-mode-label')); sw2.focus(); }); });
    render();

    function place() {
      if (!mount) return;
      var r = btn.getBoundingClientRect();
      var vw = document.documentElement.clientWidth;
      panel.style.top = Math.round(r.bottom + 6) + 'px';
      panel.style.maxHeight = 'calc(100vh - ' + Math.round(r.bottom + 18) + 'px)';
      if (vw <= 420) { panel.style.left = '12px'; panel.style.right = 'auto'; }
      else { panel.style.left = 'auto'; panel.style.right = Math.max(12, Math.round(vw - r.right)) + 'px'; }
    }
    function isOpen() { return !panel.hidden; }
    function open() {
      place(); setTile(storedTile(), false); render();
      panel.hidden = false; btn.setAttribute('aria-expanded', 'true');
      var first = storedTile() === 'path' ? input : panel.querySelector('[data-hai-copy]');
      if (first) first.focus();
    }
    function close(restore) { if (!isOpen()) return; panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (status) status.textContent = ''; if (restore) btn.focus(); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); if (isOpen()) close(false); else open(); });
    panel.querySelector('[data-hai-close]').addEventListener('click', function () { close(true); });
    document.addEventListener('keydown', function (e) { if ((e.key === 'Escape' || e.key === 'Esc') && isOpen()) { e.preventDefault(); e.stopPropagation(); close(true); } }, true);
    document.addEventListener('pointerdown', function (e) { if (isOpen() && !panel.contains(e.target) && !btn.contains(e.target)) close(false); });
    window.addEventListener('resize', function () { if (isOpen()) place(); });
    function fallbackCopy(text) {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
      ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      document.body.removeChild(ta); return ok;
    }
    function flash(b) { b.classList.add('is-copied'); clearTimeout(b._haiT); b._haiT = setTimeout(function () { b.classList.remove('is-copied'); }, 1600); }
    function copy(text, what, back) {
      function done(ok) { status.textContent = ok ? 'Copied ' + what + '.' : 'Copy failed. Select the text and copy it.'; if (back) { back.focus(); if (ok) flash(back); } }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      else done(fallbackCopy(text));
    }
    panel.querySelector('[data-hai-copy]').addEventListener('click', function (e) { copy(folder, '\u201c' + folder + '\u201d. Paste it into system search', e.currentTarget); });
    outCopy.addEventListener('click', function () { var p = cleanPath(input.value); if (!p) return; copy(mode() === 'command' ? cdCommand(p) : p, mode() === 'command' ? 'the cd command' : 'the folder path', outCopy); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
