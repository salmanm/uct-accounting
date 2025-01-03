import type { TXN } from './types'
import { createSalesReceipt } from './create-sales-receipt'
import { getOrCreateContact } from './get-contact'

export async function processTxn(txn: TXN) {
  const contact = await getOrCreateContact(txn.payer)

  await createSalesReceipt(txn, contact)
}
