import type { Contact } from './types'
import { ZohoContact, ZohoCreateSuccessResponse, ZohoSearchResponse } from './zoho'
import { zohoApi } from './util/api'

function mapContact(data: ZohoContact): Contact {
  return {
    id: data.contact_id,
    name: data.contact_name,
  }
}

async function createNewContact(contactName: string): Promise<Contact> {
  const payload: Partial<ZohoContact> = {
    contact_name: contactName,
    contact_type: 'customer',
  }

  const { data } = await zohoApi<ZohoCreateSuccessResponse<'contact'>>({
    method: 'POST',
    endpoint: 'contacts',
    body: payload,
  })

  console.log('New contact created:', data.contact.contact_name)
  return mapContact(data.contact)
}

export async function getOrCreateContact(contactName: string): Promise<Contact> {
  const { data } = await zohoApi<ZohoSearchResponse<'contact'>>({
    method: 'GET',
    endpoint: 'contacts',
    query: { contact_name: contactName },
  })

  if (data.contacts.length === 0) {
    console.log('Creating new contact:', contactName)
    return createNewContact(contactName)
  }

  if (data.contacts.length > 1) {
    console.error('Duplicate contacts found.', contactName)
    throw new Error('Duplicate contacts found.')
  }

  console.log('Contact found:', contactName)
  return mapContact(data.contacts[0])
}
