import { parse } from 'node-html-parser'

import { camelize } from './text'

function getSP500TableText(child) {
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
    .map((th) => th.childNodes.map(getSP500TableText).join(' ').trim())

  return htmlTree
    .querySelector('table')
    .querySelectorAll('tr')
    .map((tr) => tr.childNodes.map(getSP500TableText).filter(Boolean))
    .splice(1)
    .map((company) => {
      const data = {}

      for (const [index, header] of tableHeaders.entries()) {
        // console.log(header)
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
