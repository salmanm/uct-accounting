/* eslint-disable no-constant-condition */
import Redis from 'ioredis'
import { processTxn } from './process-txn'

const redis = new Redis({ host: 'localhost', port: 6379 })

const TXN_ZSET = 'uct_gpay_txn_sorted'
const TXN_HASH = 'uct_gpay_txn_values'

let counter = 0
async function readFromRedis() {
  let skip = true

  while (true) {
    const [txnId] = await redis.zrange(TXN_ZSET, counter, counter++)

    if (!txnId) {
      console.log('No more transactions to process.')
      break
    }

    if (skip) {
      console.log('Skipping...', counter, txnId)
      if (txnId === 'CICAgPC3pfarRQ') skip = false
      continue
    }

    const value = await redis.hget(TXN_HASH, txnId)

    if (!value) {
      console.log(`Transaction ${txnId} has no associated value.`)
      break
    }

    await processTxn(JSON.parse(value))

    console.log(`${counter} transaction processed`, txnId)
    console.log('-----------------------------------')
  }

  await redis.disconnect()
}

readFromRedis()
