import got from 'got'

import {
  YAHOO_FINANCE_CHART_URL,
  YAHOO_FINANCE_QUOTE_URL,
  YAHOO_TIMESERIES_URL,
} from './constants'
import {
  parseYahooFinanceSummary,
  parseYahooFinanceStats,
  parseYahooFinanceFinancials,
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
  const metrics = [
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
      type: metrics.map((type) => `${period}${type},trailing${type}`).join(','),
      period1: '493590046',
      period2: `${new Date().getTime()}`.slice(0, 10),
      merge: 'false',
      padTimeSeries: 'true',
    },
  })

  return parseYahooFinanceFinancials(metrics, period, response.body)
}

export async function balanceSheet(ticker, period = 'annual') {
  const metrics = [
    'TotalAssets',
    'TotalLiabilitiesNetMinorityInterest',
    'TotalEquityGrossMinorityInterest',
    'TotalCapitalization',
    'CommonStockEquity',
    'NetTangibleAssets',
    'WorkingCapital',
    'InvestedCapital',
    'TangibleBookValue',
    'TotalDebt',
    'NetDebt',
    'ShareIssued',
    'OrdinarySharesNumber',
  ]

  const response = await got(`${YAHOO_TIMESERIES_URL}/${ticker}`, {
    searchParams: {
      type: metrics.map((type) => `${period}${type},trailing${type}`).join(','),
      period1: '493590046',
      period2: `${new Date().getTime()}`.slice(0, 10),
      merge: 'false',
      padTimeSeries: 'true',
    },
  })

  return parseYahooFinanceFinancials(metrics, period, response.body)
}

export async function cashFlow(ticker, period = 'annual') {
  const metrics = [
    'OperatingCashFlow',
    'InvestingCashFlow',
    'FinancingCashFlow',
    'EndCashPosition',
    'IncomeTaxPaidSupplementalData',
    'InterestPaidSupplementalData',
    'CapitalExpenditure',
    'IssuanceOfCapitalStock',
    'IssuanceOfDebt',
    'RepaymentOfDebt',
    'RepurchaseOfCapitalStock',
    'FreeCashFlow',
  ]

  const response = await got(`${YAHOO_TIMESERIES_URL}/${ticker}`, {
    searchParams: {
      type: metrics.map((type) => `${period}${type},trailing${type}`).join(','),
      period1: '493590046',
      period2: `${new Date().getTime()}`.slice(0, 10),
      merge: 'false',
      padTimeSeries: 'true',
    },
  })

  return parseYahooFinanceFinancials(metrics, period, response.body)
}

export default {
  chartData,
  summary,
  statistics,
  incomeStatement,
  balanceSheet,
  cashFlow,
}
