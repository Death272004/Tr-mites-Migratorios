#!/usr/bin/env bash
set -euo pipefail

for command_name in docker curl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Falta el comando: $command_name" >&2
    exit 1
  fi
done

docker compose version
docker version --format '{{.Server.Version}}'
echo "Entorno Docker disponible."
