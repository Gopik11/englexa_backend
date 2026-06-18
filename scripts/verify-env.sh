#!/usr/bin/env bash
# Verify EngLexa backend .env without printing secret values.
# Usage: ./scripts/verify-env.sh [path-to-.env]

set -euo pipefail

ENV_FILE="${1:-.env}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found"
  exit 1
fi

echo "=== EngLexa .env audit: $ENV_FILE ==="

check_var() {
  local key="$1"
  local min_len="${2:-1}"
  local line
  line=$(grep -E "^${key}=" "$ENV_FILE" | tail -n1 || true)
  if [[ -z "$line" ]]; then
    echo "  $key  MISSING"
    return 1
  fi
  local val="${line#*=}"
  val="${val%\"}"
  val="${val#\"}"
  val="${val%\'}"
  val="${val#\'}"
  if [[ -z "$val" ]]; then
    echo "  $key  EMPTY"
    return 1
  fi
  if [[ ${#val} -lt $min_len ]]; then
    echo "  $key  TOO SHORT (len=${#val}, need >=$min_len)"
    return 1
  fi
  if [[ "$key" == *SECRET* || "$key" == *KEY* || "$key" == DATABASE_URL ]]; then
    echo "  $key  set (len=${#val})"
  else
    echo "  $key  $val"
  fi
  return 0
}

fail=0
check_var DATABASE_URL 10 || fail=1
check_var JWT_ACCESS_SECRET 32 || fail=1
check_var JWT_REFRESH_SECRET 32 || fail=1
check_var PORT 1 || fail=1
check_var NODE_ENV 1 || fail=1

if grep -qE '^OPENAI_API_KEY=.+' "$ENV_FILE" || grep -qE '^SPEECH_API_KEY=.+' "$ENV_FILE"; then
  if grep -qE '^OPENAI_API_KEY=.+' "$ENV_FILE"; then check_var OPENAI_API_KEY 20; else echo "  OPENAI_API_KEY  EMPTY"; fi
  if grep -qE '^SPEECH_API_KEY=.+' "$ENV_FILE"; then check_var SPEECH_API_KEY 20; else echo "  SPEECH_API_KEY  (optional, empty)"; fi
else
  echo "  OPENAI_API_KEY  EMPTY"
  echo "  SPEECH_API_KEY  EMPTY"
  echo "  >> AI routes (spoken-english, ask, voice) will return 500"
  fail=1
fi

echo ""
if [[ $fail -eq 0 ]]; then
  echo "RESULT: OK — required variables present"
else
  echo "RESULT: ISSUES FOUND — fix before redeploying"
  exit 1
fi
