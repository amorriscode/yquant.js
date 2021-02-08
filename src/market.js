import ftp from 'basic-ftp'

import { NASDAQ_URL } from './constants'
import DataStream from './utils/DataStream'

export async function nasdaq() {
  const client = new ftp.Client()
  const rawNasdaqListedData = new DataStream()
  const rawNasdaqOtherData = new DataStream()

  try {
    await client.access({
      host: NASDAQ_URL,
    })

    await client.cd('SymbolDirectory')
    await client.downloadTo(rawNasdaqListedData, 'nasdaqlisted.txt')
    await client.downloadTo(rawNasdaqOtherData, 'otherlisted.txt')
  } catch (err) {
    console.log(err)
  }

  client.close()
}

export default {
  nasdaq,
}
