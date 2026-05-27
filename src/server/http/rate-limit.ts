import 'server-only'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Rate limiter in-memory por chave (IP + bucket). Suficiente para MVP local
 * e single-instance. Para produção multi-instância, trocar por Redis/Upstash.
 *
 * Algoritmo: janela deslizante simples — guarda os timestamps das últimas
 * requisições, descarta as fora da janela e bloqueia se passou do limite.
 */

type Bucket = {
  limit: number
  windowMs: number
}

export const RATE_LIMITS = {
  // Mutações em /api/me/* — usuário logado
  meWrite: { limit: 60, windowMs: 60_000 } satisfies Bucket,
  // Endpoints sensíveis: criar threads, mentoria
  meSensitive: { limit: 10, windowMs: 60_000 } satisfies Bucket,
  // Endpoints admin
  adminWrite: { limit: 120, windowMs: 60_000 } satisfies Bucket,
} as const

type RateKey = keyof typeof RATE_LIMITS

// Map<key, timestamps[]>. Single-process, perde estado em restart (intencional).
const store = new Map<string, number[]>()

// Limpeza esporádica pra não inflar memória.
let lastSweep = Date.now()
function maybeSweep() {
  const now = Date.now()
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [k, ts] of store) {
    // mantém só timestamps recentes (até 5 min) pra GC
    const recent = ts.filter((t) => now - t < 5 * 60_000)
    if (recent.length === 0) store.delete(k)
    else store.set(k, recent)
  }
}

export function getClientIp(req: NextRequest | Request): string {
  const headers = req.headers
  // Prioridade: X-Forwarded-For (atrás de proxy), depois X-Real-IP
  const fwd = headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

/**
 * Verifica e contabiliza um hit. Retorna `null` se permitido,
 * ou uma `NextResponse` 429 pronta pra retornar se bloqueado.
 */
export function checkRateLimit(
  req: NextRequest | Request,
  bucket: RateKey,
): NextResponse | null {
  maybeSweep()
  const { limit, windowMs } = RATE_LIMITS[bucket]
  const ip = getClientIp(req)
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const existing = store.get(key) ?? []
  const recent = existing.filter((t) => now - t < windowMs)

  if (recent.length >= limit) {
    const retryAfter = Math.ceil(
      (windowMs - (now - recent[0])) / 1000,
    )
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message: 'Muitas requisições. Aguarde alguns instantes.',
        },
      },
      {
        status: 429,
        headers: {
          'retry-after': String(Math.max(1, retryAfter)),
          'cache-control': 'no-store',
        },
      },
    )
  }

  recent.push(now)
  store.set(key, recent)
  return null
}
