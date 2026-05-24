import 'server-only'
import { NextResponse } from 'next/server'

export type Meta = {
  total: number
  page?: number
  pageSize?: number
  totalPages?: number
}

export function ok<T>(data: T, meta?: Meta, init?: ResponseInit) {
  return NextResponse.json(
    { data, ...(meta ? { meta } : {}) },
    init,
  )
}
