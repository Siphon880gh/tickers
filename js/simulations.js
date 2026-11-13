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
    },
    // Added for the themes that had no underline yet, and for checks named across the page (M7.2).
    {
      kind: 'columns', id: 'value-trap',
      title: 'A low P/E: bargain or value trap?',
      goal: 'A value fund leans toward companies that look cheap on ratios such as price to earnings (P/E). Step through three SAMPLE years of two companies that start at the same low P/E to see why cheap can mean a bargain or a business in decline.',
      tape: 'SAMPLE companies A and B · price and earnings per share · simulated',
      start: 1,
      columns: ['', 'Today', 'Year 1', 'Year 2', 'Year 3'],
      rows: [
        ['A · share price', '$40', '$44', '$50', '$56'],
        ['A · earnings per share', '$5.00', '$5.20', '$5.50', '$5.80'],
        ['A · P/E', '8.0', '8.5', '9.1', '9.7'],
        ['B · share price', '$40', '$30', '$22', '$18'],
        ['B · earnings per share', '$5.00', '$3.00', '$1.50', '$1.00'],
        ['B · P/E', '8.0', '10.0', '14.7', '18.0']
      ],
      steps: [
        step(1, 2, 'Today: company A trades at $40 with $5.00 of earnings per share, a P/E of 8.', 'P/E is price divided by earnings per share. A low number says investors pay little for each dollar of profit. It does not say why they pay so little.'),
        step(1, 5, 'Company B also trades at $40 with $5.00 of earnings: the same P/E of 8.', 'On the ratio alone the two look identical. The ratio uses last year’s earnings, so the question is whether those earnings will hold.'),
        step(2, 4, 'Year 1: B’s earnings fall to $3.00 and its price drops 25% to $30, yet its P/E rises to 10.', 'When earnings shrink faster than the price, a falling stock gets more expensive on the ratio. That is a value trap: cheap for a reason.'),
        step(2, 1, 'Year 1: A’s earnings grow a little, to $5.20, and its price rises to $44.', 'Earnings that hold up let a cheap stock rise. The difference between A and B was the business, not the label.'),
        step(4, 3, 'Year 3: A is at $56 (+40%) and B at $18 (−55%). B’s P/E of 18 is no longer cheap at all.', 'Same starting ratio, opposite outcomes. Before calling a stock cheap, check the earnings trend, debt, and why the market is wary, in the filings and the Earnings & guidance link.')
      ],
      takeaway: 'A low P/E is a question, not an answer. A value label follows index rules; whether a company is a bargain depends on what happens to its earnings.'
    },
    {
      kind: 'columns', id: 'size-beta',
      title: 'Why smaller companies swing more',
      goal: 'Mid-sized and smaller companies tend to react more to the U.S. economy and to interest rates than the largest ones. Step through six SAMPLE months of a large-cap, a mid-cap, and a small-cap fund to see bigger swings in both directions.',
      tape: 'SAMPLE monthly % moves · three size funds · simulated',
      start: 1,
      columns: ['', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Total'],
      rows: [
        ['What happened (SAMPLE)', 'Strong jobs report', 'Growth scare', 'Rates rise', 'Rate-cut hopes', 'Small-company earnings miss', 'Quiet month', '6 months'],
        ['Large-cap fund', '+2%', '−3%', '−1%', '+3%', '+1%', '+0.5%', '+2.4%'],
        ['Mid-cap fund', '+3%', '−5%', '−2%', '+5%', '0%', '+0.6%', '+1.3%'],
        ['Small-cap fund', '+4%', '−7%', '−4%', '+7%', '−3%', '+0.8%', '−2.9%']
      ],
      steps: [
        step(1, 3, 'Month 1: a strong SAMPLE jobs report. The small-cap fund rises 4%, twice the large-cap fund’s 2%.', 'Smaller companies sell more of their goods at home, so U.S. growth news reaches them more directly. A fund that moves more than the market is said to have a higher beta.'),
        step(2, 3, 'Month 2: a growth scare. Small caps fall 7%, mid caps 5%, large caps 3%.', 'The extra sensitivity works in both directions. A higher beta means larger drops, not only larger gains.'),
        step(3, 3, 'Month 3: interest rates rise. Small caps fall 4% against 1% for large caps.', 'Smaller firms often carry more floating-rate debt and less cash, so higher borrowing costs hurt them sooner. The financing-cost simulation shows that in one company.'),
        step(4, 2, 'Month 4: hopes of a rate cut. The mid-cap fund jumps 5% and the small-cap fund 7%.', 'Mid caps usually sit between the two extremes: more sensitive than the giants, less than the smallest firms.'),
        step(5, 3, 'Month 5: several small companies miss earnings and the small-cap fund falls 3% while large caps rise 1%.', 'Many small companies have few analysts following them, so results surprise more often and the basket can move on its own news.'),
        step(7, 3, 'Six months: large caps +2.4%, mid caps +1.3%, small caps −2.9%.', 'Bigger swings did not mean a bigger reward in this window: after a 7% fall you need about 7.5% to get back. Compare each fund’s own past price swings before choosing a size.')
      ],
      takeaway: 'Company size changes how hard a fund reacts to growth and rates. Smaller is more sensitive, in both directions; it is not a promise of higher return.'
    },
    {
      kind: 'columns', id: 'refinance',
      title: 'Floating-rate debt and a small company’s profit',
      goal: 'A company that borrows at a floating rate pays more interest as soon as rates rise. Step through five SAMPLE years of a small company with floating-rate loans and a large one with long-term fixed-rate bonds.',
      tape: 'SAMPLE companies · $ millions · simulated',
      start: 1,
      columns: ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      rows: [
        ['Short-term interest rate', '2%', '4%', '6%', '6%', '4%'],
        ['Small co · its loan rate (short rate + 3)', '5%', '7%', '9%', '9%', '7%'],
        ['Small co · interest on $200M of loans', '$10M', '$14M', '$18M', '$18M', '$14M'],
        ['Small co · operating profit', '$30M', '$30M', '$28M', '$26M', '$28M'],
        ['Small co · profit before tax', '$20M', '$16M', '$10M', '$8M', '$14M'],
        ['Large co · profit before tax (fixed 4% bonds)', '$900M', '$900M', '$880M', '$860M', '$880M']
      ],
      steps: [
        step(1, 4, 'Year 1: the SAMPLE small company makes $30M from operations, pays $10M of interest, and keeps $20M.', 'Start with how much of operating profit goes to lenders: one third here. That share is the cushion that rates can eat.'),
        step(2, 2, 'Year 2: short-term rates rise to 4%. The loan resets to 7%, and interest climbs to $14M.', 'Floating-rate loans reset with short-term rates. A company’s debt note in its annual report says how much is fixed and how much floats.'),
        step(2, 4, 'Year 2: profit before tax falls 20%, to $16M, with no change in the business.', 'This is financing-cost sensitivity: the same sales and the same operations, less profit for shareholders.'),
        step(3, 5, 'Year 3: the small company keeps $10M, half of Year 1. The large company with fixed-rate bonds is down only about 2%.', 'Debt locked in for years shields a company until it has to refinance. Larger firms can more often borrow that way.'),
        step(4, 4, 'Year 4: the economy slows, operating profit slips to $26M, and the small company keeps just $8M.', 'Higher rates and a slowdown can arrive together, and a thin cushion shrinks fast. That is why small-cap funds often react strongly to rate news.'),
        step(5, 4, 'Year 5: rates ease to 4% and profit recovers to $14M.', 'The same lever, reversed. Read the debt maturity table in the filings to see when a company must refinance and at what rates.')
      ],
      takeaway: 'Floating-rate or soon-maturing debt passes rate changes straight into profit. Check how a company borrows, not only what it sells.'
    },
    {
      kind: 'columns', id: 'cap-rate',
      title: 'Rates, cap rates, and what a building is worth',
      goal: 'A property is often valued as its yearly rent income divided by a cap rate, the yield buyers demand. Step through SAMPLE years to see why real-estate funds can fall when rates rise even while rents grow.',
      tape: 'SAMPLE office-and-warehouse portfolio · $ millions · simulated',
      start: 1,
      columns: ['', 'Start', 'Year 1', 'Year 2', 'Year 3', 'Year 4'],
      rows: [
        ['10-year Treasury yield', '3.0%', '4.0%', '4.5%', '4.5%', '3.5%'],
        ['Cap rate buyers demand', '5.00%', '5.75%', '6.25%', '6.25%', '5.50%'],
        ['Rent income after costs (NOI)', '$10.0M', '$10.3M', '$10.6M', '$10.9M', '$11.2M'],
        ['Property value (NOI ÷ cap rate)', '$200M', '$179M', '$170M', '$174M', '$204M'],
        ['Rate on a new loan', '4.5%', '5.5%', '6.0%', '6.0%', '5.0%']
      ],
      steps: [
        step(1, 3, 'Start: $10M of yearly rent income after costs, at a 5% cap rate, gives a value of $200M.', 'Value = income ÷ cap rate. Because the cap rate is in the denominator, a small change in it moves the value a lot.'),
        step(2, 1, 'Year 1: the 10-year yield rises a full point, and buyers now want a 5.75% cap rate.', 'When Treasuries pay more, property income has to pay more to compete, and loans to buy buildings cost more. Rates feed straight into the cap rate.'),
        step(2, 3, 'Year 1: rents grew 3%, yet the value falls about 10%, to $179M.', 'Higher income did not offset a higher cap rate. That is how a property fund can drop on a rate move while its buildings stay full.'),
        step(3, 4, 'Year 2: a new loan costs 6.0%, nearly the 6.25% the property yields.', 'When borrowing costs approach the property’s own yield, debt adds little and refinancing maturing loans squeezes income. Check a REIT’s debt maturities.'),
        step(4, 3, 'Year 3: rates hold, and value edges up to $174M on rent growth alone.', 'Once rates stop rising, rent growth does the work again. Rents, occupancy, and property type are the other half of the story.'),
        step(5, 3, 'Year 4: the yield falls to 3.5%, the cap rate to 5.5%, and value recovers to $204M.', 'Lower rates help only if cap rates follow and rents hold. That is why a rate cut does not guarantee every property fund rises.')
      ],
      takeaway: 'Property values move with income and with the yield buyers demand. Watch borrowing costs and rents together.'
    },
    {
      kind: 'columns', id: 'ffo',
      title: 'Why REITs report FFO, not only earnings',
      goal: 'Real-estate investment trusts (REITs) depreciate their buildings on paper every year, which lowers reported earnings without costing cash. Step through three SAMPLE years to see why funds from operations (FFO) is the usual yardstick for a REIT’s dividend.',
      tape: 'SAMPLE REIT · $ per share · simulated',
      start: 1,
      columns: ['', 'Year 1', 'Year 2', 'Year 3'],
      rows: [
        ['Rent income after costs', '$5.00', '$5.20', '$5.10'],
        ['Depreciation (non-cash)', '−$2.00', '−$2.10', '−$2.10'],
        ['Gain on selling a building', '$0', '+$1.50', '$0'],
        ['Interest and other costs', '−$1.00', '−$1.00', '−$1.20'],
        ['Earnings per share (EPS)', '$2.00', '$3.60', '$1.80'],
        ['FFO (EPS + depreciation − sale gains)', '$4.00', '$4.20', '$3.90'],
        ['Dividend paid', '$3.40', '$3.50', '$3.50'],
        ['Dividend ÷ EPS', '170%', '97%', '194%'],
        ['Dividend ÷ FFO', '85%', '83%', '90%']
      ],
      steps: [
        step(1, 4, 'Year 1: the SAMPLE REIT earns $2.00 per share after a $2.00 depreciation charge.', 'Depreciation spreads a building’s cost over many years. It is an accounting charge, not cash leaving the company, so EPS understates what the properties produce.'),
        step(1, 5, 'Year 1: FFO adds depreciation back: $4.00 per share.', 'Funds from operations is the measure REITs report so investors can compare recurring property income. It is a supplemental figure, so read how each REIT defines it.'),
        step(1, 8, 'Year 1: the $3.40 dividend is 170% of EPS but 85% of FFO.', 'REITs must pay out most of their taxable income. Judged by EPS the payout looks unsafe; judged by FFO it looks covered. Use the yardstick that fits the business.'),
        step(2, 4, 'Year 2: EPS jumps to $3.60 on a one-time $1.50 gain from selling a building. FFO only rises to $4.20.', 'FFO removes property-sale gains, so a one-off sale does not look like a better year. A jump in EPS from selling buildings is not repeatable income.'),
        step(3, 5, 'Year 3: interest costs rise, FFO falls to $3.90, and the payout climbs to 90% of FFO.', 'Higher borrowing costs eat the cash that funds the dividend. A rising FFO payout ratio is an earlier warning than the yield itself.'),
        step(3, 7, 'Year 3: by EPS the payout is 194%, which looks alarming; the useful signal is the FFO payout rising from 83% to 90%.', 'The wrong yardstick can raise a false alarm or hide a real one. The Financials & primary sources links lead to the REIT’s own FFO table.')
      ],
      takeaway: 'For a REIT, compare the dividend with FFO, and watch how borrowing costs move FFO. EPS alone can mislead in either direction.'
    },
    {
      kind: 'columns', id: 'nim',
      title: 'A bank’s margin and the yield curve',
      goal: 'A bank pays interest on deposits and earns interest on loans; the gap is its net interest margin. Step through five SAMPLE years to see how rates, the shape of the yield curve, and credit losses move a bank, and why a payment network reacts differently.',
      tape: 'SAMPLE bank and payment network · simplified · simulated',
      start: 1,
      columns: ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      rows: [
        ['Short-term rate', '1.0%', '3.0%', '5.0%', '5.0%', '3.5%'],
        ['10-year yield', '2.5%', '3.5%', '4.5%', '4.0%', '4.0%'],
        ['Yield curve (10-year minus short)', '+1.5', '+0.5', '−0.5', '−1.0', '+0.5'],
        ['Bank · average loan yield', '4.5%', '5.5%', '6.5%', '6.5%', '6.0%'],
        ['Bank · average deposit cost', '0.5%', '1.5%', '3.0%', '3.5%', '2.5%'],
        ['Bank · net interest margin (simplified)', '4.0%', '4.0%', '3.5%', '3.0%', '3.5%'],
        ['Bank · credit losses, % of loans', '0.3%', '0.3%', '0.5%', '1.0%', '0.8%'],
        ['Payment network · spending volume growth', '+8%', '+9%', '+7%', '+4%', '+6%']
      ],
      steps: [
        step(1, 5, 'Year 1: the SAMPLE bank earns 4.5% on loans and pays 0.5% on deposits, a margin of about 4.0%.', 'A bank borrows short (deposits) and lends for longer. The gap between the two rates, the net interest margin, is its main profit engine.'),
        step(2, 4, 'Year 2: short rates jump to 3%. The bank raises loan yields a full point but deposit costs only to 1.5%; the margin holds.', 'Deposits often reprice slower than loans at first, which is why bank shares can do well early in a rate rise.'),
        step(3, 2, 'Year 3: the curve inverts: short rates (5%) are above the 10-year (4.5%). Depositors demand 3%, and the margin narrows to 3.5%.', 'When short rates sit above long rates, borrowing short and lending long pays less. Treasury yield data, such as FRED’s, lets you check the curve yourself.'),
        step(4, 6, 'Year 4: credit losses triple to 1.0% of loans as the economy slows, while the margin falls to 3.0%.', 'Loans that are not repaid are the other big bank risk, and they tend to rise when the economy weakens, sometimes at the same time margins shrink.'),
        step(4, 7, 'Year 4: the payment network’s spending volume still grows 4%.', 'A payment network earns fees on card spending and holds few of the loans. It follows consumer spending more than the yield curve: same sector fund, different business.'),
        step(5, 5, 'Year 5: the curve turns positive again and the bank’s margin recovers to 3.5%.', 'For a bank, read the margin and loan-loss provisions in each earnings report; for a payment network, read volume growth. The Earnings & guidance link has both.')
      ],
      takeaway: 'Banks live on the gap between loan and deposit rates and on loans being repaid. Check the yield curve and credit trends before treating rising rates as good news.'
    },
    {
      kind: 'bars', id: 'ad-cycle',
      title: 'The advertising cycle and a platform stock',
      goal: 'Ad-funded platforms earn most of their revenue from advertisers, whose budgets rise and fall with business confidence. Step through six SAMPLE quarters, with industry ad-spending growth beside each bar, to see the ad cycle, user growth, and regulation at work.',
      tape: 'SAMPLE ad-funded platform · quarterly bars · simulated',
      start: 2,
      bars: [
        bar('Q1', [100, 106, 98, 104], 'Q1: SAMPLE industry ad spending grows 8% and the platform closes at 104.', 'Ad budgets follow how confident businesses feel. For an ad-funded company that can matter more than a broad economic statistic.', {readout: 'Ad spend +8%'}),
        bar('Q2', [104, 105, 90, 92], 'Q2: advertisers trim budgets after a SAMPLE slowdown warning (N); ad growth drops to 2% and the stock to 92.', 'Advertising is one of the first costs companies cut, so ad revenue can slow faster than the economy itself.', {mark: 'news', readout: 'Ad spend +2%'}),
        bar('Q3', [92, 100, 85, 98], 'Q3: earnings (E). Ad revenue slowed, but users grew 5% and time spent rose; the stock recovers to 98.', 'Users and engagement are what the platform sells to advertisers. Growth there keeps pricing power for when budgets return.', {mark: 'earnings', readout: 'Users +5%'}),
        bar('Q4', [98, 99, 86, 88], 'Q4: a SAMPLE privacy rule is proposed that would limit ad targeting (N). The stock falls to 88.', 'Regulation can change what each ad is worth, which is why the theme lists it beside advertising and users.', {mark: 'news', readout: 'Ad spend +3%'}),
        bar('Q5', [88, 110, 87, 108], 'Q5: ad budgets come back, growing 10%, and the stock jumps to 108 before revenue is reported.', 'Markets often move on the turn in the cycle before the next earnings report confirms it.', {readout: 'Ad spend +10%'}),
        bar('Q6', [108, 112, 104, 110], 'Q6: earnings (E) confirm the rebound; the stock closes at 110.', 'Over six quarters the stock swung from 85 to 112. Check the revenue mix (ads, subscriptions, cloud) in the annual report before treating any one platform as a pure ad bet.', {mark: 'earnings', readout: 'Ad spend +9%'})
      ],
      takeaway: 'Ad-funded businesses ride the advertising cycle, with users and regulation on top. Read what share of revenue comes from ads.'
    },
    {
      kind: 'columns', id: 'patent-cliff',
      title: 'Patents, pipelines, and a binary trial result',
      goal: 'Health care is called defensive because people need medicine in any economy, yet one drugmaker can be anything but steady. Step through five SAMPLE years of a drugmaker whose biggest product loses patent protection while its pipeline produces one approval and one failed trial.',
      tape: 'SAMPLE drugmaker · revenue in $ billions · share price indexed · simulated',
      start: 1,
      columns: ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      rows: [
        ['Drug A (patent ends after Year 2)', '30', '31', '14', '9', '7'],
        ['Drug B (approved in Year 2)', '0', '2', '7', '12', '16'],
        ['Other products', '20', '20', '21', '21', '22'],
        ['Total revenue', '50', '53', '42', '42', '45'],
        ['Share price (start 100)', '100', '104', '78', '82', '92'],
        ['Event (SAMPLE)', '—', 'Drug B approved', 'Generics of A; Drug C trial fails', '—', '—']
      ],
      steps: [
        step(1, 0, 'Year 1: Drug A brings in $30B of the company’s $50B, 60% of revenue.', 'A patent gives a drug years without copies, and then it ends. The product mix and patent dates are in the annual report, so this risk is visible in advance.'),
        step(2, 1, 'Year 2: Drug B is approved and sells $2B in its first year.', 'New products are how a drugmaker replaces revenue before a patent ends. Approval is one step; how fast sales grow is another.'),
        step(3, 0, 'Year 3: Drug A’s patent ends, cheaper copies arrive, and its sales fall from $31B to $14B.', 'This is a patent cliff: sales of a drug can drop by half or more within a year of losing protection. The question is whether the pipeline fills the hole.'),
        step(3, 4, 'Year 3: the share price falls from 104 to 78, hit as well by a failed late-stage trial of Drug C on one day.', 'A trial result is a binary event: it passes or fails, often announced at once. One readout can move a drug stock more than a year of economic news.'),
        step(4, 3, 'Year 4: total revenue is flat at $42B as Drug B grows to $12B.', 'A sector fund spreads these patent and trial events across many companies; one company concentrates them. That is the difference between the fund and a single drugmaker in this theme.'),
        step(5, 4, 'Year 5: revenue is back to $45B and the price to 92, still below Year 2.', 'Steady demand for health care did not make this stock steady. Read the pipeline and patent sections of the filings alongside enrollment and regulation news.')
      ],
      takeaway: 'Patent expiry dates and trial results drive single health-care companies. The sector can be defensive while one company is a series of binary bets.'
    },
    {
      kind: 'columns', id: 'policy-capex',
      title: 'Policy, financing costs, and a capex cycle',
      goal: 'Clean-energy projects cost a lot up front and earn for decades, so subsidies and interest rates decide whether they get built. Step through five SAMPLE years of an equipment maker that expands just as policy and rates turn.',
      tape: 'SAMPLE clean-energy equipment maker · simulated',
      start: 1,
      columns: ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      rows: [
        ['Policy credit per unit (SAMPLE)', '$30', '$30', '$30', '$15', '$15'],
        ['Financing rate for projects', '4%', '4%', '7%', '7%', '5%'],
        ['Units ordered', '100', '130', '90', '60', '80'],
        ['Factory capacity (units)', '100', '150', '200', '200', '200'],
        ['Capacity used', '100%', '87%', '45%', '30%', '40%'],
        ['Maker’s profit', '$40M', '$45M', '$5M', '−$20M', '−$5M']
      ],
      steps: [
        step(1, 2, 'Year 1: with a SAMPLE $30 credit and 4% financing, customers order 100 units, the factory is full, and profit is $40M.', 'A project that earns for decades is worth today’s value of that future income. Subsidies raise the income and cheap financing raises today’s value.'),
        step(2, 3, 'Year 2: orders rise 30%, and the maker expands to 150 units with more capacity already planned.', 'This is a capex cycle: companies build ahead of the demand they expect, and the decision is usually made when optimism is highest.'),
        step(3, 1, 'Year 3: the financing rate jumps to 7% and orders fall to 90.', 'The same project is worth less when its future income is discounted at a higher rate. That is why the theme names financing costs.'),
        step(3, 4, 'Year 3: the new capacity arrives, only 45% of it is used, and profit drops to $5M.', 'Factories carry fixed costs. When demand falls as capacity grows, margins collapse: the hangover of the capex cycle.'),
        step(4, 0, 'Year 4: the SAMPLE credit is cut in half; orders fall to 60 and the maker loses $20M.', 'Policy can change with elections and budgets. The risk-factors section of a company’s filing says how much it depends on government support.'),
        step(5, 4, 'Year 5: rates ease to 5% and orders recover to 80, yet the maker still loses money.', 'Demand recovers before profit when capacity is idle. Solar makers, copper miners, and nuclear suppliers each face a different mix of these risks, so read each one.')
      ],
      takeaway: 'Transition businesses depend on policy, financing costs, and the capex cycle together. Check all three, and remember that the timing of capacity matters as much as demand.'
    },
    {
      kind: 'columns', id: 'tracking',
      title: 'Price versus NAV: what a fund trades for',
      goal: 'A fund’s net asset value (NAV) is what its holdings are worth per share; its market price is what you pay on the exchange. Step through five SAMPLE trading days, including one stressed day, to see tracking, premiums and discounts, and the bid–ask spread.',
      tape: 'SAMPLE stock fund · one week · simulated',
      start: 1,
      columns: ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      rows: [
        ['Index it follows (start 100)', '100.00', '101.00', '99.50', '97.00', '98.00'],
        ['Fund NAV per share', '$50.00', '$50.50', '$49.75', '$48.50', '$49.00'],
        ['Fund market price', '$50.01', '$50.52', '$49.74', '$48.10', '$49.02'],
        ['Premium (+) or discount (−)', '+0.02%', '+0.04%', '−0.02%', '−0.82%', '+0.04%'],
        ['Bid–ask spread', '$0.01', '$0.01', '$0.01', '$0.12', '$0.02']
      ],
      steps: [
        step(1, 3, 'Monday: NAV is $50.00 and the fund trades at $50.01, a premium of 0.02%.', 'Large traders can create or redeem fund shares, which usually keeps the price within a hair of NAV. Usually is the word to check.'),
        step(2, 1, 'Tuesday: the index rises 1% and NAV rises 1%, to $50.50.', 'That is tracking. Over a year the gap between the fund and its index, the tracking difference, is mostly the fee plus trading costs, and issuer pages publish it.'),
        step(4, 3, 'Thursday: a SAMPLE sell-off. The index falls 2.5%, but the price falls further, to a 0.82% discount to NAV.', 'In fast markets, and for funds with harder-to-trade holdings, the price can slip from NAV. Selling then means accepting less than the holdings are worth.'),
        step(4, 4, 'Thursday: the bid–ask spread widens from $0.01 to $0.12.', 'You buy at the ask and sell at the bid, so a wider spread is a cost on every trade. The spread simulation shows how it adds up.'),
        step(5, 3, 'Friday: markets calm and the price is back near NAV, a 0.04% premium.', 'The gap usually closes. A limit order and patience on a stressed day can avoid paying for it. The issuer’s premium and discount history shows how often it happens.')
      ],
      takeaway: 'Check the index a fund follows, its tracking difference, and its premium or discount history. Most days the price equals NAV; stressed days are the exception to plan for.'
    },
    {
      kind: 'columns', id: 'breadth',
      title: 'A rising index can leave most companies behind',
      goal: 'Most indexes weight companies by size, so a few giants can carry the total. Step through a SAMPLE five-company index for one year to see the index rise while three of five members fall.',
      tape: 'SAMPLE five-company index · one year · simulated',
      start: 1,
      columns: ['', 'Weight', 'Return', 'Contribution'],
      rows: [
        ['Giant A', '40%', '+30%', '+12.00 pts'],
        ['Giant B', '20%', '+20%', '+4.00 pts'],
        ['Company C', '15%', '−5%', '−0.75 pts'],
        ['Company D', '15%', '−10%', '−1.50 pts'],
        ['Company E', '10%', '−8%', '−0.80 pts'],
        ['Index (size-weighted)', '100%', '+12.95%', '+12.95 pts'],
        ['Equal-weight average', '20% each', '+5.40%', '—']
      ],
      steps: [
        step(1, 0, 'Giant A is 40% of the SAMPLE index and Giant B another 20%.', 'In a size-weighted index the largest companies count the most. The Index weights panel shows the real shares in dated snapshots.'),
        step(2, 0, 'Giant A rises 30% and Giant B 20%.', 'Two strong years at the top. Keep stepping before deciding the market did well.'),
        step(2, 4, 'Companies C, D, and E all fall, by 5%, 10%, and 8%.', 'Three of five members lost money. That is most of the index by count.'),
        step(3, 5, 'Yet the index rises 12.95%, because 40% × 30% alone adds 12 points.', 'Contribution = weight × return. A rising index can still leave many companies behind, which is what narrow leadership means.'),
        step(3, 6, 'The equal-weight average of the five is only +5.40%.', 'Comparing the index with an equal-weight average shows how broad a rally is. Narrow leadership also works in reverse: if Giant A fell 30%, it would subtract 12 points.')
      ],
      takeaway: 'An index return is a weighted average. Check how much of it came from a few giants before assuming most stocks rose.'
    },
    {
      kind: 'columns', id: 'rotation',
      title: 'Sector rotation through a SAMPLE cycle',
      goal: 'Different sectors tend to lead at different points of the business cycle. Step through four SAMPLE phases to see why cyclical, defensive, energy, and bond funds take turns, and why the textbook order is only a set of questions.',
      tape: 'SAMPLE returns over each phase · simulated',
      start: 1,
      columns: ['', 'Expansion', 'Late cycle', 'Slowdown', 'Recovery'],
      rows: [
        ['Industrials & materials', '+18%', '+6%', '−15%', '+22%'],
        ['Technology & discretionary', '+20%', '+2%', '−18%', '+25%'],
        ['Staples, utilities & health care', '+8%', '+5%', '−3%', '+6%'],
        ['Energy', '+10%', '+14%', '−12%', '+8%'],
        ['Long-term Treasuries', '−4%', '−6%', '+12%', '−2%'],
        ['Backdrop (SAMPLE)', 'Growth strong', 'Inflation and rates up', 'Growth falls, rates cut', 'Rates low, growth returns']
      ],
      steps: [
        step(1, 1, 'Expansion: technology and discretionary rise 20%, industrials and materials 18%.', 'When orders and spending grow, the sectors whose profits depend most on the economy tend to gain most.'),
        step(2, 3, 'Late cycle: energy leads with +14% as inflation and rates rise; technology gains only 2%.', 'Commodity prices often peak late in a cycle, while higher rates weigh on companies valued for profits far in the future.'),
        step(3, 2, 'Slowdown: staples, utilities, and health care fall only 3% while cyclicals drop 15% to 18%.', 'This is why the slowdown theme groups everyday products and essential services. Falling less is not the same as rising.'),
        step(3, 4, 'Slowdown: long-term Treasuries rise 12% as rates are cut.', 'Bonds helped here, but they lost in the late cycle when rates rose. A hedge in one phase can be a drag in another.'),
        step(4, 1, 'Recovery: technology and discretionary jump 25%, often before the economic data improve.', 'Markets look ahead. By the time a slowdown is official, part of the rotation may already have happened.'),
        step(4, 5, 'The backdrop row: each phase is labeled here, but a real cycle is only clear in hindsight.', 'Real cycles skip phases and change speed. Use rotation as a list of questions about growth, inflation, and rates, not as a timing rule.')
      ],
      takeaway: 'Sector leadership tends to change with growth, inflation, and rates, but not on a schedule. Check the backdrop before assuming a sector’s turn has come.'
    },
    {
      kind: 'columns', id: 'correlation',
      title: 'Diversification: what spreading risk does and does not do',
      goal: 'Holding many companies spreads out company-specific risk, but companies that share a driver still move together. Step through five SAMPLE months of two chip companies, a chip sector fund, a broad stock fund, and a stock-and-bond mix.',
      tape: 'SAMPLE monthly % moves · simulated',
      start: 1,
      columns: ['', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Worst month'],
      rows: [
        ['Chip company A', '+6%', '−12%', '+4%', '−8%', '+10%', '−12%'],
        ['Chip company B', '+5%', '+3%', '−9%', '−7%', '+8%', '−9%'],
        ['Chip sector fund', '+5%', '−4%', '−2%', '−7%', '+8%', '−7%'],
        ['Broad stock fund', '+2%', '−1%', '0%', '−4%', '+3%', '−4%'],
        ['Half broad stocks, half bonds', '+1.5%', '−0.25%', '+0.25%', '−1.0%', '+1.0%', '−1.0%']
      ],
      steps: [
        step(2, 0, 'Month 2: company A falls 12% on its own SAMPLE news while company B rises 3%.', 'That is company-specific risk. When companies have different problems, owning several lets one’s bad news be offset by another’s good month.'),
        step(2, 2, 'Month 2: the sector fund falls only 4%.', 'This is what spreading company risk across an industry means: A’s problem is diluted by the other holdings.'),
        step(4, 2, 'Month 4: a SAMPLE industry-wide chip slowdown. A falls 8%, B 7%, and the sector fund 7%.', 'When companies share a driver they move together; they are highly correlated. A sector fund cannot spread away the risk of its own sector.'),
        step(4, 3, 'Month 4: the broad stock fund falls only 4%, because other sectors did not share the chip problem.', 'Holdings with different drivers have lower correlation, so the total swings less.'),
        step(4, 4, 'Month 4: the stock-and-bond mix falls just 1%, as SAMPLE bonds rose 2%.', 'Assets with different drivers can smooth the path. Correlations change, though: in a rate shock stocks and bonds can fall together.'),
        step(6, 4, 'Worst months: A −12%, B −9%, sector fund −7%, broad fund −4%, mix −1%.', 'Diversification shrinks the worst month but also the best ones (A’s +10% became +1%). It lowers risk; it does not remove loss.')
      ],
      takeaway: 'Diversification works when holdings have different drivers. A fund of similar companies spreads company risk, not sector risk.'
    },
    {
      kind: 'columns', id: 'country-mix',
      title: 'Country weights and currencies in an international fund',
      goal: 'An international fund weights countries by the size of their markets, and a U.S. investor also carries each currency. Step through one SAMPLE year to see how one heavy-weight country and one currency move can decide the result.',
      tape: 'SAMPLE international stock fund · one year · simulated',
      start: 1,
      columns: ['', 'Weight', 'Local stock return', 'Currency vs $', 'Return in $', 'Contribution'],
      rows: [
        ['Country A', '30%', '+10%', '−5%', '+4.5%', '+1.35 pts'],
        ['Country B', '25%', '−8%', '0%', '−8.0%', '−2.00 pts'],
        ['Country C', '15%', '+4%', '+3%', '+7.1%', '+1.07 pts'],
        ['12 other countries', '30%', '+5%', '0%', '+5.0%', '+1.50 pts'],
        ['Fund, in $', '100%', '—', '—', '—', '+1.92%']
      ],
      steps: [
        step(1, 0, 'Three SAMPLE countries make up 70% of the fund.', 'Market-size weighting lets a few countries dominate. The issuer’s country breakdown shows the real mix, which changes over time.'),
        step(2, 1, 'Country B’s stocks fall 8% after a SAMPLE policy shock.', 'Politics and the local economy in one heavy-weight country can sink the whole result.'),
        step(5, 1, 'Country B subtracts 2 points: 25% weight × −8%.', 'The 12 other countries together add only 1.5 points. Weight decides how much each country’s news matters.'),
        step(3, 0, 'Country A’s stocks rise 10% at home, but its currency falls 5% against the dollar.', 'A U.S. investor in an unhedged fund earns the local return plus the currency move. The currency can add or subtract.'),
        step(4, 0, 'In dollars, Country A returns about 4.5%: 1.10 × 0.95 − 1.', 'Half of the local gain disappeared in the exchange rate. The currency simulation shows what moves exchange rates.'),
        step(5, 4, 'The SAMPLE fund ends up 1.92% in dollars.', 'Read the country weights first, then the currencies, then the companies. That order explains most of an international fund’s year.')
      ],
      takeaway: 'An international fund is a bet on its biggest countries and their currencies. Check the country mix before comparing it with another fund.'
    },
    {
      kind: 'columns', id: 'backwardation',
      title: 'Inventories, contango, and backwardation',
      goal: 'The futures curve slopes up (contango) when supply is plentiful and down (backwardation) when it is tight, and a futures fund earns or loses on that slope each time it rolls. Step through five SAMPLE months with a flat spot price to isolate the effect.',
      tape: 'SAMPLE crude curve and futures fund · spot held flat · simulated',
      start: 1,
      columns: ['', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5'],
      rows: [
        ['Inventories vs normal', 'High', 'High', 'Normal', 'Low', 'Low'],
        ['Spot price', '70.00', '70.00', '70.00', '70.00', '70.00'],
        ['Next contract the fund buys', '72.00', '71.50', '70.00', '68.50', '68.00'],
        ['Curve shape', 'Contango', 'Contango', 'Flat', 'Backwardation', 'Backwardation'],
        ['Roll effect that month', '−2.8%', '−2.1%', '0.0%', '+2.2%', '+2.9%'],
        ['Fund value (start 100)', '97.2', '95.2', '95.2', '97.3', '100.1']
      ],
      steps: [
        step(1, 2, 'Month 1: inventories are high. Next month’s contract costs 72 while spot is 70: contango.', 'When storage is full, oil for later delivery costs more to cover storage and financing, so the curve slopes up.'),
        step(1, 4, 'Month 1: spot does not move, yet the fund loses 2.8% as its 72 contract ends at 70.', 'Buying above spot and converging down to it is the roll cost the futures-roll simulation shows.'),
        step(3, 3, 'Month 3: SAMPLE inventory reports show stocks back to normal; the curve flattens and the roll costs nothing.', 'Weekly inventory reports, such as the EIA’s, explain why the curve changes shape. That is why they belong in a futures fund’s research.'),
        step(4, 2, 'Month 4: inventories are low. The next contract costs 68.50, below spot: backwardation.', 'When supply is tight, buyers pay up for oil now, so later contracts are cheaper than spot.'),
        step(4, 4, 'Month 4: the fund gains 2.2% as its 68.50 contract rises to the 70 spot price.', 'In backwardation the roll earns money: buy below spot and converge up to it. A futures fund can beat a flat spot price.'),
        step(5, 5, 'Month 5: the fund is back to 100.1 although spot never moved.', 'The curve’s shape, set by inventories and storage, drove the whole path. Check the curve, not only spot, before judging a futures fund.')
      ],
      takeaway: 'Full storage tends to mean contango and a roll cost; tight supply tends to mean backwardation and a roll gain. Inventories are the link.'
    },
    {
      kind: 'columns', id: 'swings',
      title: 'Past price swings: why a bumpy path costs money',
      goal: 'Volatility is the size of a ticker’s ups and downs, not their direction. Step through four SAMPLE years of a steady fund and a swingy fund to see a drawdown and why big losses cost more than equal gains repay.',
      tape: 'SAMPLE $10,000 in two funds · simulated',
      start: 1,
      columns: ['', 'Start', 'Year 1', 'Year 2', 'Year 3', 'Year 4'],
      rows: [
        ['Steady fund · yearly return', '—', '+5%', '+5%', '+5%', '+5%'],
        ['Steady fund · value', '$10,000', '$10,500', '$11,025', '$11,576', '$12,155'],
        ['Swingy fund · yearly return', '—', '+30%', '−25%', '+30%', '−10%'],
        ['Swingy fund · value', '$10,000', '$13,000', '$9,750', '$12,675', '$11,408'],
        ['Swingy fund · drop from its peak', '0%', '0%', '−25%', '−2.5%', '−12.2%']
      ],
      steps: [
        step(2, 2, 'Year 1: the swingy fund gains 30% against the steady fund’s 5%.', 'Past price swings measure how far a ticker moves, up or down. A great year is part of the same volatility as a bad one.'),
        step(3, 4, 'Year 2: the swingy fund falls 25%, to $9,750, below where it started.', 'A 25% drop needs a 33% gain to get back. Past swings tell you what you may have to sit through.'),
        step(4, 3, 'Year 3: it gains 30% again, to $12,675, but is still 2.5% below its peak.', 'Big gains after big losses feel like recovery. Measure from the peak, not from the low.'),
        step(5, 3, 'Year 4: down 10%, to $11,408, while the steady fund reaches $12,155.', 'The swingy fund’s average yearly return (+6.25%) beat the steady fund’s 5%, yet it ended with less. Losses compound against you; this is volatility drag.'),
        step(5, 4, 'Year 4: the swingy fund is 12.2% below its peak.', 'The largest drop from a peak, the drawdown, is easy to read on a long chart. Size a position so that drop is bearable.')
      ],
      takeaway: 'Two funds with similar average returns can end far apart. Look at past swings and drawdowns, not only the average.'
    },
    {
      kind: 'columns', id: 'spread',
      title: 'The bid–ask spread: a trading cost you can see',
      goal: 'Every quote has a bid (what buyers pay) and an ask (what sellers want). Step through a SAMPLE busy fund, a thinly traded stock, and that stock at the open to see how the gap becomes a cost.',
      tape: 'SAMPLE quotes · $5,000 bought and sold right away · simulated',
      start: 1,
      columns: ['', 'Busy fund', 'Thin stock', 'Thin stock at the open'],
      rows: [
        ['Bid', '$100.00', '$20.00', '$19.80'],
        ['Ask', '$100.01', '$20.10', '$20.20'],
        ['Spread', '$0.01', '$0.10', '$0.40'],
        ['Spread as % of price', '0.01%', '0.50%', '2.0%'],
        ['Cost to buy, then sell $5,000 at market', '$0.50', '$25', '$100'],
        ['Shares traded per day (SAMPLE)', 'Millions', 'Thousands', 'Thousands']
      ],
      steps: [
        step(1, 2, 'A busy SAMPLE fund: bid $100.00, ask $100.01, a one-cent spread.', 'A market order buys at the ask and sells at the bid. The gap is a cost on top of any fee, paid to whoever takes the other side.'),
        step(1, 4, 'Buying and selling $5,000 right away costs about $0.50.', 'Heavily traded tickers have tight spreads, so the trading cost barely registers.'),
        step(2, 3, 'A thinly traded SAMPLE stock: bid $20.00, ask $20.10, a 0.50% spread.', 'Fewer traders means market makers ask more for holding the risk. The Yahoo chart link in the research panel shows trading volume.'),
        step(2, 4, 'The same $5,000 round trip costs $25.', 'That is like a year of a high expense ratio, paid in one day. Trading thin tickers often repeats it.'),
        step(3, 3, 'At the open the spread widens to $0.40, or 2%, and the round trip to $100.', 'Spreads tend to widen at the open, near the close, and around news. A limit order sets the most you will pay, though it may not fill.')
      ],
      takeaway: 'Check the bid, the ask, and the volume before trading. The spread is a real cost, largest on thin tickers and at busy moments.'
    },
    {
      kind: 'bars', id: 'stop-loss',
      title: 'A stop order is not a guaranteed exit price',
      goal: 'A stop-loss order becomes a market order once the price reaches the stop. Step through six SAMPLE days of a stock bought at $50 with a stop at $45 to see why an overnight gap can skip the stop, and why position size is the firmer limit.',
      tape: 'SAMPLE stock · daily bars · 100 shares · simulated',
      start: 2,
      bars: [
        bar('Day 1', [50, 51, 49.5, 50.5], 'Day 1: buy 100 SAMPLE shares at $50 with a stop at $45. The planned worst case is a $500 loss.', 'A stop is decided before emotions arrive. It turns a vague plan into a number you can size against.', {readout: 'Stop $45'}),
        bar('Day 2', [50.5, 51, 47, 47.5], 'Day 2: the stock slides to $47.50; the stop is not touched.', 'Normal swings can come close. A stop set too tight sells on noise; use the ticker’s past swings to set the distance.', {readout: 'Stop $45'}),
        bar('Day 3', [47.5, 48.5, 46, 48], 'Day 3: a small bounce to $48.', 'Nothing is wrong yet. The risk in the next bar is that the stock does not trade through $45 at all; it jumps past it.', {readout: 'Stop $45'}),
        bar('Day 4', [41, 42, 39, 40], 'Day 4: earnings (E) miss after the close, and the stock opens at $41. The stop sells near $41: a $900 loss, not $500.', 'A stop cannot fill at a price that never trades. Overnight gaps skip straight through it, and a stop-limit order might not fill at all.', {mark: 'earnings', readout: 'Sold near $41'}),
        bar('Day 5', [40, 44, 39.5, 43.5], 'Day 5: the stock rebounds to $43.50, without you.', 'Stops can sell near a low in a fast move. That is a trade-off to accept knowingly, not a flaw to ignore.'),
        bar('Day 6', [43.5, 46, 43, 45.5], 'Day 6: the stock closes at $45.50, above the stop.', 'If a gap can turn a $500 plan into $900, size the position so the gap case still fits your limit. The downside simulation shows the sizing step.')
      ],
      takeaway: 'Order types shape how you exit, but a stop is not a guaranteed price. Position size is the limit a gap cannot skip.'
    }
  ];

  // Underlined phrases in each theme's catalog text: [exact phrase from the catalog, simulation id].
  const themeRefs = {
    gold: {connection: [['real interest rates, the dollar', 'gold-rates'], ['Gold miners also face business and operating risks.', 'wrapper']]},
    silver: {connection: [['Bullion funds and silver miners give different exposure.', 'wrapper']]},
    oil: {description: [['crude oil futures', 'futures-roll']], connection: [['inventories', 'backwardation'], ['An oil company or stock ETF is not a direct crude-price tracker.', 'producer']]},
    gas: {description: [['gas futures', 'futures-roll']], connection: [['storage', 'backwardation'], ['Exporters and producers can have different sensitivities.', 'producer']]},
    fertilizer: {connection: [['Gas costs are especially important for nitrogen producers.', 'margin']]},
    resin: {connection: [['natural-gas and oil feedstock costs', 'margin'], ['These shares are not a direct resin-price tracker.', 'producer']]},
    copper: {description: [['copper futures', 'futures-roll']], connection: [['A mining company adds operating and country risks.', 'producer']]},
    uranium: {connection: [['Read fund holdings to see how much exposure is actually uranium.', 'holdings']]},
    agriculture: {connection: [['Crop-futures funds and an equipment maker have very different economics.', 'wrapper']]},
    property: {description: [['real-estate investment trusts', 'ffo']], connection: [['borrowing costs', 'cap-rate']]},
    technology: {connection: [['A sector fund spreads company risk across the industry.', 'correlation'], ['the price investors already pay', 'ai']]},
    semiconductors: {connection: [['One chip company is not the same exposure as the basket.', 'ai']]},
    communication: {description: [['the sector fund that groups them', 'concentration']], connection: [['Advertising, user growth, and regulation', 'ad-cycle']]},
    financials: {connection: [['Interest rates, credit losses, and regulation', 'nim'], ['A bank and a payment network are not the same business.', 'nim']]},
    'health-care': {connection: [['Product cycles, patents', 'patent-cliff']]},
    energy: {connection: [['Oil and gas prices are only one input.', 'producer']]},
    industrials: {connection: [['margins and backlogs decide how that becomes profit', 'margin']]},
    materials: {connection: [['A materials fund mixes businesses with different cost structures.', 'holdings']]},
    discretionary: {connection: [['A fund can be concentrated in a few very large holdings.', 'concentration']]},
    staples: {connection: [['Steadier demand does not make the shares immune to costs, competition, or a high starting price.', 'defensive']]},
    utilities: {connection: [['Utility shares can also move with bond yields.', 'defensive']]},
    'real-estate': {description: [['real-estate investment trusts', 'ffo']], connection: [['borrowing costs', 'cap-rate']]},
    'large-cap': {connection: [['Large-cap funds are dominated by their biggest holdings.', 'concentration'], ['A rising index can still leave many companies behind.', 'breadth']]},
    'mid-cap': {connection: [['Mid-sized companies can be more sensitive to the U.S. economy than the largest firms.', 'size-beta'], ['Read the current holdings before treating the fund as one industry.', 'holdings']]},
    'small-cap': {connection: [['Smaller companies can swing more than the large-cap market.', 'size-beta'], ['Many rely more on borrowing, so financing costs can weigh on profits.', 'refinance']]},
    'total-market': {connection: [['Total-market funds are still weighted toward the largest companies.', 'concentration']]},
    developed: {connection: [['Currency moves', 'dollar'], ['the country mix', 'country-mix']]},
    emerging: {connection: [['currencies', 'dollar'], ['a heavy weight in a few countries can dominate the fund', 'country-mix']]},
    'growth-style': {connection: [['The fund can fall hard when investors pay less for future profits.', 'ai']]},
    value: {connection: [['A value label is a classification, not proof of a bargain.', 'value-trap']]},
    dividend: {connection: [['The share price can fall by more than the payout, and the payout can be cut.', 'dividend']]},
    'bond-market': {connection: [['Bond prices generally move opposite to yields.', 'yields'], ['Longer-term funds move more when yields change.', 'duration']]},
    'commodity-market': {connection: [['futures returns can differ from the spot price', 'futures-roll']]},
    'currency-market': {connection: [['UUP tracks a defined basket.', 'dollar']]},
    inflation: {connection: [['None is a guaranteed short-term inflation hedge', 'inflation']]},
    rates: {connection: [['Longer duration means more sensitivity.', 'duration'], ['A rate cut does not guarantee that every bond or property fund rises.', 'yields']]},
    dollar: {connection: [['Interest-rate differences', 'dollar']]},
    growth: {description: [['industries connected to business activity', 'rotation']], connection: [['Strong economic data can also lift interest-rate expectations', 'yields']]},
    ai: {connection: [['An AI theme alone does not establish a company’s future profit.', 'ai']]},
    infrastructure: {connection: [['timing, margins, capacity, and borrowing costs determine how that becomes profit', 'margin']]},
    slowdown: {description: [['often researched during a slowdown', 'rotation']], connection: [['Relatively steady demand does not make a stock safe from losses.', 'defensive']]},
    transition: {connection: [['Policy, financing costs, project demand', 'policy-capex'], ['Each part of the energy transition has different risks.', 'holdings']]}
  };

  // Underlined phrases in the "What you would own" notes (EXPOSURE_TYPES in js/app.js).
  const exposureRefs = {
    business: [['One company can move very differently from its theme.', 'producer']],
    stockFund: [['Owning many companies lowers single-company risk', 'correlation'], ['Check the holdings', 'holdings'], ['the index it follows', 'tracking'], ['the expense ratio', 'fees']],
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
