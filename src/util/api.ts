import qs from 'node:querystring'
import envs from './envs'

type Opts = {
  method: 'GET' | 'POST' | 'PUT'
  endpoint: string
  query?: Record<string, string>
  body?: Record<string, unknown>
}

export async function zohoApi<T>(opts: Opts) {
  const query = qs.stringify({ organization_id: envs.ORG_ID, ...opts.query })
  const url = `https://www.zohoapis.in/books/v3/${opts.endpoint}?${query}`

  const resp = await fetch(url, {
    method: opts.method,
    headers: {
      Authorization: `Zoho-oauthtoken ${envs.TOKEN}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })

  const data = (await resp.json()) as T
  const status = resp.status

  if (status >= 400) {
    console.error('Error occured', status)
    console.log(data)
    process.exit(1)
  }

  return { status: resp.status, data }
}
