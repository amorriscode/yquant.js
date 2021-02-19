import { parse } from 'node-html-parser'

import { camelize } from './text'

function getTableText(child) {
  if (child.rawTag && child.rawTag === 'a') {
    return child.childNodes.find((child) => child.hasOwnProperty('rawText'))
  }

  return child.rawText.trim()
}

export function parseSP500Data(html) {
  const htmlTree = parse(html)

  const table = htmlTree.querySelector('table').querySelectorAll('tr')

  const tableHeaders = table[0].childNodes.map(getTableText).filter(Boolean)

  return table
    .slice(1)
    .map((tr) => tr.childNodes.map(getTableText).filter(Boolean))
    .map((company) => {
      const data = {}

      for (const [index, header] of tableHeaders.entries()) {
        data[camelize(header)] = company[index]
      }

      return data
    })
}

export function parseNasdaqData(data) {
  return data
    .join('')
    .split('\r\n')
    .filter((stock) => !stock.includes(' test '))
    .map((stock) => {
      const [ticker, name] = stock.split('|')
      return { ticker, name }
    })
}

export function parseYahooFinanceSummary(html) {
  const summary = {}

  parse(html)
    .querySelector('#quote-summary')
    .querySelectorAll('table')
    .forEach((table) => {
      table
        .querySelectorAll('tr')
        .map((tr) => tr.childNodes.map(getTableText).filter(Boolean))
        .forEach(([header, value]) => {
          let key

          header = header.replace(/ \([^)]*\)/g, '')

          // Handle some special key cases
          switch (header) {
            case 'Day&#x27;s Range':
              key = 'daysRange'
              break
            case '52 Week Range':
              key = 'fiftyTwoWeekRange'
              break
            case 'Beta':
              key = 'betaFiveYearMonthly'
              break
            case '1y Target Est':
              key = 'oneYearTarget'
              break
            default:
              key = camelize(header)
          }

          summary[key] = value
        })
    })

  return summary
}

export function parseYahooFinanceStats(html) {
  const htmlTree = parse(html)

  const stats = {
    valuationMeasures: {},
    financialHighlights: {
      fiscalYear: {},
      profitability: {},
      managementEffectiveness: {},
      incomeStatement: {},
      balanceSheet: {},
      cashFlowStatement: {},
    },
    tradingInformation: {
      stockPriceHistory: {},
      shareStatistics: {},
      dividensAndSplits: {},
    },
  }

  const transformers = [
    {
      headers: [
        'Market Cap',
        'Enterprise Value',
        'Trailing P/E',
        'Forward P/E',
        'PEG Ratio',
        'Price/Sales',
        'Price/Book',
        'Enterprise Value/Revenue',
        'Enterprise Value/EBITDA',
      ],
      transform: (header, value) => {
        header = header.replace(/ \([^)]*\)/g, '')
        stats.valuationMeasures[camelize(header)] = value
      },
    },
    {
      headers: ['Fiscal Year Ends', 'Most Recent Quarter'],
      transform: (header, value) => {
        header = header.replace(/ \([^)]*\)/g, '')
        stats.financialHighlights.fiscalYear[camelize(header)] = value
      },
    },
    {
      headers: ['Profit Margin', 'Operating Margin'],
      transform: (header, value) => {
        header = header.replace(/ \([^)]*\)/g, '')
        stats.financialHighlights.profitability[camelize(header)] = value
      },
    },
    {
      headers: ['Return on Assets', 'Return on Equity'],
      transform: (header, value) => {
        header = header.replace(/ \([^)]*\)/g, '')
        stats.financialHighlights.managementEffectiveness[
          camelize(header)
        ] = value
      },
    },
    {
      headers: [
        'Revenue',
        'Revenue Per Share',
        'Quarterly Revenue Growth',
        'Gross Profit',
        'EBITDA',
        'Net Income Avi to Common',
        'Diluted EPS',
        'Quarterly Earnings Growth',
      ],
      transform: (header, value) => {
        header = header.replace(/ \([^)]*\)/g, '')
        stats.financialHighlights.incomeStatement[camelize(header)] = value
      },
    },
    {
      headers: [
        'Total Cash',
        'Total Cash Per Share',
        'Total Debt',
        'Total Debt/Equity',
        'Current Ratio',
        'Book Value Per Share',
      ],
      transform: (header, value) => {
        header = header.replace(/ \([^)]*\)/g, '')
        stats.financialHighlights.balanceSheet[camelize(header)] = value
      },
    },
    {
      headers: ['Operating Cash Flow', 'Levered Free Cash Flow'],
      transform: (header, value) => {
        header = header.replace(/ \([^)]*\)/g, '')
        stats.financialHighlights.cashFlowStatement[camelize(header)] = value
      },
    },
    {
      headers: [
        'Beta (5Y Monthly)',
        '52-Week Change',
        'S&P500 52-Week Change',
        '52 Week High',
        '52 Week Low',
        '50-Day Moving Average',
        '200-Day Moving Average',
      ],
      transform: (header, value) => {
        let key

        switch (header) {
          case 'Beta (5Y Monthly)':
            key = 'betaFiveYearMonthly'
            break
          case '52-Week Change':
            key = 'fiftyTwoWeekChange'
            break
          case 'S&P500 52-Week Change':
            key = 'spFiftyTwoWeekChange'
            break
          case '52 Week High':
            key = 'fiftyTwoWeekHigh'
            break
          case '52 Week Low':
            key = 'fiftyTwoWeekLow'
            break
          case '50-Day Moving Average':
            key = 'fiftyDayMovingAverage'
            break
          case '200-Day Moving Average':
            key = 'twoHundredDayMovingAverage'
            break
          default:
            key = camelize(header)
        }

        stats.tradingInformation.stockPriceHistory[key] = value
      },
    },
    {
      headers: [
        'Avg Vol (3 month)',
        'Avg Vol (10 day)',
        'Shares Outstanding',
        'Float',
        '% Held by Insiders',
        '% Held by Institutions',
        'Shares Short',
        'Short Ratio',
        'Short % of Float',
        'Short % of Shares Outstanding',
        'Shares Short',
      ],
      transform: (header, value) => {
        let key
        header = header.replace('%', 'Percent')

        switch (header) {
          case 'Avg Vol (3 month)':
            key = 'avgVolThreeMonth'
            break
          case 'Avg Vol (10 day)':
            key = 'avgVolTenDay'
            break
          default:
            header = header.replace(/ \([^)]*\)/g, '')
            key = camelize(header)
        }

        stats.tradingInformation.shareStatistics[key] = value
      },
    },
    {
      headers: [
        'Forward Annual Dividend Rate',
        'Forward Annual Dividend Yield',
        'Trailing Annual Dividend Rate',
        'Trailing Annual Dividend Yield',
        '5 Year Average Dividend Yield',
        'Payout Ratio',
        'Dividend Date',
        'Ex-Dividend Date',
        'Last Split Factor',
        'Last Split Date',
      ],
      transform: (header, value) => {
        const key =
          header === '5 Year Average Dividend Yield'
            ? 'fiveYearAverageDividendYield'
            : camelize(header)

        stats.tradingInformation.dividensAndSplits[key] = value
      },
    },
  ]

  const rows = htmlTree
    .querySelectorAll('table')
    .flatMap((table) =>
      table
        .querySelectorAll('tr')
        .map((tr) => tr.childNodes.map(getTableText).filter(Boolean))
    )

  for (const [header, value] of rows) {
    const headerExists = (h) => header.includes(h)

    // Remove footnotes
    let transformedHeader = header.replace(/ \d+$/, '')

    // Transform headers
    for (const { headers, transform } of transformers) {
      if (headers.some(headerExists)) {
        transform(transformedHeader, value)
        continue
      }
    }
  }

  return stats
}

