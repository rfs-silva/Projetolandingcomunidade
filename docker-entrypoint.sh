#!/bin/sh
set -e

echo "▶ Aplicando migrations Prisma..."
node_modules/.bin/prisma migrate deploy

echo "▶ Rodando seed (idempotente)..."
node_modules/.bin/tsx prisma/seed.ts || echo "⚠ Seed falhou (continuando)"

echo "▶ Iniciando aplicação..."
exec "$@"
