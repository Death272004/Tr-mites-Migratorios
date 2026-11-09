#!/usr/bin/env bash

set -Eeuo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORTAL_URL="http://localhost:8080/login"
CORREO_URL="http://localhost:8081"

cd "$RAIZ"

informar_error() {
  echo
  echo "Error: $1" >&2
  exit 1
}

command -v docker >/dev/null 2>&1 || informar_error "Docker no está instalado o no está disponible en PATH."
docker compose version >/dev/null 2>&1 || informar_error "Docker Compose no está disponible."
docker info >/dev/null 2>&1 || informar_error "Docker no está iniciado. Abra Docker y vuelva a ejecutar este archivo."

liberar_puerto() {
  local puerto="$1"
  local contenedores=""
  local procesos=""

  echo "Revisando el puerto $puerto..."

  contenedores="$(docker ps --filter "publish=$puerto" --format '{{.ID}}' 2>/dev/null || true)"
  if [[ -n "$contenedores" ]]; then
    echo "Deteniendo contenedor(es) que usan el puerto $puerto..."
    while IFS= read -r contenedor; do
      [[ -n "$contenedor" ]] && docker stop "$contenedor" >/dev/null
    done <<< "$contenedores"
  fi

  if command -v lsof >/dev/null 2>&1; then
    procesos="$(lsof -t -iTCP:"$puerto" -sTCP:LISTEN 2>/dev/null | sort -u || true)"
  elif command -v fuser >/dev/null 2>&1; then
    procesos="$(fuser "$puerto"/tcp 2>/dev/null || true)"
  fi

  if [[ -n "$procesos" ]]; then
    echo "Cerrando proceso(s) que usan el puerto $puerto: $procesos"
    kill -TERM $procesos 2>/dev/null || informar_error "No se pudo liberar el puerto $puerto. Ejecute el script con permisos suficientes."
    sleep 1
  fi

  if command -v lsof >/dev/null 2>&1 && lsof -t -iTCP:"$puerto" -sTCP:LISTEN >/dev/null 2>&1; then
    procesos="$(lsof -t -iTCP:"$puerto" -sTCP:LISTEN 2>/dev/null | sort -u || true)"
    [[ -n "$procesos" ]] && kill -KILL $procesos 2>/dev/null || true
  fi

  if command -v ss >/dev/null 2>&1 && ss -ltn "sport = :$puerto" | grep -q LISTEN; then
    informar_error "El puerto $puerto continúa ocupado."
  fi
}

abrir_url() {
  local url="$1"
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 &
  elif command -v gio >/dev/null 2>&1; then
    gio open "$url" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 &
  else
    echo "Abra manualmente: $url"
  fi
}

echo "Deteniendo una ejecución anterior de Trámites Migratorios..."
docker compose down --remove-orphans >/dev/null 2>&1 || true

liberar_puerto 8080
liberar_puerto 8081

export FRONTEND_PORT=8080
export WEBMAIL_PORT=8081

echo "Construyendo e iniciando la aplicación y el correo local..."
docker compose up -d --build --wait --wait-timeout 240

echo
echo "Aplicación lista: $PORTAL_URL"
echo "Correo local listo: $CORREO_URL"

if [[ "${NO_ABRIR_NAVEGADOR:-0}" != "1" ]]; then
  abrir_url "$PORTAL_URL"
  abrir_url "$CORREO_URL"
fi

