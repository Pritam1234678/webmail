const API_BASE = '/api'

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const auth = localStorage.getItem('mc_auth_token')
  return auth ? { 'Authorization': `Basic ${auth}` } : {}
}

async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {}
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json'
  Object.assign(headers, getAuthHeader())
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>)

  const res = await fetch(`${API_BASE}${path}`, { ...options, credentials: 'include', headers })
  if (res.status === 204) return {} as T
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  auth: {
    login: (credentials: any) => fetchAPI('/v1/auth/session', { method: 'POST', body: JSON.stringify(credentials) }),
    logout: () => { if (typeof window !== 'undefined') localStorage.removeItem('mc_auth_token'); return fetchAPI('/v1/auth/session', { method: 'DELETE' }) },
    session: () => fetchAPI('/v1/auth/session'),
    me: () => fetchAPI('/v1/auth/me'),
  },
  mailboxes: {
    list: () => fetchAPI('/v1/mailboxes'),
    get: (id: string, folder = 'inbox', q = '', limit = 50, offset = 0) => 
      fetchAPI(`/v1/mailboxes/${id}?folder=${folder}&q=${encodeURIComponent(q)}&limit=${limit}&offset=${offset}`),
  },
  messages: {
    get: (id: string) => fetchAPI(`/v1/messages/${encodeURIComponent(id)}`),
    update: (id: string, payload: any) => fetchAPI(`/v1/messages/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    delete: (id: string) => fetchAPI(`/v1/messages/${encodeURIComponent(id)}`, { method: 'DELETE' }),
    send: (payload: FormData | any) => fetchAPI('/v1/messages/send', { method: 'POST', body: payload instanceof FormData ? payload : JSON.stringify(payload) }),
  },
}
