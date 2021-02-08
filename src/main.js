import ticker, { getTicker } from './ticker'
import { nasdaq } from './market'

getTicker('aapl')
nasdaq()

export default {
  ticker,
}