export function parseYahooFinanceFinancials(metrics, period, data) {
  const parsedData = JSON.parse(data).timeseries.result

  const nonTrailingData = parsedData.filter(
    (data) => !data.meta.type[0].includes('trailing')
  )

  const trailingData = parsedData.filter((data) =>
    data.meta.type[0].includes('trailing')
  )

  const incomeStatement = {}

  // Get headers from a sample of the data
  const sampleData = nonTrailingData[0]
  const headers = sampleData[sampleData.meta.type[0]].map(
    (data) => data.asOfDate
  )

  for (const metric of metrics) {
    const key = camelize(metric.split(/(?=[A-Z])/).join(' '))
    incomeStatement[key] = { ttm: '-' }

    for (const header of headers) {
      incomeStatement[key][header] = '-'
    }
  }

  for (const metric of nonTrailingData) {
    const metricType = metric.meta.type[0]

    const key = camelize(
      metricType
        .replace(period, '')
        .split(/(?=[A-Z])/)
        .join(' ')
    )

    if (metric[metricType]) {
      metric[metricType].forEach((data) => {
        incomeStatement[key][data.asOfDate] = data.reportedValue.raw
      })
    }
  }

  for (const metric of trailingData) {
    const metricType = metric.meta.type[0]

    const key = camelize(
      metricType
        .replace('trailing', '')
        .split(/(?=[A-Z])/)
        .join(' ')
    )

    if (metric[metricType]) {
      metric[metricType].forEach((data) => {
        incomeStatement[key].ttm = data.reportedValue.raw
      })
    }
  }

  return incomeStatement
}

export function parseYahooFinanceAnalysis(ticker, html) {
  const htmlTree = parse(html)

  const analysis = {
    earningsEstimate: [],
    revenueEstimate: [],
    earningsHistory: [],
    epsTrend: [],
    epsRevisions: [],
    growthEstimates: [],
  }

  htmlTree.querySelectorAll('table').forEach((table) => {
    const tableHeaders = table
      .querySelectorAll('th')
      .map(getTableText)
      .filter(Boolean)

    const tableName = camelize(tableHeaders[0])

    table
      .querySelectorAll('tr')
      .slice(1)
      .forEach((row) => {
        const rowData = row
          .querySelectorAll('td')
          .map(getTableText)
          .filter(Boolean)

        const data = {}

        for (let [index, header] of tableHeaders.entries()) {
          header = header
            .replace(/ \([^)]*\)/g, '')
            .replace(/\(s\)/g, '')
            .replace(/Qtr./g, 'Quarter')

          switch (header) {
            case 'S&amp;P 500':
              header = 'sp500'
              break
            case ticker.toUpperCase():
              header = 'ticker'
              break
            default:
              // Camelize if we don't come across a date
              if (!/[0-9]\/[0-9][0-9]\/[0-9][0-9][0-9][0-9]/.test(header)) {
                header = camelize(header)
              }
          }

          if (header === tableName) {
            header = 'rowName'
          }
          // console.log(header)
          data[header] = rowData[index]
        }

        if (analysis[tableName]) {
          analysis[tableName].push(data)
        }
      })
  })

  return analysis
}
