/**
 * Side-effect: estende `zod` com o método `.openapi()` de @asteasolutions/zod-to-openapi.
 * Importe este arquivo (mesmo sem usar nada exportado) em qualquer módulo que
 * vá chamar `.openapi()` nos schemas, antes do primeiro uso.
 *
 * Uso típico:
 *   import '@/server/openapi/zod-ext'
 *   import { z } from 'zod'
 *   const x = z.string().openapi({ example: 'foo' })
 */
import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export { z }
