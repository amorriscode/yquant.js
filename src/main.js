import ticker from './ticker'
import market from './market'

async function ok() {
  await ticker.analysis('aapl')
}

ok()

export default {
  ...ticker,
  ...market,
}
