import 'server-only'

/**
 * Contato do encarregado de dados (DPO) usado em páginas legais e exports
 * LGPD. Centralizado aqui pra que mudança de email seja em um lugar só.
 *
 * Em produção, defina `DPO_EMAIL` no ambiente. O fallback `contato@`
 * é só um placeholder visível, NUNCA deve ser usado em prod real (o
 * `DPO_EMAIL` é obrigatório quando NODE_ENV=production).
 */
const DEFAULT_DPO_EMAIL = 'contato@comunidaderoraima.dev'

export const PRIVACY_CONTROLLER_NAME =
  'Comunidade Roraima Fullstack Developers'

export const DPO_EMAIL = process.env.DPO_EMAIL || DEFAULT_DPO_EMAIL

if (process.env.NODE_ENV === 'production' && !process.env.DPO_EMAIL) {
  // Não derruba a aplicação, mas grava um aviso claro nos logs pra que
  // a equipe configure antes de aceitar o primeiro tratamento de dados real.
  console.warn(
    '[privacy] DPO_EMAIL não definido em produção — exibindo placeholder.',
  )
}
