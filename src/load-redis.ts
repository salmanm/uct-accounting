import { join } from 'path'
import { cwd } from 'process'
import Redis from 'ioredis'
import { parse } from 'date-fns'
import type { TXN } from './types'
import { readCsv } from './util/read-csv'

const redis = new Redis({ host: 'localhost', port: 6379 })
const csvFile = 'ulwe_gpay_2024-04-01_2025-01-31.csv'
const csvPath = join(cwd(), 'data', csvFile)
const BATCH_SIZE = 500

type Rec = {
  'Payer/Receiver': string
  'Paid via': string
  Type: string
  'Creation time': string
  'Transaction ID': string
  Amount: number
  'Processing fee': string
  'Net amount': number
  Status: string
  'Update time': string
  Notes: string
}

function mapTxn(row: Rec): TXN {
  return {
    timestamp: parse(row['Creation time'], 'yyyy-MM-dd HH:mm:ss', new Date()).getTime(),
    payer: row['Payer/Receiver'],
    date: row['Creation time'].split(' ')[0],
    txnId: row['Transaction ID'],
    amount: row.Amount,
    status: row.Status,
    notes: row.Notes,
    branch: csvFile.split('_')[0].toUpperCase(),
  }
}

const TXN_ZSET = 'uct_gpay_txn_sorted'
const TXN_HASH = 'uct_gpay_txn_values'

async function loadIntoRedis() {
  let counter = 0

  await readCsv<Rec>(csvPath, async (record, index) => {
    counter += 1

    const txn = mapTxn(record)

    const exists = await redis.hexists(TXN_HASH, txn.txnId)

    if (exists) {
      console.log(`Transaction ${txn.txnId} already exists. Skipping...`)
      return false
    }

    redis.zadd(TXN_ZSET, txn.timestamp, txn.txnId)
    redis.hset(TXN_HASH, txn.txnId, JSON.stringify(txn))

    if (index > 0 && index % BATCH_SIZE === 0) {
      console.log(`Saved ${index + 1} transactions...`)
      counter = 0
    }

    return true
  })

  if (counter > 0) console.log(`Saved ${counter} transactions...`)

  console.log('All transactions saved successfully!')
  await redis.disconnect()
}

loadIntoRedis()
