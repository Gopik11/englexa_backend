#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Generating Prisma client..."
  npx prisma generate

  echo "Running database migrations..."
  npx prisma migrate deploy
fi

exec node dist/main.js
