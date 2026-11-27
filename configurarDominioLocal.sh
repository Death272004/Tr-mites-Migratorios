#!/usr/bin/env bash
set -Eeuo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMINIO_APP="tramites.tr-utp.com"
DOMINIO_CORREO="correo.tr-utp.com"

configurar_sistema() {
  if ! grep -Eq "(^|[[:space:]])${DOMINIO_APP}([[:space:]]|$)" /etc/hosts \
    || ! grep -Eq "(^|[[:space:]])${DOMINIO_CORREO}([[:space:]]|$)" /etc/hosts; then
    echo "Registrando ${DOMINIO_APP} y ${DOMINIO_CORREO} en /etc/hosts..."
    printf '127.0.0.1        %s %s\n' "$DOMINIO_APP" "$DOMINIO_CORREO" >> /etc/hosts
  else
    echo "Los dominios locales ya existen en /etc/hosts."
  fi

  if command -v systemctl >/dev/null 2>&1; then
    if ! systemctl is-active --quiet docker; then
      echo "Iniciando el servicio Docker..."
      systemctl start docker
    fi
  fi
}

if [[ "${1:-}" == "--solo-sistema" ]]; then
  if [[ "$(id -u)" -ne 0 ]]; then
    echo "Error: --solo-sistema requiere ejecutarse como root." >&2
    exit 1
  fi
  configurar_sistema
  exit 0
fi

cd "$RAIZ"

necesita_hosts=0
if ! grep -Eq "(^|[[:space:]])${DOMINIO_APP}([[:space:]]|$)" /etc/hosts \
  || ! grep -Eq "(^|[[:space:]])${DOMINIO_CORREO}([[:space:]]|$)" /etc/hosts; then
  necesita_hosts=1
fi

necesita_docker=0
if ! docker info >/dev/null 2>&1; then
  necesita_docker=1
fi

if [[ "$necesita_hosts" -eq 1 || "$necesita_docker" -eq 1 ]]; then
  if [[ "$(id -u)" -eq 0 ]]; then
    configurar_sistema
  elif command -v sudo >/dev/null 2>&1 && [[ -t 0 ]]; then
    sudo "$RAIZ/$(basename "$0")" --solo-sistema
  elif command -v pkexec >/dev/null 2>&1; then
    pkexec "$RAIZ/$(basename "$0")" --solo-sistema
  else
    echo "Error: ejecute con sudo para registrar /etc/hosts e iniciar Docker." >&2
    exit 1
  fi
fi

echo "Recreando servicios backend, frontend y webmail con dominio local..."
docker compose up -d --force-recreate backend frontend webmail

echo "Esperando respuesta de http://${DOMINIO_APP}/salud y http://${DOMINIO_CORREO}/ ..."
ok_app=0
ok_mail=0
for _ in $(seq 1 30); do
  if [[ "$ok_app" -eq 0 ]] && [[ "$(curl -fsS --max-time 2 "http://${DOMINIO_APP}/salud" 2>/dev/null || true)" == "ok" ]]; then
    ok_app=1
  fi
  if [[ "$ok_mail" -eq 0 ]] && curl -fsSI --max-time 2 "http://${DOMINIO_CORREO}/" >/dev/null 2>&1; then
    ok_mail=1
  fi
  if [[ "$ok_app" -eq 1 && "$ok_mail" -eq 1 ]]; then
    break
  fi
  sleep 1
done

if [[ "$ok_app" -ne 1 || "$ok_mail" -ne 1 ]]; then
  echo "Advertencia: revise el estado de los contenedores con 'docker compose ps'." >&2
  exit 1
fi

echo
echo "Dominios locales activos:"
echo "  Portal y API : http://${DOMINIO_APP}"
echo "  Webmail      : http://${DOMINIO_CORREO}"
echo "  Respaldo     : http://localhost:8080  |  http://localhost:8081"
