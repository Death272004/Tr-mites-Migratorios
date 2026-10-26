#!/usr/bin/env bash
set -euo pipefail

backend_url="${BACKEND_URL:-http://localhost:8080}"
frontend_url="${FRONTEND_URL:-http://localhost:8081}"

health="$(curl --fail --silent --show-error "$backend_url/actuator/health")"
echo "Backend: $health"
grep -q 'UP' <<<"$health"

curl --fail --silent --show-error "$frontend_url/" >/dev/null
echo "Frontend: OK"
echo "Smoke test aprobado."
