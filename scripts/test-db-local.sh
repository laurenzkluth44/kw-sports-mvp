#!/usr/bin/env bash
# Runs the full migration chain and the access tests against a throwaway database on a
# plain local PostgreSQL server (no Docker needed). CI runs the same tests on the real
# Supabase stack instead.
#
#   PGHOST=/tmp PGPORT=5432 PGUSER=postgres scripts/test-db-local.sh
set -euo pipefail

cd "$(dirname "$0")/.."
DB="kw_test_$$"
PSQL=(psql -v ON_ERROR_STOP=1 -q -X)

createdb "$DB"
trap 'dropdb --if-exists "$DB"' EXIT

"${PSQL[@]}" -d "$DB" -c "create extension if not exists pgcrypto; create extension if not exists citext;"
"${PSQL[@]}" -d "$DB" -f supabase/tests/local/supabase-stub.sql

for migration in supabase/migrations/*.sql; do
  echo "migrate  $(basename "$migration")"
  "${PSQL[@]}" -d "$DB" -1 -f "$migration"
done

echo "seed     clubs-2026-27.sql + seed.sql"
"${PSQL[@]}" -d "$DB" -1 -f supabase/clubs-2026-27.sql
"${PSQL[@]}" -d "$DB" -1 -f supabase/seed.sql

echo "test     access.sql"
psql -v ON_ERROR_STOP=1 -X -d "$DB" -f supabase/tests/access.sql
