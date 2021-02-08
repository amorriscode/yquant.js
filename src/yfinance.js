import got from 'got'

import { BASE_URL } from './constants'

export async function getData(
  endpoint,
  params = { startDate: 7223400, interval: '1d' }
) {
  const response = await got(`${BASE_URL}/${endpoint}`, {
    searchParams: {
      interval: params.interval,
      period1: new Date(params.startDate).getTime(),
      period2: params.endDate
        ? new Date(params.endDate).getTime()
        : new Date().getTime(),
    },
  }).json()

  return response
}

export default {
  getData,
}
