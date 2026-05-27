import { z } from 'zod'

const SAFE_PROTOCOLS = new Set(['http:', 'https:'])

/**
 * Aceita apenas URLs http/https. Bloqueia `javascript:`, `data:`, `file:`,
 * `vbscript:` etc, que poderiam ser usados pra XSS quando a URL é inserida
 * em um <a href> sem sanitização adicional.
 */
export const safeHttpUrl = z
  .string()
  .trim()
  .url('URL inválida')
  .refine((raw) => {
    try {
      const u = new URL(raw)
      return SAFE_PROTOCOLS.has(u.protocol)
    } catch {
      return false
    }
  }, 'Apenas URLs http/https são permitidas')

/**
 * URL opcional: aceita string vazia/undefined ou URL válida http/https.
 */
export const optionalSafeHttpUrl = safeHttpUrl
  .optional()
  .or(z.literal('').transform(() => undefined))
