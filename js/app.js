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
let catalogUpdated = '';

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
  // Plain-language note on what each kind of exposure holds. Wording only: no prices, yields, or figures.
  const EXPOSURE_TYPES = {
    business:{label:'One company',text:'Shares of a single business. The price follows how that company does and what investors expect: sales, profit, debt, and management decisions. One company can move very differently from its theme.'},
    stockFund:{label:'A stock fund',text:'A basket of company stocks in one fund. Owning many companies lowers single-company risk, but the fund still rises and falls with the stock market and its sector. Check the holdings, the index it follows, and the expense ratio.'},
    bondFund:{label:'A bond fund',text:'A fund of bonds, which are loans to a government or company. Bond prices usually fall when interest rates rise, and longer-term bonds tend to move more. Check the maturity range and the expense ratio.'},
    bills:{label:'A Treasury bill fund',text:'A fund of short-term U.S. Treasury bills. Its price usually moves little, while its income changes with short-term interest rates. It is not a bank account and is not FDIC insured.'},
    bullion:{label:'A bullion trust',text:'A trust that holds the physical metal in a vault. Its price follows the metal, minus expenses. It pays no dividends or interest, and U.S. tax rules can treat gains as collectibles.'},
    futures:{label:'A futures fund',text:'A fund that holds futures contracts instead of the commodity or currency itself. Rolling from one contract to the next can make results drift from the spot price over time, and some of these funds send a K-1 tax form.'},
    currency:{label:'A currency trust',text:'A trust that holds a foreign currency on deposit. It tends to rise when that currency strengthens against the U.S. dollar and fall when it weakens, minus expenses.'}
  };
  function exposureType(item) {
    if(item.kind==='stock') return 'business';
    if(item.exposure==='Bullion') return 'bullion';
    if(fundUsesFutures(item)) return 'futures';
    if(item.exposure==='Currency trust') return 'currency';
    if(/treasury bills/i.test(item.exposure)) return 'bills';
    if(/bond/i.test(item.exposure)) return 'bondFund';
    return 'stockFund';
  }
  function exposureNote(item) {
    const type=EXPOSURE_TYPES[exposureType(item)];
    return '<section class="exposure-note" aria-labelledby="exposure-title"><h3 id="exposure-title">What you would own</h3><p><strong>'+escapeHTML(type.label)+'.</strong> '+escapeHTML(type.text)+'</p></section>';
  }
  function renderGlossary() {
    const box=$('exposure-glossary');
    if(!box) return;
    box.innerHTML=Object.entries(EXPOSURE_TYPES).map(([key,type])=>{
      const examples=instruments.filter(item=>exposureType(item)===key).slice(0,3).map(item=>item.symbol);
      return '<div><dt>'+escapeHTML(type.label)+(examples.length?' <span class="chip-group">· e.g. '+examples.join(', ')+'</span>':'')+'</dt><dd>'+escapeHTML(type.text)+'</dd></div>';
    }).join('');
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
  let state = {theme:'gold',query:'',kind:'all',notesOnly:false,selected:'GLD',indexMode:false,indexPicks:[],compareMode:false,comparePicks:[]};
  let notes = {};
  const NOTES_KEY = 'market-forces-notes';
  function loadNotes() {
    try {
      const parsed = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      notes = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch { notes = {}; }
  }
  // Saved tickers live under their own key; the notes key above is unchanged.
  const WATCHLIST_KEY = 'market-forces-watchlist';
  let watchlist = [];
  function loadWatchlist() {
    try {
      const parsed = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
      watchlist = Array.isArray(parsed) ? [...new Set(parsed.filter(symbol => typeof symbol === 'string' && bySymbol[symbol]))] : [];
    } catch { watchlist = []; }
  }
  function saveWatchlist() {
    try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist)); } catch {}
  }
  const isSaved = symbol => watchlist.includes(symbol);
  function toggleSaved(symbol) {
    watchlist = isSaved(symbol) ? watchlist.filter(current => current !== symbol) : [...watchlist, symbol];
    saveWatchlist();
    return isSaved(symbol);
  }
  // Backup file: {app, version, exportedAt, notes, watchlist}. Restoring merges and never deletes.
  function backupData() {
    return {app:'market-forces', version:1, exportedAt:new Date().toISOString(), notes, watchlist};
  }
  function downloadBackup() {
    const blob = new Blob([JSON.stringify(backupData(), null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'market-forces-backup-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    const total = noteCount(Object.keys(notes));
    return 'Backup downloaded with ' + total + (total === 1 ? ' note' : ' notes') + ' and ' + watchlist.length + (watchlist.length === 1 ? ' saved ticker.' : ' saved tickers.');
  }
  function restoreBackup(text) {
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('That file is not valid JSON. Nothing changed.'); }
    const validNotes = data && typeof data.notes === 'object' && data.notes !== null && !Array.isArray(data.notes);
    const validList = data && Array.isArray(data.watchlist);
    if (!data || data.app !== 'market-forces' || (!validNotes && !validList)) throw new Error('That file is not a Market Forces backup. Nothing changed.');
    let addedNotes = 0;
    let addedSaved = 0;
    const nextNotes = {...notes};
    if (validNotes) {
      for (const [symbol, list] of Object.entries(data.notes)) {
        if (!/^[A-Z0-9.\-]{1,12}$/.test(symbol) || !Array.isArray(list)) continue;
        const current = Array.isArray(nextNotes[symbol]) ? [...nextNotes[symbol]] : [];
        const seen = new Set(current.map(note => note && note.id));
        const texts = new Set(current.map(note => note && (note.text + '|' + note.at)));
        for (const note of list) {
          if (!note || typeof note.text !== 'string' || !note.text.trim() || typeof note.id !== 'string') continue;
          if (seen.has(note.id) || texts.has(note.text + '|' + note.at)) continue;
          current.push({id: note.id, text: note.text.slice(0, 2000), at: typeof note.at === 'string' ? note.at : ''});
          seen.add(note.id);
          addedNotes++;
        }
        current.sort((a, b) => String(b.at).localeCompare(String(a.at)));
        if (current.length) nextNotes[symbol] = current;
      }
    }
    const nextList = [...watchlist];
    if (validList) for (const symbol of data.watchlist) if (typeof symbol === 'string' && bySymbol[symbol] && !nextList.includes(symbol)) { nextList.push(symbol); addedSaved++; }
    notes = nextNotes;
    watchlist = nextList;
    saveNotes();
    saveWatchlist();
    if (!addedNotes && !addedSaved) return 'Nothing new in that file. Everything in it is already here.';
    return 'Restored ' + addedNotes + (addedNotes === 1 ? ' note' : ' notes') + ' and ' + addedSaved + (addedSaved === 1 ? ' saved ticker.' : ' saved tickers.');
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
  function noteMatches(symbol, query) {
    const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return false;
    const text = notesFor(symbol).map(note => note.text).join(' ').toLowerCase();
    return Boolean(text) && words.every(word => text.includes(word));
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
        return matchedSymbols.has(item.symbol) || words.every(word => text.includes(word)) || noteMatches(item.symbol, query);
      });
      pool.sort((a,b) => Number(b.symbol.toLowerCase()===query)-Number(a.symbol.toLowerCase()===query));
    } else {
      pool = state.theme==='all'?instruments:state.theme==='saved'?watchlist.map(symbol=>bySymbol[symbol]).filter(Boolean):themes.find(theme=>theme.id===state.theme).symbols.map(symbol=>bySymbol[symbol]);
    }
    return pool.filter(item=>(state.kind==='all'||item.kind===state.kind)&&(!state.notesOnly||notesFor(item.symbol).length));
  }
  function renderNav() {
    const button = (id,name,mark,count,noteTotal) => '<button type="button" class="theme-button" data-theme="' + id + '" aria-pressed="' + (!state.query && state.theme===id) + '"><span class="theme-mark" aria-hidden="true">' + escapeHTML(mark) + '</span><span>' + escapeHTML(name) + '</span><span class="theme-count" aria-hidden="true">' + count + '</span>' + noteBadge(noteTotal) + '</button>';
    let html = button('all','All tickers','All',instruments.length,noteCount(instruments.map(item=>item.symbol)));
    html += button('saved','Saved tickers','★',watchlist.length,noteCount(watchlist));
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
      $('topic').innerHTML='<p class="eyebrow">Directory search</p><h2 id="topic-title">Results for “'+escapeHTML(state.query)+'”</h2><p>Matches from ticker symbols, company names, industries, markets, economic themes, and your notes.</p>'+(matches.length?'<div class="search-themes">'+matches.map(theme=>'<button type="button" data-theme="'+theme.id+'">Browse '+escapeHTML(theme.name)+'</button>').join('')+'</div>':'');
      return;
    }
    if(state.theme==='saved') {
      $('topic').innerHTML='<p class="eyebrow">Your list</p><h2 id="topic-title">Saved tickers</h2><p>'+(watchlist.length?'The '+watchlist.length+(watchlist.length===1?' ticker':' tickers')+' you saved in this browser, in the order you saved them.':'Nothing saved yet. Open a ticker and choose <strong>Save</strong> on its research panel to keep it here.')+'</p><p class="connection">Saved tickers stay in this browser only. Use <strong>Back up</strong> in the research guide to keep a copy.</p>';
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
    if(!pool.length&&state.theme==='saved'&&!state.query&&!watchlist.length) {
      $('ticker-results').innerHTML='<div class="empty"><h3>No saved tickers yet</h3><p>Choose a theme, open a ticker, then press Save.</p><button type="button" class="reset-button" data-theme="all">Browse all tickers</button></div>';
      return;
    }
    if(!pool.length) {
      $('ticker-results').innerHTML='<div class="empty"><h3>No matching tickers</h3><p>Try a shorter term, a symbol like GLD, or switch to stocks &amp; funds.</p><button type="button" class="reset-button" id="reset-search">Reset search &amp; filter</button></div>';
      return;
    }
    $('ticker-results').innerHTML='<div class="ticker-list">'+pool.map(item => {
      const picked=state.indexMode?state.indexPicks.includes(item.symbol):state.comparePicks.includes(item.symbol);
      const pickMode=state.indexMode||state.compareMode;
      const selected=pickMode?picked:item.symbol===state.selected;
      const check=state.indexMode?'<label class="index-check"><input type="checkbox" data-index-pick="'+item.symbol+'"'+(picked?' checked':'')+' aria-label="Include '+item.symbol+' in index weights"></label>':state.compareMode?'<label class="index-check"><input type="checkbox" data-compare-pick="'+item.symbol+'"'+(picked?' checked':'')+' aria-label="Compare '+item.symbol+'"></label>':'';
      const noteTotal=notesFor(item.symbol).length;
      const noteHit=state.query&&noteMatches(item.symbol,state.query)?'<span class="badge notes">Matches your note</span>':'';
      const savedChip=noteHit+(isSaved(item.symbol)?'<span class="badge saved">Saved</span>':'');
      const noteChip=savedChip+(noteTotal?'<span class="badge notes">'+noteTotal+(noteTotal===1?' note':' notes')+'</span>':'');
      const action=state.indexMode?'Include or remove '+item.symbol+' from index weights':state.compareMode?'Add or remove '+item.symbol+' in the comparison':'Select '+item.symbol+' for research links';
      return '<div class="ticker-row'+(selected?' selected':'')+'">'+check+'<button type="button" class="ticker-select" data-symbol="'+item.symbol+'" aria-pressed="'+selected+'" aria-controls="research"><span class="ticker-title"><span class="symbol">'+item.symbol+'</span><span class="ticker-name">'+escapeHTML(item.name)+'</span></span><span class="ticker-desc">'+escapeHTML(item.description)+'</span><span class="row-meta"><span class="badge '+(item.kind==='stock'?'stock':'')+'">'+(item.kind==='stock'?'Stock':'Fund')+'</span><span class="badge '+(fundUsesFutures(item)?'futures':'')+'">'+escapeHTML(item.exposure)+'</span>'+noteChip+'</span><span class="sr-only">'+action+'</span></button><a class="quick-link" href="'+stockAnalysisURL(item)+'"'+externalAttrs+' aria-label="Open '+item.symbol+' on Stock Analysis (opens in a new tab)">Stock Analysis</a></div>';
    }).join('')+'</div>';
  }
  function directoryDate(iso) {
    const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');
    if(!match) return '';
    const date=new Date(Number(match[1]),Number(match[2])-1,Number(match[3]));
    if(Number.isNaN(date.getTime())||date.getMonth()!==Number(match[2])-1) return '';
    return ' · '+new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric'}).format(date)+' directory';
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
  function themeChips(item) {
    const list=relatedThemes(item);
    if(!list.length) return '';
    const current=state.query?'':state.theme;
    return '<section class="theme-chips" aria-labelledby="chips-title"><h3 id="chips-title">'+item.symbol+' appears in '+list.length+(list.length===1?' theme':' themes')+'</h3><ul class="chip-list">'+list.map(theme=>'<li><button type="button" data-theme="'+theme.id+'"'+(theme.id===current?' aria-current="true"':'')+'>'+escapeHTML(theme.name)+' <span class="chip-group">· '+escapeHTML(theme.category||theme.group)+'</span></button></li>').join('')+'</ul></section>';
  }
  function researchActions(item) {
    const saved=isSaved(item.symbol);
    return '<div class="research-actions"><button type="button" class="action-button" data-save-ticker aria-pressed="'+saved+'">'+(saved?'★ Saved':'☆ Save')+'<span class="sr-only"> '+item.symbol+' to your saved tickers</span></button><button type="button" class="action-button" data-copy-link>Copy link</button><button type="button" class="action-button" data-compare-add>'+(state.comparePicks.includes(item.symbol)?'Open comparison':'Add to compare')+(state.comparePicks.length?' ('+state.comparePicks.length+' picked)':'')+'</button></div>';
  }
  async function copyLink(button) {
    const url=location.href;
    const done=()=>{$('status').textContent='Link to '+(state.selected||'this view')+' copied.';button.textContent='Link copied';setTimeout(()=>{if(button.isConnected)button.textContent='Copy link';},2000);};
    try { await navigator.clipboard.writeText(url); done(); return; } catch {}
    let field=button.parentElement.querySelector('.copy-fallback');
    if(!field) { field=document.createElement('input'); field.className='copy-fallback'; field.readOnly=true; field.setAttribute('aria-label','Link to this view'); button.parentElement.appendChild(field); }
    field.value=url; field.focus(); field.select();
    $('status').textContent='Copying is blocked here. The link is selected; press Command+C or Ctrl+C.';
  }
  const COMPARE_MAX=3;
  function setComparePick(symbol,on) {
    const picks=state.comparePicks.filter(current=>current!==symbol);
    if(on) {
      if(picks.length>=COMPARE_MAX) { $('status').textContent='You can compare up to '+COMPARE_MAX+' tickers. Remove one first.'; return false; }
      picks.push(symbol);
    }
    state.comparePicks=picks;
    return true;
  }
  function toggleCompare(symbol) {
    const ok=setComparePick(symbol,!state.comparePicks.includes(symbol));
    if(ok) state.selected=symbol;
    render(ok);
    document.querySelector('[data-compare-pick="'+symbol+'"]')?.focus();
    if(!ok) $('status').textContent='You can compare up to '+COMPARE_MAX+' tickers. Remove one first.';
  }
  function setMode(mode) {
    state.indexMode=mode==='index'?!state.indexMode:false;
    state.compareMode=mode==='compare'?!state.compareMode:false;
    if(state.indexMode&&!state.indexPicks.length&&state.selected) state.indexPicks=[state.selected];
    if(state.compareMode&&!state.comparePicks.length&&state.selected) state.comparePicks=[state.selected];
    pushNext=true;
    render();
  }
  function compareLinks(item) {
    const official=item.official||google(item.name+' '+item.symbol+(item.kind==='stock'?' official investor relations':' '+item.issuer+' official fund holdings fees prospectus'));
    const root=stockAnalysisURL(item);
    const rows=[['Stock Analysis',root]];
    if(item.kind==='stock') rows.push(['Financials',root+'financials/'],[item.official?'Investor relations':'Find investor relations',official]);
    else rows.push(['Holdings',(item.exposure==='Bullion'||item.exposure==='Currency trust'||fundUsesFutures(item))?official:root+'holdings/'],[item.official?'Fund issuer':'Find fund issuer',official]);
    rows.push(['Google News',googleNews(item.symbol+' '+item.name)]);
    return '<ul>'+rows.map(([title,url])=>'<li><a href="'+escapeHTML(url)+'"'+externalAttrs+'>'+escapeHTML(title)+'<span class="sr-only"> for '+item.symbol+' (opens in a new tab)</span></a></li>').join('')+'</ul>';
  }
  function renderCompare() {
    $('research').setAttribute('aria-label','Compare tickers');
    const picks=state.comparePicks.map(symbol=>bySymbol[symbol]).filter(Boolean);
    const head='<div class="research-head"><p class="eyebrow">Compare · up to '+COMPARE_MAX+'</p><h2>Side by side</h2><p class="note">Check up to '+COMPARE_MAX+' tickers in the list. Picks stay when you change themes or search. This compares structure, not performance.</p></div>';
    if(!picks.length) {$('research').innerHTML=head+'<div class="research-placeholder">Check a ticker to start a comparison. Try a fund and a company from the same theme.</div>';return;}
    const cells=fn=>picks.map(item=>'<td>'+fn(item)+'</td>').join('');
    const row=(label,fn)=>'<tr><th scope="row">'+label+'</th>'+cells(fn)+'</tr>';
    const table='<div class="compare-wrap"><table class="compare-table"><caption class="sr-only">Comparison of '+picks.map(item=>item.symbol).join(', ')+'</caption><thead><tr><td></td>'+picks.map(item=>'<th scope="col"><span class="symbol">'+item.symbol+'</span><button type="button" class="compare-remove" data-compare-remove="'+item.symbol+'">Remove<span class="sr-only"> '+item.symbol+'</span></button></th>').join('')+'</tr></thead><tbody>'
      +row('Name',item=>escapeHTML(item.name))
      +row('Type',item=>item.kind==='stock'?'Stock':'Fund')
      +row('You own',item=>escapeHTML(EXPOSURE_TYPES[exposureType(item)].label))
      +row('Exposure',item=>escapeHTML(item.exposure))
      +row('Issuer',item=>item.kind==='fund'?escapeHTML(item.issuer):'<span aria-label="Not a fund">—</span>')
      +row('Themes',item=>escapeHTML(relatedThemes(item).map(theme=>theme.name).join(', ')||'—'))
      +row('Research',compareLinks)
      +'</tbody></table></div>';
    const futures=picks.filter(fundUsesFutures);
    const risk=futures.length?'<div class="risk-note"><strong>Futures exposure:</strong> '+futures.map(item=>item.symbol).join(', ')+' '+(futures.length===1?'uses':'use')+' contracts rather than storing the commodity or currency. Read the issuer’s current documents.</div>':'';
    $('research').innerHTML=head+table+risk;
  }
  function renderResearch() {
    if(state.indexMode) {renderIndexWeights();return;}
    if(state.compareMode) {renderCompare();return;}
    $('research').setAttribute('aria-label','Selected ticker research');
    const item=bySymbol[state.selected];
    if(!item) {$('research').innerHTML='<div class="research-placeholder">Select a ticker to see its research links.</div>';return;}
    const groups=researchLinks(item);
    $('research').innerHTML='<div class="research-head"><p class="eyebrow">Selected ticker · research links</p><div class="research-title"><h2>'+item.symbol+'</h2><span class="badge '+(item.kind==='stock'?'stock':'')+'">'+(item.kind==='stock'?'Stock':'Fund')+'</span></div><p class="research-name">'+escapeHTML(item.name)+'</p>'+researchActions(item)+'<p class="note">'+escapeHTML(item.description)+'</p></div>'+exposureNote(item)+themeChips(item)+'<div class="research-groups">'+groups.map(group=>'<section class="resource-group"><h3>'+escapeHTML(group.title)+'</h3><div class="resource-links">'+group.links.map(args=>link(...args)).join('')+'</div>'+(group.title==='Sentiment & investor discussions'?'<p class="resource-note">Posts and sentiment are opinions from participating users. Coverage varies by ticker; some sources have limited data.</p>':'')+'</section>').join('')+'</div>'+(fundUsesFutures(item)?'<div class="risk-note"><strong>Futures exposure:</strong> This fund uses contracts rather than storing the commodity. Rolling contracts, expenses, and possible K-1 tax reporting can affect the result. Read the issuer’s current documents.</div>':'')+notesMarkup(item);
  }
  function render(announce=true) {
    const focusedTheme=document.activeElement?.dataset?.theme;
    const pool=visibleInstruments();
    if(!pool.some(item=>item.symbol===state.selected)) state.selected=pool[0]?.symbol||null;
    renderNav();renderTopic();renderResults(pool);renderResearch();
    if(focusedTheme) document.querySelector('.theme-button[data-theme="'+focusedTheme+'"]')?.focus({preventScroll:true});
    const modeButton=$('index-mode');
    if(modeButton) modeButton.setAttribute('aria-pressed',String(state.indexMode));
    $('compare-mode')?.setAttribute('aria-pressed',String(state.compareMode));
    syncURL();
    if(announce&&state.compareMode) $('status').textContent=state.comparePicks.length+' of '+COMPARE_MAX+' tickers in the comparison.';
    else if(announce) $('status').textContent=state.indexMode?state.indexPicks.length+' '+(state.indexPicks.length===1?'ticker':'tickers')+' selected for index weights.':pool.length+' matching tickers.'+(state.selected?' Research links shown for '+state.selected+'.':'');
  }
  function chooseTheme(id) {
    if(id!=='all'&&id!=='saved'&&!themes.some(theme=>theme.id===id)) throw new Error('Unknown theme.');
    state.theme=id;state.query='';$('search').value='';pushNext=true;render();
  }
  // Deep links: the hash holds theme, ticker, search text, and filter, e.g. #theme=gold&ticker=GLD or #q=copper&kind=fund.
  let pushNext=false;
  let appliedHash=null;
  function stateHash() {
    const params=new URLSearchParams();
    if(state.query) params.set('q',state.query); else params.set('theme',state.theme);
    if(state.kind!=='all') params.set('kind',state.kind);
    if(state.selected) params.set('ticker',state.selected);
    if(state.compareMode) params.set('compare',state.comparePicks.join(','));
    if(state.indexMode) params.set('weights',state.indexPicks.join(','));
    return '#'+params.toString().replace(/%2C/gi,',');
  }
  function syncURL() {
    const hash=stateHash();
    const push=pushNext;
    pushNext=false;
    if(hash===location.hash) {appliedHash=hash;return;}
    try { history[push&&appliedHash!==null?'pushState':'replaceState'](null,'',hash); } catch {}
    appliedHash=hash;
  }
  function applyHash() {
    const raw=location.hash.slice(1);
    if(!raw.includes('=')) return false;
    const params=new URLSearchParams(raw);
    const theme=params.get('theme');
    const kind=params.get('kind');
    const query=(params.get('q')||'').trim().slice(0,200);
    const ticker=(params.get('ticker')||'').trim().toUpperCase();
    state.query=query;
    state.theme=theme==='all'||theme==='saved'||themes.some(item=>item.id===theme)?theme:(query?state.theme:'gold');
    state.kind=['stock','fund'].includes(kind)?kind:'all';
    if(bySymbol[ticker]) state.selected=ticker;
    const compare=params.get('compare');
    state.compareMode=compare!==null;
    const weights=params.get('weights');
    const symbolList=value=>[...new Set(value.toUpperCase().split(',').map(symbol=>symbol.trim()).filter(symbol=>bySymbol[symbol]))];
    state.indexMode=weights!==null&&!state.compareMode;
    if(state.indexMode) state.indexPicks=symbolList(weights);
    if(state.compareMode) { state.indexMode=false; state.comparePicks=[...new Set(compare.toUpperCase().split(',').map(symbol=>symbol.trim()).filter(symbol=>bySymbol[symbol]))].slice(0,COMPARE_MAX); }
    $('search').value=state.query;
    $('kind-filter').value=state.kind;
    return true;
  }
  function onHistoryMove() {
    if(location.hash===appliedHash) return;
    if(!applyHash()) return;
    appliedHash=location.hash;
    render();
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
    pushNext=moveFocus;
    syncURL();
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
    catalogUpdated = catalog.updated;
    loadNotes();
    loadWatchlist();
  } catch (error) {
    $('ticker-results').innerHTML = '<div class="empty"><h3>The directory did not load</h3><p>' + escapeHTML(error.message) + '</p></div>';
    $('status').textContent = 'The directory did not load.';
    return;
  }
  $('catalog-count').textContent = instruments.length + ' tickers';
  $('catalog-date').textContent = directoryDate(catalogUpdated);
  renderGlossary();
  $('search-form').addEventListener('submit', event => event.preventDefault());
  $('search').addEventListener('input', event => { state.query = event.target.value.trim(); render(); });
  $('kind-filter').addEventListener('change', event => { state.kind = event.target.value; render(); });
  $('index-mode').addEventListener('click', () => setMode('index'));
  $('compare-mode').addEventListener('click', () => setMode('compare'));
  const backupMessage = message => { $('backup-message').textContent = message; };
  $('backup-download').addEventListener('click', () => { try { backupMessage(downloadBackup()); } catch { backupMessage('The backup could not be created in this browser.'); } });
  $('backup-restore').addEventListener('click', () => $('backup-file').click());
  $('backup-file').addEventListener('change', async event => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 2000000) { backupMessage('That file is too large to be a Market Forces backup. Nothing changed.'); return; }
    try { backupMessage(restoreBackup(await file.text())); render(false); }
    catch (error) { backupMessage(error.message); }
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
    const compareBox = event.target.closest('[data-compare-pick]');
    if (compareBox) {
      const symbol = compareBox.dataset.comparePick;
      const ok = setComparePick(symbol, compareBox.checked);
      render(ok);
      if (!ok) $('status').textContent = 'You can compare up to ' + COMPARE_MAX + ' tickers. Remove one first.';
      document.querySelector('[data-compare-pick="'+symbol+'"]')?.focus();
      return;
    }
    const box = event.target.closest('[data-index-pick]');
    if (!box) return;
    const symbol = box.dataset.indexPick;
    const picks = new Set(state.indexPicks);
    if (box.checked) picks.add(symbol); else picks.delete(symbol);
    state.indexPicks = [...picks];
    render();
    document.querySelector('[data-index-pick="'+symbol+'"]')?.focus();
  });
  document.addEventListener('keydown', event => {
    const target = event.target;
    const typing = target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) { event.preventDefault(); $('search').focus(); $('search').select(); return; }
    if (event.key === 'Escape' && target === $('search') && $('search').value) { event.preventDefault(); $('search').value = ''; state.query = ''; render(); $('status').textContent = 'Search cleared.'; }
  });
  document.addEventListener('click', event => {
    const saveButton = event.target.closest('[data-save-ticker]');
    if (saveButton && state.selected) {
      const symbol = state.selected;
      const saved = toggleSaved(symbol);
      render(false);
      $('status').textContent = symbol + (saved ? ' saved. ' : ' removed from saved tickers. ') + watchlist.length + ' saved.';
      ($('research').querySelector('[data-save-ticker]') || $('research')).focus();
      return;
    }
    const copyButton = event.target.closest('[data-copy-link]');
    if (copyButton) { copyLink(copyButton); return; }
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
    if (event.target.closest('[data-index-pick],[data-compare-pick]')) return;
    const removeButton = event.target.closest('[data-compare-remove]');
    if (removeButton) { setComparePick(removeButton.dataset.compareRemove, false); render(); ($('research').querySelector('.compare-remove') || $('compare-mode')).focus(); return; }
    const compareAdd = event.target.closest('[data-compare-add]');
    if (compareAdd && state.selected) {
      if (!state.comparePicks.includes(state.selected) && !setComparePick(state.selected, true)) { state.compareMode = true; state.indexMode = false; pushNext = true; render(false); $('status').textContent = 'You can compare up to ' + COMPARE_MAX + ' tickers. Remove one first.'; return; }
      state.compareMode = true; state.indexMode = false; pushNext = true; render(); $('compare-mode').focus(); return;
    }
    const tickerButton = event.target.closest('[data-symbol]');
    if (tickerButton) {
      if (state.indexMode) { togglePick(tickerButton.dataset.symbol); return; }
      if (state.compareMode) { toggleCompare(tickerButton.dataset.symbol); return; }
      chooseSymbol(tickerButton.dataset.symbol, true);
      return;
    }
    if (event.target.closest('#reset-search')) { state.query = ''; state.kind = 'all'; state.notesOnly = false; $('search').value = ''; $('kind-filter').value = 'all'; $('notes-only').checked = false; render(); $('search').focus(); }
  });
  // In-page anchors would replace the deep-link hash, so scroll to them instead.
  $('guide-link').addEventListener('click', event => { event.preventDefault(); $('research-guide').open = true; $('research-guide').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block: 'start'}); $('research-guide').querySelector('summary').focus({preventScroll: true}); });
  document.querySelector('.skip')?.addEventListener('click', event => { event.preventDefault(); $('main-content').focus(); });
  window.addEventListener('popstate', onHistoryMove);
  window.addEventListener('hashchange', onHistoryMove);
  applyHash();
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
