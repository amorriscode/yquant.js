import { getData } from './yfinance'

export async function getTicker(ticker) {
  const tickerData = await getData(ticker)
  return tickerData
}

export default {
  getTicker,
}
