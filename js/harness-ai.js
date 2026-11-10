/* "Add / edit with AI" helper for harness-first apps. Drop-in, no dependencies, no build step.
 * This app has no built-in AI (that keeps it free). The panel tells people to find this app's folder with system
 * search, open it in Cursor, Claude Code or another AI harness, and work on the data with their own tokens.
 * Configure on the <script> tag:
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
  var dark = cfg.theme === 'dark';
  var accent = cfg.accent || (dark ? '#e8eaed' : '#1f2937');
  var accentInk = cfg.accentInk || (dark ? '#1a1d21' : '#ffffff');

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function rich(s) { return esc(s).replace(/`([^`]+)`/g, '<code>$1</code>'); }

  var css = [
    '.hai{--hai-bg:' + (dark ? '#22262c' : '#ffffff') + ';--hai-ink:' + (dark ? '#e8eaed' : '#111827') + ';--hai-muted:' + (dark ? '#9aa3ad' : '#4b5563') + ';--hai-line:' + (dark ? '#3a414b' : '#d1d5db') + ';--hai-soft:' + (dark ? '#2a2f36' : '#f3f4f6') + ';--hai-accent:' + accent + ';--hai-accent-ink:' + accentInk + ';font-family:inherit;}',
    '.hai-float{position:fixed;z-index:2147483000;display:flex;flex-direction:column;gap:8px;pointer-events:none;}',
    '.hai-float>*{pointer-events:auto;}',
    '.hai-fab{display:inline-flex;align-items:center;gap:.45rem;min-height:44px;padding:.55rem 1rem;border:0;border-radius:999px;background:var(--hai-accent);color:var(--hai-accent-ink);font:inherit;font-size:.875rem;font-weight:600;line-height:1.1;box-shadow:0 6px 20px rgba(0,0,0,.25);cursor:pointer;}',
    '.hai-fab:hover{filter:brightness(1.1);}',
    '.hai-btn-short{display:none;}',
    '.hai :focus-visible,.hai-mounted:focus-visible{outline:3px solid #2563eb;outline-offset:2px;}',
    '.hai-panel{box-sizing:border-box;width:min(380px,calc(100vw - 24px));max-height:min(70vh,560px);overflow:auto;padding:14px 16px;border:1px solid var(--hai-line);border-radius:10px;background:var(--hai-bg);color:var(--hai-ink);font-size:14px;line-height:1.5;text-align:left;box-shadow:0 12px 32px rgba(0,0,0,.28);}',
    '.hai-panel[hidden]{display:none!important;}',
    '.hai-panel--fixed{position:fixed;z-index:2147483001;}',
    '.hai-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;}',
    '.hai-title{margin:0 0 6px;font-size:16px;font-weight:700;line-height:1.3;color:var(--hai-ink);}',
    '.hai-close{flex:none;min-width:32px;min-height:32px;border:0;border-radius:6px;background:transparent;color:var(--hai-muted);font:inherit;font-size:20px;line-height:1;cursor:pointer;}',
    '.hai-close:hover{background:var(--hai-soft);color:var(--hai-ink);}',
    '.hai-panel p{margin:0 0 8px;color:var(--hai-ink);}',
    '.hai-panel ol{margin:0 0 6px;padding-left:20px;list-style:decimal;}',
    '.hai-panel li{margin:0 0 7px;}',
    '.hai-panel code,.hai-panel kbd{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.86em;overflow-wrap:anywhere;}',
    '.hai-panel kbd{padding:0 5px;border:1px solid currentColor;border-radius:4px;}',
    '.hai-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:5px;}',
    '.hai-dir{padding:2px 8px;border:1px solid var(--hai-line);border-radius:6px;background:var(--hai-soft);font-weight:700;}',
    '.hai-copy{min-height:30px;padding:2px 12px;border:1px solid var(--hai-line);border-radius:999px;background:var(--hai-bg);color:var(--hai-ink);font:inherit;font-size:12px;font-weight:600;cursor:pointer;}',
    '.hai-copy:hover{background:var(--hai-soft);}',
    '.hai-hint{display:block;margin-top:4px;font-size:12px;color:var(--hai-muted);}',
    '.hai-status{margin:0!important;font-size:12px;color:var(--hai-muted)!important;}',
    '.hai-status:empty{display:none;}',
    '@media (max-width:640px){.hai-float .hai-btn-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}.hai-float .hai-fab{width:48px;height:48px;padding:0;justify-content:center;font-size:18px;}.hai-mounted .hai-btn-label{display:none;}.hai-mounted .hai-btn-short{display:inline;}}',
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
    var pid = 'hai-panel-' + folder.replace(/[^a-z0-9_-]/gi, '');

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
      '<p>' + esc(appName) + ' has no built-in AI, which keeps it free. Use the AI tool you already have, with your own tokens:</p>' +
      '<ol><li>Open system search (<kbd>&#8984;</kbd>&nbsp;<kbd>Space</kbd> for Spotlight on a Mac, or the Windows search box) and find the folder named:' +
      '<span class="hai-row"><code class="hai-dir">' + esc(folder) + '</code>' +
      '<button type="button" class="hai-copy" data-hai-copy aria-label="Copy folder name ' + esc(folder) + '">Copy</button></span>' +
      (cfg.parent ? '<span class="hai-hint">It sits inside a folder named <code>' + esc(cfg.parent) + '</code>.</span>' : '') + '</li>' +
      '<li>Open that folder in <strong>Cursor</strong>, <strong>Claude Code</strong>, or your favorite AI harness.</li>' +
      '<li>' + rich(ask) + '</li></ol>' +
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
    function place() {
      if (!mount) return;
      var r = btn.getBoundingClientRect();
      var vw = document.documentElement.clientWidth;
      panel.style.top = Math.round(r.bottom + 6) + 'px';
      if (vw <= 420) { panel.style.left = '12px'; panel.style.right = 'auto'; }
      else { panel.style.left = 'auto'; panel.style.right = Math.max(12, Math.round(vw - r.right)) + 'px'; }
    }
    function isOpen() { return !panel.hidden; }
    function open() { place(); panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); var c = panel.querySelector('[data-hai-copy]'); if (c) c.focus(); }
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
    panel.querySelector('[data-hai-copy]').addEventListener('click', function () {
      function done(ok) { status.textContent = ok ? 'Copied \u201c' + folder + '\u201d. Paste it into system search.' : 'Copy failed. Select the folder name and copy it.'; }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(folder).then(function () { done(true); }, function () { done(fallbackCopy(folder)); });
      else done(fallbackCopy(folder));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
