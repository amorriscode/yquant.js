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

  const tableHeaders = htmlTree
    .querySelector('table')
    .querySelectorAll('th')
    .map((th) => th.childNodes.map(getTableText).join(' ').trim())

  return htmlTree
    .querySelector('table')
    .querySelectorAll('tr')
    .map((tr) => tr.childNodes.map(getTableText).filter(Boolean))
    .splice(1)
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
  const htmlTree = parse(html)
  const quoteSummary = htmlTree.querySelector('#quote-summary')

  const summary = {}

  quoteSummary.querySelectorAll('table').forEach((table) => {
    table
      .querySelectorAll('tr')
      .map((tr) => tr.childNodes.map(getTableText).filter(Boolean))
      .forEach(([header, value]) => {
        let key

        // Handle some special key cases
        switch (header) {
          case 'Day&#x27;s Range':
            key = 'daysRange'
            break
          case '52 Week Range':
            key = 'fiftyTwoWeekRange'
            break
          case 'Beta (5Y Monthly)':
            key = 'betaFiveYearMonthly'
            break
          case '1y Target Est':
            key = 'oneYearTarget'
            break
          default:
            key = camelize(header)
        }

        // Replace janky TTM from the few keys that have it
        key = key.replace('Ttm)', '')

        summary[key] = value
      })
  })

  return summary
}
