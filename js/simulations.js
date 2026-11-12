'use strict';
// Why-it-matters simulations, copied in spirit from Tool Training in the stocks trainer.
// Each one is a SAMPLE tape (bars) or table (columns) you step through. Every step says what it shows and why we look.
// Phrases in the page map to a simulation id through the structured refs below, never by parsing prose.
// SAMPLE figures are simulated. The only real figures are the dated index-weight snapshot values, which match
// data/index-weights.json. Educational, not buy or sell advice.
(function (root) {
  const bar = (label, ohlc, what, why, extra = {}) => ({label, open: ohlc[0], high: ohlc[1], low: ohlc[2], close: ohlc[3], what, why, ...extra});
  const step = (col, row, what, why) => ({col, row, what, why});

  const sims = [
    {
      kind: 'columns', id: 'wrapper',
      title: 'Same theme, four wrappers',
      goal: 'A gold theme can hold a bullion trust, a miner, a fund of miners, and a futures fund. Step through five SAMPLE months to see why each can move differently even when the metal does the same thing.',
      tape: 'SAMPLE prices, indexed to 100 · simulated',
      start: 1,
      columns: ['', 'Start', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'],
      rows: [
        ['Gold price', '100', '104', '108', '106', '110', '112'],
        ['Bullion trust', '100', '104.0', '107.9', '105.9', '109.8', '111.7'],
        ['One gold miner', '100', '109', '96', '99', '112', '118'],
        ['Fund of miners', '100', '108', '111', '107', '116', '120'],
        ['Gold futures fund', '100', '103.5', '107.0', '104.6', '108.2', '109.6']
      ],
      steps: [
        step(1, 0, 'Start: everything is set to 100, so you compare percentage moves instead of share prices.', 'Share prices differ (one ticker may be $40, another $250). Putting each wrapper on the same scale is how you see which one moved more before asking why.'),
        step(2, 2, 'Month 1: gold rises 4%. The bullion trust follows almost exactly; the miner jumps 9%.', 'A miner has fixed costs, so a higher metal price can lift its profit by more than the metal moved. That leverage is why its label says One company, not gold.'),
        step(3, 2, 'Month 2: gold keeps rising to 108, but the miner falls to 96 after a SAMPLE cost-overrun headline.', 'A business can break from its theme for its own reasons: costs, a mine problem, debt, management. That is why the research panel has news and filings, not only a gold chart.'),
        step(4, 3, 'Month 3: gold dips 2%. The fund of miners falls further, to 107, but no single company sinks it.', 'A stock fund lowers single-company risk and keeps stock-market and sector risk. Its holdings page shows how much a few large miners drive it.'),
        step(5, 4, 'Month 4: the futures fund sits below the bullion trust even though both follow gold.', 'A futures fund holds contracts, not metal. Rolling them and fees can make it drift from the price, and only the issuer’s documents explain by how much.'),
        step(6, 1, 'Month 5: gold is up 12%. The trust is up about 11.7%, the miner 18%, the fund of miners 20%, and the futures fund 9.6%.', 'Same theme, four outcomes. Reading the wrapper first tells you which question to research next: the metal, one business, a basket, or a contract.')
      ],
      takeaway: 'The theme tells you what to watch. The wrapper (trust, company, stock fund, or futures fund) decides what you own and how it can move.'
    },
    {
      kind: 'columns', id: 'futures-roll',
      title: 'Why a futures fund can lag the price it follows',
      goal: 'A futures fund does not store the commodity. It owns contracts and swaps each expiring one for a later one. Step through six SAMPLE months to see how that roll can leave the fund behind even when the spot price ends flat.',
      tape: 'SAMPLE crude prices and fund value · simulated',
      start: 1,
      columns: ['', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
      rows: [
        ['Spot price', '70.00', '72.00', '70.00', '71.00', '69.00', '70.00'],
        ['Contract the fund sells', '—', '72.00', '70.00', '71.00', '69.00', '70.00'],
        ['Next contract it buys', '71.50', '73.40', '71.40', '72.40', '70.40', '—'],
        ['Fund value (start 100)', '100.0', '100.7', '96.0', '95.5', '91.0', '90.5']
      ],
      steps: [
        step(1, 2, 'Month 1: spot crude is 70. The fund buys next month’s contract at 71.50, above spot.', 'When later contracts cost more than spot (contango), every roll buys high. That gap is the first thing to look for on a futures fund’s issuer page.'),
        step(2, 3, 'Month 2: spot rises to 72 and the contract ends there. Spot gained 2.9%; the fund gained only 0.7%.', 'The fund earns the move from its purchase price (71.50) to where the contract ends (72), not the move from 70. That shortfall is the roll cost.'),
        step(3, 2, 'Month 3: spot falls back to 70, and the fund rolls again into a 71.40 contract.', 'The roll happens every month whether the market is up or down. A short chart can hide it; a longer comparison with spot shows it.'),
        step(4, 3, 'Month 4: spot (71) is above where it started, yet the fund is down to 95.5.', 'This is the drift the exposure note warns about. Comparing the fund’s total return with the spot price over the same months is how you measure it.'),
        step(5, 3, 'Month 5: spot slips to 69 and the fund falls to 91.0.', 'Price losses and roll costs add up. A futures fund can be useful for short-term exposure, but it is a different product from storing the commodity.'),
        step(6, 3, 'Month 6: spot is back to 70, flat over the window. The fund is down about 9.5%.', 'Flat spot, lower fund. Before treating a futures fund as a stand-in for the commodity, read its roll method, its fees, and its tax form (some send a K-1).')
      ],
      takeaway: 'A futures fund follows contracts, not the spot price. When later contracts cost more, the roll can cost money every month. Read the issuer’s current documents.'
    },
    {
      kind: 'bars', id: 'producer',
      title: 'A business is not its commodity',
      goal: 'A theme links a commodity to companies, but a company’s shares price the whole business. Step through six SAMPLE monthly bars of an oil producer, with the crude price beside each bar, to see where the link holds and where it breaks.',
      tape: 'SAMPLE oil producer · monthly bars · simulated',
      start: 2,
      bars: [
        bar('Jan', [50, 52, 49, 51], 'January: crude is 70 and the SAMPLE producer closes at 51.', 'Write down both the commodity and the stock first. You are about to test whether one really tracks the other.', {readout: 'Crude 70'}),
        bar('Feb', [51, 55, 50, 54], 'February: crude rises about 6% and the stock rises about 6%, to 54.', 'Months like this make the link look one-to-one. One month is not a relationship, so keep stepping.', {readout: 'Crude 74'}),
        bar('Mar', [54, 55, 47, 48], 'March: crude keeps rising, but the stock falls to 48 after a SAMPLE refinery-outage headline (N).', 'A company has its own events: outages, project costs, debt. That is why the research panel has news and filings links, not only a commodity chart.', {mark: 'news', readout: 'Crude 76'}),
        bar('Apr', [48, 50, 44, 45], 'April: the stock market sells off. The stock drifts to 45 while crude barely moves.', 'Shares also move with the whole stock market and investor mood. An oil company is partly an oil bet and partly a stock-market bet.', {readout: 'Crude 75'}),
        bar('May', [45, 51, 44, 50], 'May: earnings (E). Crude is lower, yet the stock jumps to 50 on higher output and a dividend increase.', 'Results and guidance can matter more than that month’s commodity price. The Earnings & guidance link is where you read what the company said.', {mark: 'earnings', readout: 'Crude 72'}),
        bar('Jun', [50, 53, 49, 52], 'June: crude falls to 68 and the stock closes at 52.', 'Over the window crude fell from 70 to 68 (−3%) while the stock rose from 51 to 52 (+2%). The theme is real but loose: a starting point for research, not a price tracker.', {readout: 'Crude 68'})
      ],
      takeaway: 'A producer’s shares follow the business and the stock market as well as the commodity. Use the theme to choose what to watch, then read the company.'
    },
    {
      kind: 'columns', id: 'margin',
      title: 'Selling price minus input cost: the margin',
      goal: 'Resin, fertilizer, and industrial companies sell a product made from inputs such as natural gas. Step through five SAMPLE quarters to see why the gap between selling price and input cost can matter more than either price alone.',
      tape: 'SAMPLE producer · per ton and $ millions · simulated',
      start: 1,
      columns: ['', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
      rows: [
        ['Selling price per ton', '1,000', '1,100', '1,100', '950', '1,000'],
        ['Input cost per ton', '600', '800', '650', '500', '700'],
        ['Margin per ton', '400', '300', '450', '450', '300'],
        ['Plant operating rate', '85%', '85%', '90%', '70%', '88%'],
        ['Gross profit ($M)', '340', '255', '405', '315', '264']
      ],
      steps: [
        step(1, 2, 'Q1: the product sells for 1,000 a ton and its inputs cost 600, leaving a 400 margin.', 'Producers are paid on the spread, not the headline price. Writing the spread down is the habit; the income statement is where you check it.'),
        step(2, 0, 'Q2: the selling price rises 10% to 1,100, but input costs jump to 800, so the margin shrinks to 300.', 'A rising product price can still mean lower profit. When a headline says resin or fertilizer prices are up, ask what feedstock or gas costs did.'),
        step(3, 2, 'Q3: same selling price, inputs fall to 650, the margin widens to 450, and the plant runs at 90%.', 'Cheaper inputs helped more than any price rise did. That is why the theme’s connection names feedstock and gas costs, not only the product price.'),
        step(4, 3, 'Q4: the margin is still 450, but demand drops and the plant runs at only 70%.', 'Margin is per ton; profit also depends on how many tons you sell. Operating rates and demand from packaging, farming, or construction finish the picture.'),
        step(5, 4, 'Q5: the price is 1,000 again, as in Q1, yet gross profit is 264 instead of 340 because inputs cost more.', 'Same product price, very different profit. Before reading a commodity chart as a company forecast, open the income statement and the company’s guidance.')
      ],
      takeaway: 'For producers, watch the spread between what they sell and what they buy, and how much they sell. A price headline alone does not tell you the profit.'
    },
    {
      kind: 'columns', id: 'duration',
      title: 'Why longer bond funds move more',
      goal: 'Bond funds hold loans that pay fixed interest, so their prices react when yields change. Step through SAMPLE Treasury funds to see why a T-bill fund barely moves while a long-term bond fund can swing a lot.',
      tape: 'SAMPLE funds · rough duration math · simulated',
      start: 1,
      columns: ['', 'Bonds repay in', 'Duration', 'Yields +1 point', 'Yields −1 point', 'Income'],
      rows: [
        ['T-bill fund', 'Under 1 year', 'About 0.1', 'About −0.1%', 'About +0.1%', 'Resets within weeks'],
        ['Short-term bond fund', '1–3 years', 'About 2', 'About −2%', 'About +2%', 'Resets in a few years'],
        ['Intermediate bond fund', '7–10 years', 'About 7', 'About −7%', 'About +7%', 'Locked in longer'],
        ['Long-term bond fund', '20+ years', 'About 17', 'About −17%', 'About +17%', 'Locked in for decades']
      ],
      steps: [
        step(1, 0, 'Each row is a SAMPLE Treasury fund. The first difference is how long its bonds have until they repay.', 'Maturity is the fund’s time horizon. The fund’s page lists it, and it is the first thing to check before calling any bond fund safe.'),
        step(2, 3, 'Duration turns maturity into a sensitivity: roughly the percent price change for a 1-point change in yields.', 'It is a rule of thumb, not a promise, but it lets you compare funds quickly. Look for it on the issuer’s fact sheet.'),
        step(3, 3, 'If yields rise 1 point, the long fund falls roughly 17%; the T-bill fund barely moves.', 'Bond prices move opposite to yields, and longer bonds move more. That is why rate news matters far more for a long fund than for a short one.'),
        step(4, 3, 'If yields fall 1 point, the same math runs in reverse: roughly +17% for the long fund.', 'Duration cuts both ways. Owning a long fund is a view on long-term yields, whether you meant it or not.'),
        step(5, 0, 'Income: the T-bill fund’s payout resets quickly to new rates, while the long fund locks its rate in for years.', 'A T-bill fund trades price stability for income that changes. Neither is a bank account; decide what you want the fund to do before picking one.')
      ],
      takeaway: 'Duration is the quick check: about how much a bond fund’s price moves when yields change by 1 point. Longer duration means bigger swings both ways.'
    },
    {
      kind: 'bars', id: 'yields',
      title: 'Yields up, bond prices down, even after a rate cut',
      goal: 'A long-term bond fund’s price moves opposite to long-term yields. Step through SAMPLE monthly bars with the 10-year yield beside each, including a jobs report and a rate cut, to see why the headline is not the same as the move.',
      tape: 'SAMPLE long-term bond fund · monthly bars · simulated',
      start: 2,
      bars: [
        bar('Jan', [90, 91, 89, 90.5], 'January: the SAMPLE fund closes at 90.50 with the 10-year yield at 4.20%.', 'Put the yield beside the price. A bond-fund chart makes more sense read against yields than on its own.', {readout: '10y 4.20%'}),
        bar('Feb', [90.5, 93, 90, 92.5], 'February: the yield falls to 4.05% and the fund rises to 92.50.', 'Opposite directions: lower yields, higher bond prices. This is the relationship the theme’s connection describes.', {readout: '10y 4.05%'}),
        bar('Mar', [92.5, 93, 88, 88.5], 'March: a strong SAMPLE jobs report (N) lifts the yield to 4.35%, and the fund drops to 88.50.', 'Good economic news can raise rate expectations and push bond prices down. A headline that sounds positive can be negative for this fund.', {mark: 'news', readout: '10y 4.35%'}),
        bar('Apr', [88.5, 89.5, 87, 88], 'April: a quiet month. The yield edges up and the fund drifts lower.', 'Small yield moves add up for a long fund because of its long duration. Stay with what each bar shows instead of guessing a trend.', {readout: '10y 4.40%'}),
        bar('May', [88, 90, 85, 85.5], 'May: the central bank cuts its short-term rate (N), yet long yields rise to 4.55% on inflation worries and the fund falls to 85.50.', 'The central bank sets short-term rates; investors set long yields. A rate cut does not guarantee that a long bond fund rises.', {mark: 'news', readout: '10y 4.55%'}),
        bar('Jun', [85.5, 89, 85, 88.5], 'June: long yields ease to 4.30% and the fund recovers to 88.50.', 'Over the window the fund is down even though rates were cut. Check which yield matches the fund you hold (short or long) before reacting to rate news.', {readout: '10y 4.30%'})
      ],
      takeaway: 'For a bond fund, watch the yield that matches its maturity. Rate-cut and jobs headlines matter only through what they do to that yield.'
    },
    {
      kind: 'bars', id: 'gold-rates',
      title: 'Gold, real interest rates, and the dollar',
      goal: 'Gold pays no interest, so investors often compare it with real (after-inflation) interest rates and the dollar. Step through SAMPLE monthly bars of a bullion trust with both readings beside each bar, and see where the link holds and where it breaks.',
      tape: 'SAMPLE bullion trust · monthly bars · simulated',
      start: 2,
      bars: [
        bar('Jan', [180, 184, 178, 182], 'January: the SAMPLE trust closes at 182, with real yields at 1.8% and a steady dollar.', 'Record the backdrop first. You will compare each later bar with these two readings, not with what you expect.', {readout: 'Real 1.8% · $ steady'}),
        bar('Feb', [182, 190, 181, 189], 'February: real yields fall and the dollar weakens; the trust rises to 189.', 'Lower real yields make a no-interest asset cheaper to hold, and a weaker dollar makes gold cheaper for other buyers. This is the textbook link.', {readout: 'Real 1.5% · $ weaker'}),
        bar('Mar', [189, 191, 183, 185], 'March: real yields tick up and the dollar firms; the trust slips to 185.', 'Same link, opposite direction. Two months that agree with a story are still not proof, so keep stepping.', {readout: 'Real 1.7% · $ stronger'}),
        bar('Apr', [185, 197, 184, 195], 'April: real yields rise and the dollar strengthens, yet the trust jumps to 195 on SAMPLE central-bank buying and a risk scare (N).', 'Other forces, such as central-bank demand and fear, can overpower rates. That is why the theme’s connection lists several drivers, not one.', {mark: 'news', readout: 'Real 1.9% · $ stronger'}),
        bar('May', [195, 198, 192, 196], 'May: rates and the dollar sit still, and the trust holds near 196.', 'A quiet backdrop makes a quiet bar. Do not invent a cause for small moves; that is where research turns into storytelling.', {readout: 'Real 1.9% · $ steady'}),
        bar('Jun', [196, 197, 186, 188], 'June: real yields climb to 2.1% and the trust falls to 188.', 'The link shows up again. The habit is to check rates, the dollar, and the news each time, and note which one explains the bar, if any.', {readout: 'Real 2.1% · $ stronger'})
      ],
      takeaway: 'Real rates and the dollar are useful gold checks, not a formula. Some months another driver wins; write down which one.'
    },
    {
      kind: 'columns', id: 'dollar',
      title: 'What moves a currency fund',
      goal: 'Currency funds turn exchange rates into a ticker. Step through five SAMPLE months to see why a dollar fund and a euro trust move in opposite directions, and why a basket is not every currency.',
      tape: 'SAMPLE rate gap and funds, indexed to 100 · simulated',
      start: 1,
      columns: ['', 'Start', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'],
      rows: [
        ['Rate gap (U.S. minus Europe)', '1.5 pts', '2.0 pts', '2.0 pts', '1.0 pt', '1.0 pt', '0.5 pt'],
        ['Dollar basket fund', '100', '102', '103', '100', '99', '97'],
        ['Euro trust', '100', '98', '97', '100.5', '101', '103'],
        ['Yen trust', '100', '99', '103', '101', '100', '102'],
        ['Foreign stock fund, in $', '100', '99', '98', '102', '103', '105']
      ],
      steps: [
        step(1, 0, 'Start: U.S. short-term rates are 1.5 points above Europe’s. Every fund is indexed to 100.', 'Rate differences are one of the main things that pull money between currencies. Write the gap down before reading any currency chart.'),
        step(2, 1, 'Month 1: the gap widens to 2 points. The dollar fund rises to 102 and the euro trust falls to 98.', 'Higher U.S. rates can draw money into dollars. A euro trust is the mirror image: it gains only when the euro strengthens against the dollar.'),
        step(3, 3, 'Month 2: the dollar fund rises again, but the yen trust jumps to 103 on a SAMPLE risk scare.', 'The yen can move on risk appetite, not only on rates. Each currency trust is one currency’s story, which is why the directory lists them separately.'),
        step(4, 1, 'Month 3: the gap narrows to 1 point and the dollar fund falls back to 100.', 'A dollar fund follows a defined basket that leans heavily on the euro. Check the issuer’s basket before assuming it tracks every currency.'),
        step(5, 4, 'Month 4: a foreign stock fund priced in dollars rises, partly because the euro strengthened.', 'Owning foreign stocks means owning their currency too. Part of a developed- or emerging-market fund’s result can be the exchange rate, not the companies.'),
        step(6, 2, 'Month 5: the gap is down to 0.5 points. The euro trust is up 3% and the dollar fund down 3%.', 'Rates explained much of this window, but not every month. Use the gap as a first check, then read what else was in the news.')
      ],
      takeaway: 'A dollar fund rises when its basket of currencies weakens against the dollar. Rate gaps and risk mood are the first checks; a basket is not every currency.'
    },
    {
      kind: 'columns', id: 'inflation',
      title: 'Inflation reports: three wrappers, three reactions',
      goal: 'Inflation themes mix inflation-linked bonds, commodities, and businesses. Step through five SAMPLE inflation reports to see why each reacts differently, and why none is a guaranteed hedge over a few months.',
      tape: 'SAMPLE monthly reports and fund moves · simulated',
      start: 1,
      columns: ['', 'Report 1', 'Report 2', 'Report 3', 'Report 4', 'Report 5'],
      rows: [
        ['Inflation vs expected', 'As expected', 'Hotter', 'Hotter', 'Cooler', 'Hotter'],
        ['Real yields', 'Flat', 'Up', 'Up a lot', 'Down', 'Flat'],
        ['Inflation-linked bond fund', '+0.2%', '−0.5%', '−2.0%', '+1.5%', '+0.8%'],
        ['Broad commodity fund', '+0.5%', '+3.0%', '−1.5%', '−2.0%', '+2.5%'],
        ['Energy stock fund', '+1.0%', '+4.0%', '−3.0%', '−1.0%', '+2.0%']
      ],
      steps: [
        step(1, 0, 'Report 1: inflation comes in as expected, and little happens anywhere.', 'Markets react to surprises, not to inflation itself. The first catalyst question is always: what was expected?'),
        step(2, 2, 'Report 2: a hotter-than-expected report. Commodities and energy stocks rise; the inflation-linked bond fund dips.', 'Inflation-linked bonds add inflation to their principal, but their price still falls when real yields rise. The word inflation in a name does not remove rate risk.'),
        step(3, 1, 'Report 3: hotter again, but real yields jump on expected rate hikes. All three fall.', 'When investors expect the central bank to fight inflation, higher rates can hit everything at once. This is the starting-prices-and-rates caveat in the theme.'),
        step(4, 2, 'Report 4: a cooler report. Real yields fall and the inflation-linked fund rises the most.', 'The fund that lost on a hot report gains on a cool one, because yields moved. Track the yield, not only the headline number.'),
        step(5, 4, 'Report 5: hotter, with flat yields. Commodities and energy rise again.', 'Across five reports each wrapper won some months and lost others. Use the theme to decide what to read, then check each fund’s holdings and duration.')
      ],
      takeaway: 'Inflation surprises, real yields, and what a fund holds decide the move. None of these is a guaranteed short-term inflation hedge.'
    },
    {
      kind: 'bars', id: 'earnings',
      title: 'Earnings week: a catalyst can already be priced in',
      goal: 'An earnings report is a scheduled catalyst. Step through six SAMPLE weekly bars around one report to see why you check the date, the guidance, and what was already expected.',
      tape: 'SAMPLE company · weekly bars · simulated',
      start: 2,
      bars: [
        bar('W1', [40, 41, 39.5, 40.5], 'Week 1: a quiet week near 40.', 'Before a catalyst, note the starting point and the report date. The Earnings & guidance link is how you find the date ahead of time.'),
        bar('W2', [40.5, 43, 40, 42.5], 'Week 2: shares climb to 42.50 as investors expect a strong quarter.', 'A run-up before the report means good news may already be in the price. That is what “a good story can already be priced in” means.'),
        bar('W3', [42.5, 44, 42, 43.8], 'Week 3: more gains into the report, closing at 43.80.', 'Expectations rise with the price. The bar to clear is now what investors hope for, not last year’s result.'),
        bar('W4', [43.8, 44.5, 38, 39], 'Week 4: earnings (E). Profit beats estimates, but next quarter’s guidance is cut, and shares fall to 39.', 'Guidance is about the future, and the future is what the price weighs. Read the report and the outlook, not just the beat-or-miss headline.', {mark: 'earnings'}),
        bar('W5', [39, 40, 37.5, 38.2], 'Week 5: analysts lower their estimates and shares drift to 38.20.', 'Estimate changes after a report can keep moving the price. The Analyst views link shows how forecasts shifted.'),
        bar('W6', [38.2, 40.5, 38, 40], 'Week 6: shares settle near 40, back where they started.', 'The run-up and the drop both happened around one event. Knowing the date and the expectations beforehand is the research habit; predicting the reaction is not.')
      ],
      takeaway: 'Check when the next report is, what is expected, and what guidance says. A beat can still fall if the good news was already priced in.'
    },
    {
      kind: 'columns', id: 'financials',
      title: 'Reading Financials columns: dates and one-time items',
      goal: 'The Financials pages show columns of results by period. Step through a SAMPLE income statement to see why you check each column’s period, look for one-time items, and compare more than one year.',
      tape: 'SAMPLE company income statement · $ millions · simulated',
      start: 1,
      columns: ['', 'FY 2023', 'FY 2024', 'FY 2025', 'TTM'],
      rows: [
        ['Revenue', '1,000', '1,080', '1,150', '1,190'],
        ['Profit before one-time items', '110', '118', '105', '120'],
        ['One-time items', '0', '0', '−60 write-down', '+40 asset sale'],
        ['Net income', '110', '118', '45', '160']
      ],
      steps: [
        step(1, 0, 'FY 2023: revenue of 1,000 and net income of 110. This is the oldest column.', 'Start with the period label on each column. A fiscal year may not match the calendar year, and sites put the newest column at one end.'),
        step(2, 0, 'FY 2024: revenue grows 8% and profit grows with it.', 'Two years let you see a direction. One column on its own cannot tell you whether a number is normal for this business.'),
        step(3, 3, 'FY 2025: revenue grows again, but net income falls to 45.', 'A sudden drop is a prompt to look for the cause before judging the business. Look at the one-time items row.'),
        step(3, 2, 'The cause: a 60 million plant write-down, a one-time charge. Before it, profit was 105.', 'One-time items can make a year look much worse, or better, than the business ran. The SEC filings explain them in the notes.'),
        step(4, 3, 'TTM (trailing twelve months, the last four quarters): net income jumps to 160.', 'TTM is more recent than the last fiscal year, but it can hold a one-off too. Here a 40 million gain from selling an asset inflates it.'),
        step(4, 1, 'Without one-time items, profit went 110, 118, 105, 120: steady, modest growth.', 'That steady line is what the business did. A P/E built on 45 or on 160 would mislead you in opposite directions.')
      ],
      takeaway: 'Read the column dates, compare several years, and set aside one-time items before you judge profit or a ratio built on it.'
    },
    {
      kind: 'columns', id: 'fees',
      title: 'How a small fee compounds',
      goal: 'A fund’s expense ratio comes out every year. Step through SAMPLE years to see how two funds holding the same thing drift apart only because of their fees.',
      tape: 'SAMPLE $10,000 in two funds · same 6% yearly return before fees · simulated',
      start: 1,
      columns: ['', 'Start', 'Year 1', 'Year 5', 'Year 10', 'Year 20'],
      rows: [
        ['Fund A · 0.05% fee', '$10,000', '$10,595', '$13,351', '$17,824', '$31,770'],
        ['Fund B · 0.75% fee', '$10,000', '$10,525', '$12,915', '$16,681', '$27,825'],
        ['Gap', '$0', '$70', '$435', '$1,143', '$3,945']
      ],
      steps: [
        step(1, 0, 'Start: $10,000 in each SAMPLE fund. Same holdings, same 6% yearly return before fees.', 'Holding everything else equal isolates the one number you can compare on any fund page: the expense ratio.'),
        step(2, 2, 'Year 1: the gap is $70.', 'Small in one year, which is why fees are easy to ignore. The habit is to multiply by the years you plan to hold.'),
        step(3, 2, 'Year 5: the gap is $435.', 'Fees compound: money paid in fees no longer earns a return, year after year.'),
        step(4, 1, 'Year 10: Fund B has $16,681 against Fund A’s $17,824.', 'Two funds can follow the same index at different costs. The Fees & structure link shows each fund’s expense ratio so you can compare like with like.'),
        step(5, 2, 'Year 20: the gap is $3,945, almost 40% of the original $10,000.', 'Returns are never guaranteed; fees are. That is why the research checklist lists fees beside holdings.')
      ],
      takeaway: 'Expense ratios look tiny but compound. When two funds hold the same thing, the cheaper one keeps more of the return.'
    },
    {
      kind: 'columns', id: 'concentration',
      title: 'Index weights: a few names can drive the fund',
      goal: 'An index fund spreads money across hundreds of companies, but not evenly. Step through the five largest S&P 500 weights among this directory’s tickers in the Oct 8, 2026 snapshot (an ETF-based estimate), then a SAMPLE week, to see why a few names can move the whole index.',
      tape: 'Weights: Oct 8, 2026 snapshot stored on this page · moves: SAMPLE, simulated',
      start: 1,
      columns: ['', 'Weight', 'Running total', 'SAMPLE move', 'Effect on index'],
      rows: [
        ['NVDA', '8.34%', '8.34%', '−10%', '−0.83 pts'],
        ['AAPL', '7.43%', '15.77%', '−10%', '−0.74 pts'],
        ['MSFT', '5.80%', '21.57%', '−10%', '−0.58 pts'],
        ['AMZN', '3.73%', '25.30%', '−10%', '−0.37 pts'],
        ['GOOGL', '3.05%', '28.35%', '−10%', '−0.31 pts'],
        ['Everything else', '71.65%', '100%', '+1%', '+0.72 pts'],
        ['Index result', '', '', '', 'About −2.1%']
      ],
      steps: [
        step(1, 0, 'NVDA is 8.34% of the S&P 500 in the Oct 8, 2026 snapshot stored on this page.', 'A weight is the share of the fund’s money in one company. One stock out of about 500 carrying over 8% is the first sign the index is not evenly spread.'),
        step(2, 4, 'Add AAPL, MSFT, AMZN, and GOOGL: these five directory tickers make up 28.35% of the index.', 'The running total is the concentration check. More than a quarter of an S&P 500 fund rides on five businesses.'),
        step(3, 0, 'Now a SAMPLE week: those five each fall 10%, and every other company rises 1%.', 'This is a what-if, not a forecast. It isolates what weight alone does to the result.'),
        step(4, 0, 'NVDA’s 10% drop alone takes about 0.83 points off the index.', 'Effect on the index = weight × move. That one multiplication is why the largest holdings matter most.'),
        step(4, 5, 'All the other companies rising 1% adds back only about 0.72 points.', 'Most of the index went up, yet the total goes down. A falling index can hide many rising companies, and a rising index can leave many behind.'),
        step(4, 6, 'Result: the SAMPLE index falls about 2.1%.', 'Before treating a large-cap or total-market fund as “the whole market”, check the top weights in Index weights or in the fund’s holdings.')
      ],
      takeaway: 'Index funds are weighted by company size, so the biggest holdings drive the result. Check the top weights and their running total; the snapshot is dated and changes.'
    },
    {
      kind: 'columns', id: 'holdings',
      title: 'What a theme fund actually owns',
      goal: 'A theme fund’s name tells you the idea; its holdings tell you the exposure. Step through a SAMPLE uranium-themed fund’s top five holdings to see why you open the holdings page before trusting the label.',
      tape: 'SAMPLE theme fund holdings · simulated',
      start: 1,
      columns: ['', 'Weight', 'What the business does', 'Direct theme exposure?'],
      rows: [
        ['Holding 1 · miner', '14%', 'Mines and sells uranium', 'Yes'],
        ['Holding 2 · miner', '10%', 'Mines uranium and gold', 'Partly'],
        ['Holding 3 · fuel trust', '9%', 'Holds physical uranium', 'Yes'],
        ['Holding 4 · utility', '6%', 'Runs power plants, some nuclear', 'Partly'],
        ['Holding 5 · engineering', '5%', 'Builds plants of many kinds', 'Little'],
        ['Top five', '44%', '', '23% fully direct']
      ],
      steps: [
        step(1, 0, 'The largest SAMPLE holding is 14% of the fund.', 'Start with the weights. A theme fund often holds far fewer companies than a broad index, so its top names matter even more.'),
        step(1, 5, 'The top five add up to 44%.', 'Nearly half the fund rides on five businesses. That concentration is a risk you only see on the holdings page.'),
        step(2, 1, 'Holding 2 mines uranium and gold.', 'A company can sit in a theme fund for part of its business. Read what each top holding does, not only its name.'),
        step(2, 4, 'Holding 5 builds plants of many kinds; nuclear is a small part of its work.', 'Index rules can include businesses with loose links to the theme. That is how a uranium fund ends up partly an engineering bet.'),
        step(3, 5, 'Only about 23% of the fund is fully direct uranium exposure.', 'This is the check the catalog asks for: read the holdings to see how much exposure is the theme itself. The index rules and fees sit on the same pages.')
      ],
      takeaway: 'Open Holdings before trusting a fund’s name. Check the top weights, what each business does, and how much of the fund is the theme itself.'
    },
    {
      kind: 'bars', id: 'sentiment',
      title: 'A social-media surge, then the primary source',
      goal: 'Sentiment feeds show what posters think right now. Step through five SAMPLE daily bars around a rumor to see why you cross-check the conversation with filings, press releases, and news.',
      tape: 'SAMPLE small company · daily bars · simulated',
      start: 2,
      bars: [
        bar('Mon', [12, 12.3, 11.8, 12.1], 'Monday: a quiet day near 12, with few posts.', 'Record the baseline: the price, how much people are posting, and whether there is any real news. You need it to judge the surge.', {readout: 'Posts: few'}),
        bar('Tue', [12.1, 14.5, 12, 14.2], 'Tuesday: posts surge on a rumor (N) of a big contract, and shares jump to 14.20.', 'A rumor is not an announcement. Check Press releases and SEC filings: is there a primary source, or only posts?', {mark: 'news', readout: 'Posts: surging'}),
        bar('Wed', [14.2, 16, 13.8, 15.6], 'Wednesday: the feed is overwhelmingly bullish and shares touch 16.', 'Sentiment reflects the people posting, not every investor. A one-sided feed can mean late buyers are chasing a move.', {readout: 'Posts: 90% bullish'}),
        bar('Thu', [15.6, 15.8, 12.5, 12.9], 'Thursday: the company says no contract has been signed (N), and shares fall to 12.90.', 'The primary source settled the question. That is why the research panel puts filings and press releases before the sentiment links.', {mark: 'news', readout: 'Posts: falling'}),
        bar('Fri', [12.9, 13.2, 11.6, 11.9], 'Friday: posts fade and shares close at 11.90, below Monday.', 'People who bought on the excitement are now at a loss. Cross-checking takes minutes; skipping it can cost far more.', {readout: 'Posts: few'})
      ],
      takeaway: 'Use sentiment to find what people are talking about, then confirm it in filings, press releases, and reliable news before you act.'
    },
    {
      kind: 'bars', id: 'defensive',
      title: 'Steady demand is not a steady price',
      goal: 'Staples and utilities are often researched for a slowdown because demand for them is steadier. Step through SAMPLE monthly bars of a staples fund, with the 10-year yield beside each, to see why steady demand does not mean a steady price.',
      tape: 'SAMPLE consumer staples fund · monthly bars · simulated',
      start: 2,
      bars: [
        bar('Jan', [75, 76, 74, 75.5], 'January: the SAMPLE fund closes at 75.50.', 'Start with the price and the yield. Defensive funds are often compared with bonds, so yields belong beside the chart.', {readout: '10y 4.0%'}),
        bar('Feb', [75.5, 78, 75, 77.5], 'February: a weak SAMPLE growth report (N). Investors move into staples and the fund rises to 77.50.', 'This is the slowdown idea at work: steady products look attractive when the economy cools.', {mark: 'news', readout: '10y 3.9%'}),
        bar('Mar', [77.5, 80, 77, 79.5], 'March: more buying lifts the fund to 79.50. Its valuation is now high compared with its own history.', 'A popular safe haven can become expensive. A high starting price is one of the risks the theme names.', {readout: '10y 3.8%'}),
        bar('Apr', [79.5, 80, 74, 74.5], 'April: the yield jumps to 4.3% and the fund falls to 74.50, with no change in demand.', 'When bonds pay more, steady dividend payers can lose appeal. Staples and utilities can move with yields, not only with the economy.', {readout: '10y 4.3%'}),
        bar('May', [74.5, 75, 70, 70.8], 'May: a large holding warns that costs are squeezing its margins (N), and the fund drops to 70.80.', 'Steadier demand does not stop cost pressure or company problems. Check the fund’s top holdings and their news.', {mark: 'news', readout: '10y 4.3%'}),
        bar('Jun', [70.8, 73, 70.5, 72.5], 'June: the fund recovers to 72.50, still below where it started.', 'Defensive does not mean it cannot lose money. Write down what you expect a fund to protect against, then check yields, valuation, and holdings.', {readout: '10y 4.1%'})
      ],
      takeaway: 'Slowdown sectors can hold up better in some weak economies, but yields, valuations, and company costs can still push them lower.'
    },
    {
      kind: 'columns', id: 'ai',
      title: 'A strong story, and the price you pay for it',
      goal: 'The AI and chip themes point to companies selling computing hardware. Step through five SAMPLE quarters of a chip company and a chip fund to see why you check growth, margins, and the price already paid, not only the story.',
      tape: 'SAMPLE chip company and chip fund · simulated',
      start: 1,
      columns: ['', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
      rows: [
        ['Revenue growth vs a year ago', '+20%', '+45%', '+60%', '+35%', '+15%'],
        ['Gross margin', '55%', '60%', '62%', '58%', '52%'],
        ['Earnings per share (yearly)', '4.00', '4.50', '5.00', '5.50', '5.50'],
        ['Price / earnings (P/E)', '25', '33', '40', '31', '23'],
        ['Share price', '100', '150', '200', '170', '125'],
        ['Chip fund (basket)', '100', '125', '145', '135', '120']
      ],
      steps: [
        step(1, 0, 'Q1: revenue grows 20% and the shares trade at 25 times earnings.', 'Write down growth, margin, and the price paid for each dollar of earnings (P/E). The story is the fourth thing to check, not the first.'),
        step(2, 3, 'Q2: demand lifts growth to 45%. Investors now pay 33 times earnings, and the price reaches 150.', 'Part of the rise is higher earnings and part is a higher multiple. The multiple is investors’ expectation, and it can shrink.'),
        step(3, 3, 'Q3: growth peaks at 60%, the P/E reaches 40, and the price has doubled since Q1.', 'Now the price assumes strong growth continues. Check guidance and the spending plans of the customers buying the chips.'),
        step(4, 0, 'Q4: earnings still rise, but growth slows to 35% and margins dip. The price falls to 170.', 'Earnings went up and the stock went down. Slowing growth and competition can cut the multiple faster than profit grows.'),
        step(5, 3, 'Q5: growth slows to 15% and the P/E falls to about 23. The price is 125, though earnings are higher than in Q1.', 'Investors paid less for future profits. That is the risk the growth and AI themes warn about.'),
        step(5, 5, 'The SAMPLE chip fund rose less and fell less than the single company.', 'A basket spreads company risk, such as competition or one bad quarter, across many chip makers. It does not remove industry or valuation risk.')
      ],
      takeaway: 'A theme is a reason to research, not proof of profit. Check growth, margins, guidance, and how much you are paying (P/E), for the company and for the basket.'
    },
    {
      kind: 'bars', id: 'dividend',
      title: 'Ex-dividend day, then a dividend cut',
      goal: 'A dividend moves cash from the company to you; on its own it does not add value. Step through five SAMPLE weekly bars around an ex-dividend date and a later cut.',
      tape: 'SAMPLE dividend stock · weekly bars · simulated',
      start: 2,
      bars: [
        bar('W1', [50, 50.6, 49.6, 50.2], 'Week 1: shares near 50.20, paying a SAMPLE $1.00 quarterly dividend.', 'Start with the payout and the price: $1 a quarter is about an 8% yearly yield at $50. A very high yield is a prompt to ask why.', {readout: '$1.00 a quarter'}),
        bar('W2', [50.2, 50.5, 48.9, 49.1], 'Week 2: the ex-dividend date (D). Shares open about $1 lower and close at 49.10.', 'On the ex-dividend date the price usually drops by roughly the payout, because that cash is leaving the company. Your total stays about the same.', {mark: 'dividend'}),
        bar('W3', [49.1, 49.5, 47.5, 47.8], 'Week 3: shares keep slipping, to 47.80.', 'The payout did not protect the price. A share price can fall by more than the dividend.'),
        bar('W4', [47.8, 48, 41, 42], 'Week 4: earnings (E). The company cuts the dividend to $0.50 to save cash, and shares fall to 42.', 'A dividend can be cut when cash flow weakens. The Cash flow and Dividend history links show whether past payouts were covered.', {mark: 'earnings', readout: '$0.50 a quarter'}),
        bar('W5', [42, 43, 41.5, 42.6], 'Week 5: shares steady near 42.60.', 'Over five weeks an investor received $1 in dividends and lost about $7.60 in price. Look at total return, not the yield alone.')
      ],
      takeaway: 'A dividend is part of total return, not a bonus on top. Check whether cash flow covers the payout and how the price has done.'
    },
    {
      kind: 'columns', id: 'downside',
      title: 'Define your downside before you buy',
      goal: 'Defining your downside means choosing the loss you could live with before you buy. Step through SAMPLE position sizes in a $10,000 account to see why how much you buy matters as much as what you buy.',
      tape: 'SAMPLE $10,000 account · simulated',
      start: 1,
      columns: ['', 'Position size', 'If it falls 20%', 'If it falls 50%', 'Account lost at −50%'],
      rows: [
        ['Small', '$500', '−$100', '−$250', '2.5%'],
        ['Medium', '$2,000', '−$400', '−$1,000', '10%'],
        ['Large', '$5,000', '−$1,000', '−$2,500', '25%'],
        ['All in', '$10,000', '−$2,000', '−$5,000', '50%']
      ],
      steps: [
        step(1, 0, 'Each row puts a different amount of a SAMPLE $10,000 account into one stock.', 'Your research so far is about what to buy. This step is about how much, which decides what a mistake costs.'),
        step(2, 1, 'A 20% drop on a $2,000 position costs $400.', 'A single stock can fall 20% on one earnings report. Use a drop you have seen in the chart’s history, not a hopeful one.'),
        step(3, 2, 'A 50% drop on a $5,000 position costs $2,500.', 'Single companies and theme funds can halve. Ask whether you would hold, sell, or panic at that loss before you buy.'),
        step(4, 3, 'All in: a 50% drop takes half the account.', 'After a 50% loss you need a 100% gain to get back to even. Position size is the risk lever fully in your control.'),
        step(4, 0, 'The small position loses 2.5% of the account in the same bad case.', 'Pick the row whose worst case you can accept, then choose your order type and any exit you plan. Starting points, not advice.')
      ],
      takeaway: 'Decide the loss you can tolerate first, then size the position so the bad case fits inside it.'
    }
  ];

  // Underlined phrases in each theme's catalog text: [exact phrase from the catalog, simulation id].
  const themeRefs = {
    gold: {connection: [['real interest rates, the dollar', 'gold-rates'], ['Gold miners also face business and operating risks.', 'wrapper']]},
    silver: {connection: [['Bullion funds and silver miners give different exposure.', 'wrapper']]},
    oil: {description: [['crude oil futures', 'futures-roll']], connection: [['An oil company or stock ETF is not a direct crude-price tracker.', 'producer']]},
    gas: {description: [['gas futures', 'futures-roll']], connection: [['Exporters and producers can have different sensitivities.', 'producer']]},
    fertilizer: {connection: [['Gas costs are especially important for nitrogen producers.', 'margin']]},
    resin: {connection: [['natural-gas and oil feedstock costs', 'margin'], ['These shares are not a direct resin-price tracker.', 'producer']]},
    copper: {description: [['copper futures', 'futures-roll']], connection: [['A mining company adds operating and country risks.', 'producer']]},
    uranium: {connection: [['Read fund holdings to see how much exposure is actually uranium.', 'holdings']]},
    agriculture: {connection: [['Crop-futures funds and an equipment maker have very different economics.', 'wrapper']]},
    technology: {connection: [['the price investors already pay', 'ai']]},
    semiconductors: {connection: [['One chip company is not the same exposure as the basket.', 'ai']]},
    energy: {connection: [['Oil and gas prices are only one input.', 'producer']]},
    industrials: {connection: [['margins and backlogs decide how that becomes profit', 'margin']]},
    materials: {connection: [['A materials fund mixes businesses with different cost structures.', 'holdings']]},
    discretionary: {connection: [['A fund can be concentrated in a few very large holdings.', 'concentration']]},
    staples: {connection: [['Steadier demand does not make the shares immune to costs, competition, or a high starting price.', 'defensive']]},
    utilities: {connection: [['Utility shares can also move with bond yields.', 'defensive']]},
    'large-cap': {connection: [['Large-cap funds are dominated by their biggest holdings.', 'concentration']]},
    'total-market': {connection: [['Total-market funds are still weighted toward the largest companies.', 'concentration']]},
    developed: {connection: [['Currency moves', 'dollar']]},
    emerging: {connection: [['currencies', 'dollar']]},
    'growth-style': {connection: [['The fund can fall hard when investors pay less for future profits.', 'ai']]},
    dividend: {connection: [['The share price can fall by more than the payout, and the payout can be cut.', 'dividend']]},
    'bond-market': {connection: [['Bond prices generally move opposite to yields.', 'yields'], ['Longer-term funds move more when yields change.', 'duration']]},
    'commodity-market': {connection: [['futures returns can differ from the spot price', 'futures-roll']]},
    'currency-market': {connection: [['UUP tracks a defined basket.', 'dollar']]},
    inflation: {connection: [['None is a guaranteed short-term inflation hedge', 'inflation']]},
    rates: {connection: [['Longer duration means more sensitivity.', 'duration'], ['A rate cut does not guarantee that every bond or property fund rises.', 'yields']]},
    dollar: {connection: [['Interest-rate differences', 'dollar']]},
    growth: {connection: [['Strong economic data can also lift interest-rate expectations', 'yields']]},
    ai: {connection: [['An AI theme alone does not establish a company’s future profit.', 'ai']]},
    infrastructure: {connection: [['timing, margins, capacity, and borrowing costs determine how that becomes profit', 'margin']]},
    slowdown: {connection: [['Relatively steady demand does not make a stock safe from losses.', 'defensive']]}
  };

  // Underlined phrases in the "What you would own" notes (EXPOSURE_TYPES in js/app.js).
  const exposureRefs = {
    business: [['One company can move very differently from its theme.', 'producer']],
    stockFund: [['Check the holdings', 'holdings'], ['the expense ratio', 'fees']],
    bondFund: [['longer-term bonds tend to move more', 'duration']],
    bills: [['its income changes with short-term interest rates', 'duration']],
    bullion: [['Its price follows the metal, minus expenses.', 'wrapper']],
    futures: [['Rolling from one contract to the next', 'futures-roll']],
    currency: [['strengthens against the U.S. dollar', 'dollar']]
  };

  // Underlined phrases in fixed copy that js/app.js renders (topic, compare, index weights, risk notes).
  const pageRefs = {
    allConnection: [['Check the exposure label before comparing tickers.', 'wrapper']],
    compareNote: [['This compares structure, not performance.', 'wrapper']],
    compareFutures: [['rather than storing the commodity or currency', 'futures-roll']],
    researchFutures: [['Rolling contracts', 'futures-roll']],
    indexNote: [['Each line is the share of that index, largest first.', 'concentration']]
  };

  // A short "why open these" line under research-link groups, as lesson text: plain runs and {text, sim} triggers.
  const groupWhy = {
    'Financials & primary sources': ['Why open these: ', {text: 'one-time items can hide in a single year', sim: 'financials'}, ', and the filings explain them.'],
    'Valuation & distributions': ['Why open these: ', {text: 'a dividend is not extra return by itself', sim: 'dividend'}, '.'],
    'Fund holdings & documents': ['Why open these: ', {text: 'see what the fund actually owns', sim: 'holdings'}, ' and ', {text: 'what its fee costs over time', sim: 'fees'}, '.'],
    'News & the next catalyst': ['Why open these: ', {text: 'a catalyst can already be priced in', sim: 'earnings'}, '.']
  };
  const sentimentWhy = ['Before acting on posts, ', {text: 'cross-check them with a primary source', sim: 'sentiment'}, '.'];

  const api = {sims, themeRefs, exposureRefs, pageRefs, groupWhy, sentimentWhy};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MFSims = api;
})(typeof window !== 'undefined' ? window : globalThis);
