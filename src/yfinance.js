import got from 'got'

import { YAHOO_FINANCE_CHART_URL } from './constants'

export async function getData(
  endpoint,
  params = { startDate: 7223400, interval: '1d' }
) {
  return await got(`${YAHOO_FINANCE_CHART_URL}/${endpoint}`, {
    searchParams: {
      interval: params.interval,
      period1: new Date(params.startDate).getTime(),
      period2: params.endDate
        ? new Date(params.endDate).getTime()
        : new Date().getTime(),
    },
  }).json()
}

export default {
  getData,
}
