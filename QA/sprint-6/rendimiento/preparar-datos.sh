#!/usr/bin/env bash
# Prepara los datos ficticios del plan de carga (HU-29, TASK-29.2) sobre el stack Docker local.
# Crea el cliente carga@demo.pa con documento de identidad ficticio y un consentimiento vigente,
# necesarios para que la verificación TE simulada del plan responda 201 y no 403/409.
# Uso: ./preparar-datos.sh [http://localhost:8081]   (idempotente: el registro repetido da 409)
set -euo pipefail
BASE="${1:-http://localhost:8081}/api"
CLAVE="${DEMO_CONTRASENA:-Demo-Tramites-2026}"

curl -s -o /dev/null -w "registro carga@demo.pa: %{http_code}\n" -X POST "$BASE/auth/registro" \
  -H 'Content-Type: application/json' \
  -d "{\"tipoDocumento\":\"PASAPORTE\",\"numeroDocumento\":\"PA-CARGA-0001\",\"nombre\":\"Cliente Carga (ficticio)\",\"nacionalidad\":\"CO\",\"correo\":\"carga@demo.pa\",\"telefono\":\"+507 6000-0000\",\"paisResidencia\":\"PA\",\"contrasena\":\"$CLAVE\",\"aceptaTratamientoDatos\":true}"

LOGIN=$(curl -s -X POST "$BASE/auth/login" -H 'Content-Type: application/json' \
  -d "{\"correo\":\"carga@demo.pa\",\"contrasena\":\"$CLAVE\"}")
TOKEN=$(echo "$LOGIN" | sed 's/.*"token":"\([^"]*\)".*/\1/')
TITULAR=$(echo "$LOGIN" | sed 's/.*"usuario":{"id":"\([^"]*\)".*/\1/')

curl -s -o /dev/null -w "consentimiento vigente: %{http_code}\n" -X POST "$BASE/consentimientos" \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"titularId\":\"$TITULAR\",\"finalidad\":\"Gestion del tramite\",\"alcance\":\"Identidad\",\"baseLegal\":\"Ley 81 de 2019\",\"expreso\":true}"
