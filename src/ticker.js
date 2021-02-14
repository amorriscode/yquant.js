import got from 'got'

import {
  YAHOO_FINANCE_CHART_URL,
  YAHOO_FINANCE_QUOTE_URL,
  YAHOO_TIMESERIES_URL,
} from './constants'
import {
  parseYahooFinanceSummary,
  parseYahooFinanceStats,
  parseYahooFinanceIncomeStatement,
} from './utils/data'

export async function chartData(
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

export async function summary(ticker) {
  const response = await got(`${YAHOO_FINANCE_QUOTE_URL}/${ticker}`, {
    searchParams: { p: ticker },
  })
  return parseYahooFinanceSummary(response.body)
}

export async function statistics(ticker) {
  const response = await got(
    `${YAHOO_FINANCE_QUOTE_URL}/${ticker}/key-statistics?p=${ticker}`
  )
  return parseYahooFinanceStats(response.body)
}

export async function incomeStatement(ticker, period = 'annual') {
  const metric = [
    'TotalRevenue',
    'CostOfRevenue',
    'GrossProfit',
    'OperatingExpense',
    'OperatingIncome',
    'PretaxIncome',
    'TaxProvision',
    'DilutedNIAvailtoComStockholders',
    'BasicEPS',
    'DilutedEPS',
    'BasicAverageShares',
    'DilutedAverageShares',
    'TotalOperatingIncomeAsReported',
    'TotalExpenses',
    'NetIncomeFromContinuingAndDiscontinuedOperation',
    'NormalizedIncome',
    'InterestExpense',
    'NetInterestIncome',
    'EBIT',
    'EBITDA',
    'ReconciledCostOfRevenue',
    'ReconciledDepreciation',
    'NetIncomeFromContinuingOperationNetMinorityInterest',
    'NormalizedEBITDA',
    'TaxRateForCalcs',
    'TaxEffectOfUnusualItems',
  ]

  const response = await got(`${YAHOO_TIMESERIES_URL}/${ticker}`, {
    searchParams: {
      type: metric.map((type) => `${period}${type},trailing${type}`).join(','),
      period1: '493590046',
      period2: `${new Date().getTime()}`.slice(0, 10),
      merge: 'false',
      padTimeSeries: 'true',
    },
  })

  return parseYahooFinanceIncomeStatement(metric, period, response.body)
}

export default {
  chartData,
  summary,
  statistics,
  incomeStatement,
}
