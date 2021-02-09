import ftp from 'basic-ftp'

import { NASDAQ_URL } from './constants'
import DataStream from './utils/DataStream'

function transformRawNasdaqData(data) {
  return data
    .join('')
    .split('\r\n')
    .filter((stock) => !stock.includes(' test '))
    .map((stock) => {
      const [ticker, name] = stock.split('|')
      return { ticker, name }
    })
}

export async function nasdaq() {
  const nasdaqData = {}

  const client = new ftp.Client()

  const rawNasdaqListedData = new DataStream()
  const rawNasdaqOtherData = new DataStream()

  try {
    await client.access({
      host: NASDAQ_URL,
    })

    // Get data from Nasdaq FTP
    await client.cd('SymbolDirectory')
    await client.downloadTo(rawNasdaqListedData, 'nasdaqlisted.txt')
    await client.downloadTo(rawNasdaqOtherData, 'otherlisted.txt')

    // Parse both datasets retrieved from Nasdaq FTP
    const parsedNasdaqListedData = transformRawNasdaqData(
      rawNasdaqListedData.chunks
    )
    const parsedNasdaqOtherData = transformRawNasdaqData(
      rawNasdaqOtherData.chunks
    )

    // Merge both datasets, making sure we have no duplicates
    for (const company of parsedNasdaqListedData) {
      nasdaqData[company.ticker] = company
    }

    for (const company of parsedNasdaqOtherData) {
      nasdaqData[company.ticker] = company
    }
  } catch (err) {
    console.log(err)
  }

  client.close()

  return Object.values(nasdaqData)
}

export default {
  nasdaq,
}
