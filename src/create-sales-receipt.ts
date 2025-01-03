import type { TXN, Contact } from './types'
import { zohoApi } from './util/api'
import { ZohoCreateSuccessResponse, ZohoSalesReceipt, ZohoSearchResponse } from './zoho'

const junkNotes = [
  'Payment from PhonePe',
  'NA',
  'Paid via CRED',
  'Paid via Navi',
  'Paid via SuperMoney UPI',
  'Sent using Paytm UPI',
  'UPI',
].map(note => note.toLowerCase())

function sanitizeNotes(notes: string) {
  if (junkNotes.includes(notes.toLowerCase().trim()) || notes.trim() === '') {
    return 'Donation'
  }

  return notes
}

async function findSalesReceipt(txnId: string) {
  const { data } = await zohoApi<ZohoSearchResponse<'sales_receipt'>>({
    method: 'GET',
    endpoint: 'salesreceipts',
    query: { reference_number: txnId },
  })

  return data.sales_receipts.length > 0
}

export async function createSalesReceipt(txn: TXN, payer: Contact) {
  const exist = await findSalesReceipt(txn.txnId)

  if (exist) {
    console.log(`Sales receipt for transaction ${txn.txnId} already exists.`)
    return
  }

  console.log(`Creating sales receipt for transaction ${txn.txnId}`)

  const payload: Partial<ZohoSalesReceipt> = {
    customer_id: payer.id,
    customer_name: payer.name,
    reference_number: txn.txnId,
    date: new Date(txn.timestamp).toISOString().split('T')[0],
    line_items: [{ name: sanitizeNotes(txn.notes), rate: txn.amount, quantity: 1.0 }],
    payment_mode: 'UPI',
    deposit_to_account_id: '2244402000000051012',
    custom_fields: [
      {
        value: txn.branch,
        customfield_id: '2244402000000059051',
      },
    ],
  }

  const { data } = await zohoApi<ZohoCreateSuccessResponse<'sales_receipt'>>({
    method: 'POST',
    endpoint: 'salesreceipts',
    body: payload,
  })

  console.log('Sales receipt created:', data.sales_receipt_details.sales_receipt_id)
  return data.sales_receipt_details
}
