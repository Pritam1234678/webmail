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
  const path = pathSegments.join('/')
  const url = new URL(request.url)
  const targetUrl = `${BACKEND}/api/${path}${url.search}`

  // Forward cookies from client → backend
  const cookieHeader = request.headers.get('cookie') || ''

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Cookie': cookieHeader,
  }

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
    const nextRes = new NextResponse(responseText, {
      status: backendRes.status,
    })

    // Set content-type
    const resCt = backendRes.headers.get('content-type')
    if (resCt) nextRes.headers.set('content-type', resCt)

    // Forward cookies — strip domain so they work on localhost
    const raw = backendRes.headers.get('set-cookie')
    if (raw) {
      // Sanitize: remove Domain=..., Secure, change SameSite=None to Lax
      const sanitized = raw
        .replace(/;\s*domain=[^;,]*/gi, '')
        .replace(/;\s*secure/gi, '')
        .replace(/;\s*samesite=none/gi, '; SameSite=Lax')
      nextRes.headers.set('set-cookie', sanitized)
    }

    return nextRes
  } catch (err: any) {
    console.error('[API Proxy] Backend unreachable:', err.message)
    return NextResponse.json(
      { error: 'Backend unreachable', detail: err.message },
      { status: 503 }
    )
  }
}
