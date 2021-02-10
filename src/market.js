import ftp from 'basic-ftp'
import got from 'got'

import { NASDAQ_URL, SP500_URL } from './constants'

import DataStream from './utils/DataStream'
import { parseSP500Data, parseNasdaqData } from './utils/data'

export async function nasdaq() {
  const nasdaqData = {}

  const client = new ftp.Client()

  // Create DataStream to load the FTP files into
  const rawNasdaqListedData = new DataStream()
  const rawNasdaqOtherData = new DataStream()

  try {
    // Login to the Nasdaq FTP
    await client.access({
      host: NASDAQ_URL,
    })

    // Get data from Nasdaq FTP
    await client.cd('SymbolDirectory')
    await client.downloadTo(rawNasdaqListedData, 'nasdaqlisted.txt')
    await client.downloadTo(rawNasdaqOtherData, 'otherlisted.txt')

    // Parse both datasets retrieved from Nasdaq FTP
    const parsedNasdaqListedData = parseNasdaqData(rawNasdaqListedData.chunks)
    const parsedNasdaqOtherData = parseNasdaqData(rawNasdaqOtherData.chunks)

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

export async function sp500() {
  // Get S&P 500 data from Wikipedia
  const response = await got(SP500_URL)
  // Turn the HTML table into JSON
  return parseSP500Data(response.body)
}

export default {
  nasdaq,
  sp500,
}
