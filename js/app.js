'use strict';
// Catalog records live in data/catalog.json. This file builds links and renders the directory.
const CACHE_BUST = (() => {
  const src = document.currentScript && document.currentScript.src;
  if (src) return new URL(src).searchParams.get('v') || String(Date.now());
  const scripts = document.querySelectorAll('script[src*="app.js"]');
  const last = scripts[scripts.length - 1];
  return last ? (new URL(last.src).searchParams.get('v') || String(Date.now())) : String(Date.now());
})();
let instruments = [];
let themes = [];
let bySymbol = {};
let indexData = null;

async function loadJSON(path) {
  const response = await fetch(path + '?v=' + encodeURIComponent(CACHE_BUST));
  if (!response.ok) throw new Error('Could not load ' + path + ' (' + response.status + ').');
  return response.json();
}

  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const google = query => 'https://www.google.com/search?q=' + encodeURIComponent(query);
  const googleNews = query => 'https://www.google.com/search?tbm=nws&q=' + encodeURIComponent(query);
  const externalAttrs = ' target="_blank" rel="noopener noreferrer"';
  const link = (title,url,description='',featured=false) => '<a class="resource-link' + (featured?' featured':'') + '" href="' + escapeHTML(url) + '"' + externalAttrs + '>' + escapeHTML(title) + (description?'<small>' + escapeHTML(description) + '</small>':'') + '<span class="sr-only"> (opens in a new tab)</span></a>';
  const fundUsesFutures = item => item.exposure.includes('futures');
  const stockAnalysisURL = item => 'https://stockanalysis.com/' + (item.kind==='stock'?'stocks/':'etf/') + item.symbol.toLowerCase() + '/';
  function redditSearchQuery(item) {
    const words = (item.symbol + ' ' + item.name).split(/[^A-Za-z0-9]+/).filter(word => word.length > 0 && word.length <= 5);
    words.push('stocks');
    return words.join(' ');
  }
  const relatedThemes = item => themes.filter(theme => theme.symbols.includes(item.symbol));
  function researchLinks(item) {
    const s = item.symbol;
    const root = stockAnalysisURL(item);
    const newsQuery = s + ' ' + item.name;
    const official = item.official || google(item.name + ' ' + s + (item.kind==='stock'?' official investor relations': ' ' + item.issuer + ' official fund holdings fees prospectus'));
    const groups = [
      {title:'Overview & analysis',links:[
        ['Stock Analysis',root,'Overview & key facts',true],
        ['Finviz','https://finviz.com/quote.ashx?t=' + encodeURIComponent(s),'Chart, stats & headlines'],
        ['Yahoo chart','https://finance.yahoo.com/quote/' + encodeURIComponent(s) + '/chart/','Price history & volume'],
        ['Analyst views',item.kind==='stock'?root+'forecast/':'https://seekingalpha.com/symbol/'+s,'Estimates & opinion']
      ]}
    ];
    if(item.kind==='stock') {
      groups.push({title:'Financials & primary sources',links:[
        ['Financials overview',root+'financials/','All statements'],
        ['Income statement',root+'financials/income-statement/','Revenue & profit'],
        ['Balance sheet',root+'financials/balance-sheet/','Assets, debt & equity'],
        ['Cash flow',root+'financials/cash-flow-statement/','Cash in & cash out'],
        ['SEC filings','https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK='+encodeURIComponent(s)+'&owner=exclude&count=40','Official reports'],
        [item.official?'Investor relations':'Find investor relations',official,item.official?'Company source':'Google search'],
        ['Earnings & guidance',google(item.name+' '+s+' next earnings date investor relations guidance'),'Google search']
      ]});
      groups.push({title:'Valuation & distributions',links:[
        ['Valuation & ratios',root+'statistics/','Multiples & key metrics'],
        ['Dividend history',root+'dividend/','Past payouts, if any']
      ]});
    } else {
      const useIssuerForHoldings = item.exposure==='Bullion' || item.exposure==='Currency trust' || fundUsesFutures(item);
      const holdingsURL = useIssuerForHoldings ? official : root+'holdings/';
      groups.push({title:'Fund holdings & documents',links:[
        [item.official?'Fund issuer':'Find fund issuer',official,item.official?'Official source':'Google search'],
        ['Holdings & exposure',holdingsURL,useIssuerForHoldings?'Issuer details':'What the fund owns'],
        ['Fees & structure',root,'Expense ratio & fund facts'],
        ['Reports & prospectus',google(item.name+' '+s+' '+item.issuer+' official annual report prospectus'),'Google search']
      ]});
    }
    groups.push({title:'News & the next catalyst',links:[
      ['Google News',googleNews(newsQuery),'Ticker + name news search'],
      ['Press releases',google(item.name+' '+s+' official press releases'),'Google search']
    ]});
    groups.push({title:'Sentiment & investor discussions',links:[
      ['Stocktwits','https://stocktwits.com/symbol/'+encodeURIComponent(s),'Ticker feed & sentiment'],
      ['Reddit search','https://www.reddit.com/search/?q='+encodeURIComponent(redditSearchQuery(item))+'&sort=new','Recent ticker discussions'],
      ['X cashtag search','https://x.com/search?q='+encodeURIComponent('$'+s+' '+(s.length<3?item.name:''))+'&src=typed_query&f=live','Recent posts · sign-in may apply'],
      ['Seeking Alpha','https://seekingalpha.com/symbol/'+encodeURIComponent(s),'Analysis & comments']
    ]});
    return groups;
  }
  let state = {theme:'gold',query:'',kind:'all',notesOnly:false,selected:'GLD',indexMode:false,indexPicks:[]};
  let notes = {};
  const NOTES_KEY = 'market-forces-notes';
  function loadNotes() {
    try {
      const parsed = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      notes = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch { notes = {}; }
  }
  function saveNotes() {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  }
  function notesFor(symbol) {
    const list = notes[symbol];
    return Array.isArray(list) ? list.filter(note => note && typeof note.text === 'string' && note.text.trim() && note.id) : [];
  }
  function noteCount(symbols) {
    return symbols.reduce((sum, symbol) => sum + notesFor(symbol).length, 0);
  }
  function noteBadge(total) {
    if (!total) return '';
    return '<span class="notes-badge" aria-hidden="true">' + total + '</span><span class="sr-only">, ' + total + (total === 1 ? ' note' : ' notes') + '</span>';
  }
  function formatNoteTime(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {month:'short', day:'numeric', year:'numeric'}).format(date);
  }
  function notesMarkup(item) {
    const list = notesFor(item.symbol);
    const items = list.map(note => '<li class="note-item"><p>' + escapeHTML(note.text) + '</p><time datetime="' + escapeHTML(note.at || '') + '">' + escapeHTML(formatNoteTime(note.at)) + '</time><button type="button" class="note-delete" data-delete-note="' + escapeHTML(note.id) + '">Delete</button></li>').join('');
    return '<section class="notes-panel"><h3>Notes</h3><form id="note-form"><label for="note-text">Note for ' + item.symbol + '</label><textarea id="note-text" maxlength="2000" rows="3"></textarea><button type="submit" class="add-note">Add note</button></form>' + (items ? '<ul class="note-list">' + items + '</ul>' : '') + '<p class="resource-note">Notes stay in this browser.</p></section>';
  }
  function matchingThemes(query) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return themes.filter(theme => {
      const text = (theme.name+' '+theme.tags).toLowerCase();
      return words.every(word => text.includes(word));
    });
  }
  function visibleInstruments() {
    let pool;
    const query = state.query.trim().toLowerCase();
    if(query) {
      const matchedSymbols = new Set(matchingThemes(query).flatMap(theme=>theme.symbols));
      const words = query.split(/\s+/).filter(Boolean);
      pool = instruments.filter(item => {
        const text = (item.symbol+' '+item.name+' '+item.exposure+' '+item.description+' '+(item.issuer||'')).toLowerCase();
        return matchedSymbols.has(item.symbol) || words.every(word => text.includes(word));
      });
      pool.sort((a,b) => Number(b.symbol.toLowerCase()===query)-Number(a.symbol.toLowerCase()===query));
    } else {
      pool = state.theme==='all'?instruments:themes.find(theme=>theme.id===state.theme).symbols.map(symbol=>bySymbol[symbol]);
    }
    return pool.filter(item=>(state.kind==='all'||item.kind===state.kind)&&(!state.notesOnly||notesFor(item.symbol).length));
  }
  function renderNav() {
    const button = (id,name,mark,count,noteTotal) => '<button type="button" class="theme-button" data-theme="' + id + '" aria-pressed="' + (!state.query && state.theme===id) + '"><span class="theme-mark" aria-hidden="true">' + escapeHTML(mark) + '</span><span>' + escapeHTML(name) + '</span><span class="theme-count" aria-hidden="true">' + count + '</span>' + noteBadge(noteTotal) + '</button>';
    let html = button('all','All tickers','All',instruments.length,noteCount(instruments.map(item=>item.symbol)));
    let previousGroup = '';
    let previousCategory = '';
    for(const theme of themes) {
      if(theme.group!==previousGroup) {
        const symbols=[...new Set(themes.filter(item=>item.group===theme.group).flatMap(item=>item.symbols))];
        html+='<div class="nav-label">'+escapeHTML(theme.group)+noteBadge(noteCount(symbols))+'</div>';
        previousGroup=theme.group;
        previousCategory='';
      }
      if(theme.category && theme.category!==previousCategory) {
        const symbols=[...new Set(themes.filter(item=>item.group===theme.group&&item.category===theme.category).flatMap(item=>item.symbols))];
        html+='<div class="nav-sublabel">'+escapeHTML(theme.category)+noteBadge(noteCount(symbols))+'</div>';
        previousCategory=theme.category;
      }
      html += button(theme.id,theme.name,theme.mark,theme.symbols.length,noteCount(theme.symbols));
    }
    $('theme-nav').innerHTML=html;
  }
  function renderTopic() {
    if(state.query) {
      const matches=matchingThemes(state.query);
      $('topic').innerHTML='<p class="eyebrow">Directory search</p><h2 id="topic-title">Results for “'+escapeHTML(state.query)+'”</h2><p>Matches from ticker symbols, company names, industries, markets, and economic themes.</p>'+(matches.length?'<div class="search-themes">'+matches.map(theme=>'<button type="button" data-theme="'+theme.id+'">Browse '+escapeHTML(theme.name)+'</button>').join('')+'</div>':'');
      return;
    }
    if(state.theme==='all') {
      $('topic').innerHTML='<p class="eyebrow">Full directory</p><h2 id="topic-title">All common tickers</h2><p>Browse '+instruments.length+' stocks and funds, or choose an asset, industry, market, or economic force to narrow your starting point.</p><p class="connection">A stock is a business; a fund may hold stocks, bonds, bullion, currencies, or futures. Check the exposure label before comparing tickers.</p>';
      return;
    }
    const theme=themes.find(item=>item.id===state.theme);
    const eyebrow=theme.category?theme.group+' · '+theme.category:theme.group;
    $('topic').innerHTML='<p class="eyebrow">'+escapeHTML(eyebrow)+'</p><h2 id="topic-title">'+escapeHTML(theme.name)+'</h2><p>'+escapeHTML(theme.description)+'</p><p class="connection"><strong>The connection: </strong>'+escapeHTML(theme.connection)+'</p><div class="macro-links">'+theme.links.map(([title,url])=>'<a href="'+escapeHTML(url)+'"'+externalAttrs+'>'+escapeHTML(title)+'<span class="sr-only"> (opens in a new tab)</span></a>').join('')+'</div>';
  }
  function renderResults(pool) {
    $('result-count').textContent=pool.length+' '+(pool.length===1?'ticker':'tickers');
    $('results-heading').textContent=state.query?'Matching tickers':'Common tickers';
    if(!pool.length) {
      $('ticker-results').innerHTML='<div class="empty"><h3>No matching tickers</h3><p>Try a shorter term, a symbol like GLD, or switch to stocks &amp; funds.</p><button type="button" class="reset-button" id="reset-search">Reset search &amp; filter</button></div>';
      return;
    }
    $('ticker-results').innerHTML='<div class="ticker-list">'+pool.map(item => {
      const picked=state.indexPicks.includes(item.symbol);
      const selected=state.indexMode?picked:item.symbol===state.selected;
      const check=state.indexMode?'<label class="index-check"><input type="checkbox" data-index-pick="'+item.symbol+'"'+(picked?' checked':'')+' aria-label="Include '+item.symbol+' in index weights"></label>':'';
      const noteTotal=notesFor(item.symbol).length;
      const noteChip=noteTotal?'<span class="badge notes">'+noteTotal+(noteTotal===1?' note':' notes')+'</span>':'';
      const action=state.indexMode?'Include or remove '+item.symbol+' from index weights':'Select '+item.symbol+' for research links';
      return '<div class="ticker-row'+(selected?' selected':'')+'">'+check+'<button type="button" class="ticker-select" data-symbol="'+item.symbol+'" aria-pressed="'+selected+'" aria-controls="research"><span class="ticker-title"><span class="symbol">'+item.symbol+'</span><span class="ticker-name">'+escapeHTML(item.name)+'</span></span><span class="ticker-desc">'+escapeHTML(item.description)+'</span><span class="row-meta"><span class="badge '+(item.kind==='stock'?'stock':'')+'">'+(item.kind==='stock'?'Stock':'Fund')+'</span><span class="badge '+(fundUsesFutures(item)?'futures':'')+'">'+escapeHTML(item.exposure)+'</span>'+noteChip+'</span><span class="sr-only">'+action+'</span></button><a class="quick-link" href="'+stockAnalysisURL(item)+'"'+externalAttrs+' aria-label="Open '+item.symbol+' on Stock Analysis (opens in a new tab)">Stock Analysis</a></div>';
    }).join('')+'</div>';
  }
  function formatSnapshot(iso) {
    const [year,month,day]=iso.split('-').map(Number);
    return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(year,month-1,day));
  }
  function formatWeight(value) {
    return Number(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
  }
  function memberships(symbol) {
    if(!indexData) return [];
    return indexData.indices.map(index=>({index,weight:index.weights[symbol]})).filter(row=>typeof row.weight==='number').sort((a,b)=>b.weight-a.weight||a.index.name.localeCompare(b.index.name));
  }
  function togglePick(symbol) {
    const picks=new Set(state.indexPicks);
    if(picks.has(symbol)) picks.delete(symbol); else picks.add(symbol);
    state.indexPicks=[...picks];
    state.selected=symbol;
    render();
    document.querySelector('[data-index-pick="'+symbol+'"]')?.focus();
  }
  function renderIndexWeights() {
    $('research').setAttribute('aria-label','Index weights');
    if(!indexData) {$('research').innerHTML='<div class="research-placeholder">Index weights did not load.</div>';return;}
    const picks=state.indexPicks.map(symbol=>bySymbol[symbol]).filter(Boolean);
    const head='<div class="research-head"><p class="eyebrow">Index weights</p><h2>Where the weight sits</h2><p class="note">Each line is the share of that index, largest first. The date is the holdings snapshot.</p></div>';
    const body=!picks.length
      ? '<div class="research-placeholder">Check one or more tickers. A fund is usually not a member of the index it tracks.</div>'
      : '<div class="research-groups">'+picks.map(item=>{
          const rows=memberships(item.symbol);
          const list=rows.length
            ? '<ol class="weight-list">'+rows.map(({index,weight})=>'<li class="weight-row"><div class="weight-top"><span class="weight-name">'+escapeHTML(index.name)+'</span><span class="weight-pct">'+formatWeight(weight)+'</span></div><div class="weight-meta"><span class="badge estimate">'+escapeHTML(index.qualityLabel)+'</span><span>'+escapeHTML(formatSnapshot(index.snapshotDate))+'</span></div><p class="weight-note">'+escapeHTML(index.note)+'</p><p class="weight-note"><a href="'+escapeHTML(index.sourceUrl)+'"'+externalAttrs+'>'+escapeHTML(index.sourceName)+'<span class="sr-only"> (opens in a new tab)</span></a></p></li>').join('')+'</ol>'
            : '<p class="weight-note">No weight in the index snapshots stored here.</p>';
          return '<section class="weight-ticker"><h3><span class="symbol">'+item.symbol+'</span> '+escapeHTML(item.name)+'</h3>'+list+'</section>';
        }).join('')+'</div>';
    const quiet=indexData.indices.filter(index=>!Object.keys(index.weights).length);
    const limits='<section class="limits"><h3>Not available as an official file</h3><ul>'+indexData.limits.map(limit=>'<li><strong>'+escapeHTML(limit.name)+'.</strong> '+escapeHTML(limit.reason)+'</li>').join('')+'</ul>'+(quiet.length?'<h3>Checked, with no directory match</h3><ul>'+quiet.map(index=>'<li><strong>'+escapeHTML(index.name)+'.</strong> '+escapeHTML(index.note)+' Snapshot '+escapeHTML(formatSnapshot(index.snapshotDate))+'. No ticker in this directory was in that file.</li>').join('')+'</ul>':'')+'</section>';
    $('research').innerHTML=head+body+limits;
  }
  function renderResearch() {
    if(state.indexMode) {renderIndexWeights();return;}
    $('research').setAttribute('aria-label','Selected ticker research');
    const item=bySymbol[state.selected];
    if(!item) {$('research').innerHTML='<div class="research-placeholder">Select a ticker to see its research links.</div>';return;}
    const groups=researchLinks(item);
    $('research').innerHTML='<div class="research-head"><p class="eyebrow">Selected ticker · research links</p><div class="research-title"><h2>'+item.symbol+'</h2><span class="badge '+(item.kind==='stock'?'stock':'')+'">'+(item.kind==='stock'?'Stock':'Fund')+'</span></div><p class="research-name">'+escapeHTML(item.name)+'</p><p class="note">'+escapeHTML(item.description)+'</p></div><div class="research-groups">'+groups.map(group=>'<section class="resource-group"><h3>'+escapeHTML(group.title)+'</h3><div class="resource-links">'+group.links.map(args=>link(...args)).join('')+'</div>'+(group.title==='Sentiment & investor discussions'?'<p class="resource-note">Posts and sentiment are opinions from participating users. Coverage varies by ticker; some sources have limited data.</p>':'')+'</section>').join('')+'</div>'+(fundUsesFutures(item)?'<div class="risk-note"><strong>Futures exposure:</strong> This fund uses contracts rather than storing the commodity. Rolling contracts, expenses, and possible K-1 tax reporting can affect the result. Read the issuer’s current documents.</div>':'')+notesMarkup(item);
  }
  function render(announce=true) {
    const focusedTheme=document.activeElement?.dataset?.theme;
    const pool=visibleInstruments();
    if(!pool.some(item=>item.symbol===state.selected)) state.selected=pool[0]?.symbol||null;
    renderNav();renderTopic();renderResults(pool);renderResearch();
    if(focusedTheme) document.querySelector('.theme-button[data-theme="'+focusedTheme+'"]')?.focus({preventScroll:true});
    const modeButton=$('index-mode');
    if(modeButton) modeButton.setAttribute('aria-pressed',String(state.indexMode));
    if(announce) $('status').textContent=state.indexMode?state.indexPicks.length+' '+(state.indexPicks.length===1?'ticker':'tickers')+' selected for index weights.':pool.length+' matching tickers.'+(state.selected?' Research links shown for '+state.selected+'.':'');
  }
  function chooseTheme(id) {
    if(id!=='all'&&!themes.some(theme=>theme.id===id)) throw new Error('Unknown theme.');
    state.theme=id;state.query='';$('search').value='';render();
  }
  function chooseSymbol(symbol,moveFocus=false) {
    const item=bySymbol[symbol];
    if(!item) throw new Error('Unknown ticker.');
    if(!visibleInstruments().some(current=>current.symbol===symbol)) {
      state.query=symbol;state.kind='all';$('search').value=symbol;$('kind-filter').value='all';
    }
    state.selected=symbol;
    const pool=visibleInstruments();
    renderNav();renderTopic();
    // Keep the clicked button in the DOM so keyboard focus is preserved.
    if(document.querySelector('.ticker-select[data-symbol="'+symbol+'"]')) {
      for(const button of document.querySelectorAll('.ticker-select')) {
        const selected=button.dataset.symbol===symbol;
        button.setAttribute('aria-pressed',String(selected));
        button.closest('.ticker-row').classList.toggle('selected',selected);
      }
    } else {renderResults(pool);}
    renderResearch();
    $('status').textContent='Research links shown for '+symbol+'.';
    if(moveFocus&&window.matchMedia('(max-width:1180px)').matches) {
      $('research').focus({preventScroll:true});
      $('research').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
    }
    return {symbol:item.symbol,name:item.name,kind:item.kind,exposure:item.exposure,links:researchLinks(item)};
  }

async function init() {
  try {
    const catalog = await loadJSON('data/catalog.json');
    instruments = catalog.instruments;
    themes = catalog.themes;
    bySymbol = Object.fromEntries(instruments.map(item => [item.symbol, item]));
    indexData = await loadJSON('data/index-weights.json').catch(() => null);
    loadNotes();
  } catch (error) {
    $('ticker-results').innerHTML = '<div class="empty"><h3>The directory did not load</h3><p>' + escapeHTML(error.message) + '</p></div>';
    $('status').textContent = 'The directory did not load.';
    return;
  }
  $('catalog-count').textContent = instruments.length + ' tickers';
  $('search-form').addEventListener('submit', event => event.preventDefault());
  $('search').addEventListener('input', event => { state.query = event.target.value.trim(); render(); });
  $('kind-filter').addEventListener('change', event => { state.kind = event.target.value; render(); });
  $('index-mode').addEventListener('click', () => {
    state.indexMode = !state.indexMode;
    if (state.indexMode && !state.indexPicks.length && state.selected) state.indexPicks = [state.selected];
    render();
  });
  $('notes-only').addEventListener('change', event => { state.notesOnly = event.target.checked; render(); });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'note-form') return;
    event.preventDefault();
    const text = $('note-text').value.trim().slice(0, 2000);
    if (!text || !state.selected) return;
    const entry = {id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), text, at: new Date().toISOString()};
    notes[state.selected] = [entry, ...notesFor(state.selected)];
    saveNotes();
    render();
    $('note-text')?.focus();
  });
  document.addEventListener('change', event => {
    const box = event.target.closest('[data-index-pick]');
    if (!box) return;
    const symbol = box.dataset.indexPick;
    const picks = new Set(state.indexPicks);
    if (box.checked) picks.add(symbol); else picks.delete(symbol);
    state.indexPicks = [...picks];
    render();
    document.querySelector('[data-index-pick="'+symbol+'"]')?.focus();
  });
  document.addEventListener('click', event => {
    const deleteNote = event.target.closest('[data-delete-note]');
    if (deleteNote && state.selected) {
      notes[state.selected] = notesFor(state.selected).filter(note => note.id !== deleteNote.dataset.deleteNote);
      if (!notes[state.selected].length) delete notes[state.selected];
      saveNotes();
      render();
      return;
    }
    const themeButton = event.target.closest('[data-theme]');
    if (themeButton) { chooseTheme(themeButton.dataset.theme); return; }
    if (event.target.closest('[data-index-pick]')) return;
    const tickerButton = event.target.closest('[data-symbol]');
    if (tickerButton) {
      if (state.indexMode) { togglePick(tickerButton.dataset.symbol); return; }
      chooseSymbol(tickerButton.dataset.symbol, true);
      return;
    }
    if (event.target.closest('#reset-search')) { state.query = ''; state.kind = 'all'; state.notesOnly = false; $('search').value = ''; $('kind-filter').value = 'all'; $('notes-only').checked = false; render(); $('search').focus(); }
  });
  $('guide-link').addEventListener('click', () => { $('research-guide').open = true; });
  render(false);
  if (document.modelContext?.registerTool) {
    const lifecycle = new AbortController();
    const tools = [
      {name:'search_ticker_directory',title:'Search ticker directory',description:'Search economic themes, company names, and ticker symbols; update the visible results. Does not open external websites.',inputSchema:{type:'object',properties:{query:{type:'string',maxLength:200},kind:{type:'string',enum:['all','stock','fund']}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
        if(!input||typeof input.query!=='string'||input.query.length>200||Object.keys(input).some(key=>!['query','kind'].includes(key))||(input.kind!==undefined&&!['all','stock','fund'].includes(input.kind)))throw new Error('Provide a query string and a valid kind.');
        state.query=input.query.trim();state.kind=input.kind||'all';$('search').value=state.query;$('kind-filter').value=state.kind;render();
        return {tickers:visibleInstruments().map(({symbol,name,kind,exposure})=>({symbol,name,kind,exposure})),themes:matchingThemes(state.query).map(({id,name})=>({id,name}))};
      }},
      {name:'select_ticker_for_research',title:'Select ticker for research',description:'Select a ticker from this directory and return its research links. Does not open external websites.',inputSchema:{type:'object',properties:{symbol:{type:'string'}},required:['symbol'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
        if(!input||typeof input.symbol!=='string'||Object.keys(input).some(key=>key!=='symbol'))throw new Error('Provide a ticker symbol.');
        return chooseSymbol(input.symbol.trim().toUpperCase());
      }}
    ];
    for (const tool of tools) { try { Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{}); } catch {} }
    window.addEventListener('pagehide', () => lifecycle.abort(), {once:true});
  }
}
init();
