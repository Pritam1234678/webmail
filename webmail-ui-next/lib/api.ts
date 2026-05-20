const API_BASE = '/api'

async function fetchAPI<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  auth: {
    session: () => fetchAPI('/v1/auth/session'),
    login: (username: string, password: string) =>
      fetchAPI('/v1/auth/session', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    logout: () => fetchAPI('/v1/auth/session', { method: 'DELETE' }),
    me: () => fetchAPI('/v1/auth/me'),
  },
  mailboxes: {
    list: () => fetchAPI('/v1/mailboxes'),
    get: (id: string, folder = 'inbox', q = '') =>
      fetchAPI(`/v1/mailboxes/${id}?folder=${folder}&q=${encodeURIComponent(q)}`),
  },
  messages: {
    get: (id: string) => fetchAPI(`/v1/messages/${encodeURIComponent(id)}`),
    send: (payload: { to: string; subject: string; body: string; cc?: string }) =>
      fetchAPI('/v1/messages/send', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },
}
