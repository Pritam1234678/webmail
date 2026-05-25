import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'https://mail.codecoder.in'

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxyRequest(request, path)
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxyRequest(request, path)
}

export async function DELETE(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxyRequest(request, path)
}

export async function PUT(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params
  return proxyRequest(request, path)
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  // pathSegments = ['auth','session'] from /api/v1/auth/session
  // Backend expects /api/v1/auth/session
  const path = pathSegments.join('/')
  const url = new URL(request.url)
  // Preserve the full /api/v1/... path the backend expects
  const targetUrl = `${BACKEND}/api/v1/${path}${url.search}`

  console.log(`[Proxy] ${request.method} ${targetUrl}`)

  // Forward cookies from client → backend
  const cookieHeader = request.headers.get('cookie') || ''

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  }
  if (cookieHeader) headers['Cookie'] = cookieHeader

  const ct = request.headers.get('content-type')
  if (ct) headers['Content-Type'] = ct

  let body: string | undefined
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text()
  }

  try {
    const backendRes = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    })

    const responseText = await backendRes.text()
    console.log(`[Proxy] Response: ${backendRes.status} body=${responseText.slice(0, 120)}`)

    const nextRes = new NextResponse(responseText, {
      status: backendRes.status,
    })

    // Forward content-type
    const resCt = backendRes.headers.get('content-type')
    if (resCt) nextRes.headers.set('content-type', resCt)

    // Forward cookies — strip domain so they work on localhost too
    const setCookieRaw = backendRes.headers.get('set-cookie')
    if (setCookieRaw) {
      const sanitized = setCookieRaw
        .replace(/;\s*domain=[^;,]*/gi, '')
        .replace(/;\s*secure/gi, '')
        .replace(/;\s*samesite=none/gi, '; SameSite=Lax')
      nextRes.headers.set('set-cookie', sanitized)
    }

    return nextRes
  } catch (err: any) {
    console.error('[Proxy] Backend unreachable:', err.message)
    return NextResponse.json(
      { error: 'Backend unreachable', detail: err.message },
      { status: 503 }
    )
  }
}
