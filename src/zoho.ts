type Pluralize<T extends string> = T extends 'contact'
  ? 'contacts'
  : T extends 'sales_receipt'
    ? 'sales_receipts'
    : never

export type ZohoSalesReceipt = {
  sales_receipt_id: string
  customer_id: string
  customer_name: string
  reference_number: string
  date: string
  line_items: [{ name: string; rate: number; quantity: 1.0 }]
  payment_mode: 'UPI'
  deposit_to_account_id: '2244402000000051012' // AXIS
  tags: []
  custom_fields: [
    {
      value: string
      customfield_id: '2244402000000059051'
    },
  ]
}

export type ZohoContact = {
  contact_id: string
  contact_name: string
  contact_type: 'customer'
  currency_id: '2244402000000000064'
  first_name: ''
  last_name: ''
  email: ''
  phone: ''
  mobile: ''
  created_time: '2025-02-03T13:56:20+0530'
  last_modified_time: '2025-02-03T13:56:20+0530'
  custom_fields: []
  custom_field_hash: Record<string, string>
  tags: []
  pan_no: ''
}

export type ZohoSearchResponse<T extends EntityTypes> = {
  code: 0
  message: 'success'
  page_context: {
    page: number
    per_page: number
    has_more_page: false
    report_name: string
    applied_filter: string
    sort_column: string
    sort_order: 'A' | 'D'
    search_criteria: [
      {
        column_name: string
        search_text: string
        search_text_formatted: string
        comparator: string
      },
    ]
  }
} & { [K in Pluralize<T>]: Entities[T][] }

type EntityTypes = 'contact' | 'sales_receipt'

type Entities = {
  contact: ZohoContact
  sales_receipt: ZohoSalesReceipt
}

type CreateEntity = {
  contact: { contact: ZohoContact }
  sales_receipt: { sales_receipt_details: ZohoSalesReceipt }
}

export type ZohoCreateSuccessResponse<T extends EntityTypes> = {
  code: number
  message: string
} & CreateEntity[T]
