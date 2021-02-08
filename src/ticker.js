import got from 'got'

import { BASE_URL } from './constants'

export async function getTicker(ticker) {
  const response = await got(`${BASE_URL}/${ticker}`)
  console.log(response.body)
}

export default {
  getTicker,
}
