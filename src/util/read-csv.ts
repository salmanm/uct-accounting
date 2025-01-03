import { createReadStream } from 'fs'
import csvParser from 'csv-parser'

async function* parseCsv(filePath: string) {
  const stream = createReadStream(filePath).pipe(csvParser())

  for await (const record of stream) {
    yield record
  }
}

export async function readCsv<T>(filePath: string, handleRecord: (record: T, index: number) => Promise<boolean>) {
  const recordGenerator = parseCsv(filePath)
  let index = 0

  for await (const record of recordGenerator) {
    const shouldContinue = await handleRecord(record, index++)

    if (!shouldContinue) {
      break
    }
  }

  console.log('Finished processing CSV')
}
