import 'server-only'
import { NextResponse } from 'next/server'
import { ZodError, type ZodIssue } from 'zod'

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} não encontrado`, 404)
  }
}

export class ValidationError extends AppError {
  constructor(details: unknown) {
    super('VALIDATION_ERROR', 'Dados inválidos', 422, details)
  }
}

const isProd = process.env.NODE_ENV === 'production'

/**
 * Em produção, vaza só o mínimo necessário para o cliente entender o erro.
 * Detalhes técnicos vão pro log do servidor; o cliente recebe versão sanitizada.
 */
function sanitizeZodIssues(issues: ZodIssue[]) {
  if (!isProd) {
    return issues
  }
  // Em prod, devolve apenas { path, message } sem o tipo interno do Zod
  // (que vaza estrutura: "invalid_enum_value", expected/received, etc).
  return issues.map((i) => ({
    path: Array.isArray(i.path) ? i.path.join('.') : String(i.path),
    message: i.message,
  }))
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details !== undefined ? { details: error.details } : {}),
        },
      },
      { status: error.status },
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos',
          details: sanitizeZodIssues(error.issues),
        },
      },
      { status: 422 },
    )
  }

  // Log estruturado (server-side) — nunca devolver stack pro cliente.
  console.error('[api] erro inesperado:', {
    name: error instanceof Error ? error.name : 'Unknown',
    message: error instanceof Error ? error.message : String(error),
    // stack só em dev, pra ajudar no debug local
    ...(isProd
      ? {}
      : { stack: error instanceof Error ? error.stack : undefined }),
  })

  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Não foi possível processar sua solicitação.',
      },
    },
    { status: 500 },
  )
}
