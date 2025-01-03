export type TXN = {
  timestamp: number
  payer: string
  date: string
  txnId: string
  amount: number
  status: string
  notes: string
  branch: string // 'TALOJA' | 'HFC' | 'ULWE' | 'K35' | 'K12'
}

export type Contact = {
  id: string
  name: string
}
