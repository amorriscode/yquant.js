import ticker from './ticker'
import market, { sp500 } from './market'

sp500()

export default {
  ...ticker,
  ...market,
}
