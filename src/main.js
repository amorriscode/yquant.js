import ticker from './ticker'
import market from './market'

async function ok() {
  await ticker.incomeStatement('aapl')
}

ok()

export default {
  ...ticker,
  ...market,
}
