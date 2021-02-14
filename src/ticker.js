import { getChartData } from './yfinance'

export async function getTicker(ticker) {
  const tickerData = await getChartData(ticker)
  return tickerData
}

export default {
  getTicker,
}
