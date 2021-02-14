import got from 'got'

import { YAHOO_FINANCE_CHART_URL, YAHOO_FINANCE_QUOTE_URL } from './constants'
import { parseYahooFinanceSummary, parseYahooFinanceStats } from './utils/data'

export async function getChartData(
  ticker,
  params = { startDate: 7223400, interval: '1d' }
) {
  return await got(`${YAHOO_FINANCE_CHART_URL}/${ticker}`, {
    searchParams: {
      interval: params.interval,
      period1: new Date(params.startDate).getTime(),
      period2: params.endDate
        ? new Date(params.endDate).getTime()
        : new Date().getTime(),
    },
  }).json()
}

export async function getSummary(ticker) {
  const response = await got(`${YAHOO_FINANCE_QUOTE_URL}/${ticker}?p=${ticker}`)
  return parseYahooFinanceSummary(response.body)
}

export async function getStats(ticker) {
  const response = await got(
    `${YAHOO_FINANCE_QUOTE_URL}/${ticker}/key-statistics?p=${ticker}`
  )
  return parseYahooFinanceStats(response.body)
}

export default {
  getChartData,
  getTicker,
  getSummary,
  getStats,
}
