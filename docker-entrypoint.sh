#!/bin/sh
set -e

echo "▶ Aplicando migrations Prisma..."
node_modules/.bin/prisma migrate deploy

# Seed só roda fora de produção. Em prod o banco começa limpo e a
# administração cria seus próprios dados via UI. Pode ser habilitado
# explicitamente em prod via RUN_SEED=true (bootstrap inicial controlado).
if [ "$NODE_ENV" != "production" ] || [ "$RUN_SEED" = "true" ]; then
  echo "▶ Rodando seed (idempotente)..."
  node_modules/.bin/tsx prisma/seed.ts || echo "⚠ Seed falhou (continuando)"
else
  echo "▶ Pulando seed em produção (defina RUN_SEED=true para forçar)"
fi

echo "▶ Iniciando aplicação..."
exec "$@"
