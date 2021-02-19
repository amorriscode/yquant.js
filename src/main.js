import ticker from './ticker'
import market from './market'

async function ok() {
  console.log(await ticker.cashFlow('aapl'))
}

ok()

export default {
  ...ticker,
  ...market,
}
