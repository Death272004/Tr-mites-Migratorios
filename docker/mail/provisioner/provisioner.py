#!/usr/bin/env python3
"""Aprovisiona buzones DMS desde la red interna de Docker, sin acceso al socket Docker."""

from __future__ import annotations

import fcntl
import hmac
import json
import os
import re
import subprocess
import threading
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOST = "0.0.0.0"
PORT = int(os.environ.get("PROVISIONER_PORT", "8080"))
TOKEN = os.environ.get("PROVISIONER_TOKEN", "")
CUENTAS = Path(os.environ.get("DMS_ACCOUNTS_FILE", "/config/postfix-accounts.cf"))
CORREO_VALIDO = re.compile(r"^[a-z0-9]+(?:[._-][a-z0-9]+)*@tr-utp\.com$")
BLOQUEO = threading.Lock()


def generar_hash(correo: str, contrasena: str) -> str:
    proceso = subprocess.run(
        ["doveadm", "pw", "-s", "SHA512-CRYPT", "-u", correo],
        input=f"{contrasena}\n{contrasena}\n",
        text=True,
        capture_output=True,
        timeout=15,
        check=False,
    )
    if proceso.returncode != 0:
        raise RuntimeError("No se pudo generar el hash del buzón.")
    resultado = proceso.stdout.strip()
    if not resultado.startswith("{SHA512-CRYPT}$6$"):
        raise RuntimeError("Docker Mailserver devolvió un hash inesperado.")
    return resultado


def guardar_cuenta(correo: str, contrasena: str) -> bool:
    nuevo_hash = generar_hash(correo, contrasena)
    CUENTAS.parent.mkdir(parents=True, exist_ok=True)
    CUENTAS.touch(exist_ok=True)

    with BLOQUEO, CUENTAS.open("r+", encoding="utf-8") as archivo:
        fcntl.flock(archivo.fileno(), fcntl.LOCK_EX)
        lineas = [linea.rstrip("\n") for linea in archivo.readlines() if linea.strip()]
        encontrada = False
        actualizadas: list[str] = []
        for linea in lineas:
            cuenta = linea.split("|", 1)[0].strip().lower()
            if cuenta == correo:
                actualizadas.append(f"{correo}|{nuevo_hash}")
                encontrada = True
            else:
                actualizadas.append(linea)
        if not encontrada:
            actualizadas.append(f"{correo}|{nuevo_hash}")

        archivo.seek(0)
        archivo.write("\n".join(actualizadas) + "\n")
        archivo.truncate()
        archivo.flush()
        os.fsync(archivo.fileno())
        fcntl.flock(archivo.fileno(), fcntl.LOCK_UN)
    return encontrada


class Manejador(BaseHTTPRequestHandler):
    server_version = "TRUTPMailProvisioner/1.0"

    def enviar_json(self, estado: HTTPStatus, cuerpo: dict[str, object]) -> None:
        contenido = json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
        self.send_response(estado)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(contenido)))
        self.end_headers()
        self.wfile.write(contenido)

    def leer_cuerpo(self) -> bytes:
        if self.headers.get("Transfer-Encoding", "").lower() == "chunked":
            partes: list[bytes] = []
            total = 0
            while True:
                linea = self.rfile.readline(128)
                if not linea:
                    raise ValueError("Cuerpo incompleto")
                tamano = int(linea.split(b";", 1)[0].strip(), 16)
                if tamano == 0:
                    while self.rfile.readline(4096) not in (b"\r\n", b"\n", b""):
                        pass
                    break
                total += tamano
                if total > 4096:
                    raise ValueError("Cuerpo demasiado grande")
                partes.append(self.rfile.read(tamano))
                if self.rfile.read(2) != b"\r\n":
                    raise ValueError("Cuerpo incompleto")
            return b"".join(partes)

        longitud = int(self.headers.get("Content-Length", "0"))
        if longitud <= 0 or longitud > 4096:
            raise ValueError("Cuerpo inválido")
        return self.rfile.read(longitud)

    def do_GET(self) -> None:  # noqa: N802
        if self.path == "/health":
            self.enviar_json(HTTPStatus.OK, {"status": "UP"})
            return
        self.enviar_json(HTTPStatus.NOT_FOUND, {"error": "No encontrado"})

    def do_POST(self) -> None:  # noqa: N802
        if self.path != "/accounts":
            self.enviar_json(HTTPStatus.NOT_FOUND, {"error": "No encontrado"})
            return
        recibido = self.headers.get("X-Provisioner-Token", "")
        if not TOKEN or not hmac.compare_digest(recibido, TOKEN):
            self.enviar_json(HTTPStatus.UNAUTHORIZED, {"error": "No autorizado"})
            return

        try:
            datos = json.loads(self.leer_cuerpo().decode("utf-8"))
            correo = str(datos.get("correo", "")).strip().lower()
            contrasena = str(datos.get("contrasena", ""))
            if not CORREO_VALIDO.fullmatch(correo):
                raise ValueError("Correo institucional inválido")
            if not 10 <= len(contrasena) <= 200:
                raise ValueError("Contraseña inválida")
            actualizada = guardar_cuenta(correo, contrasena)
            self.enviar_json(
                HTTPStatus.OK if actualizada else HTTPStatus.CREATED,
                {"correo": correo, "resultado": "actualizado" if actualizada else "creado"},
            )
        except (ValueError, json.JSONDecodeError) as error:
            print(f"Solicitud rechazada: {error}", flush=True)
            self.enviar_json(HTTPStatus.BAD_REQUEST, {"error": str(error)})
        except (OSError, subprocess.SubprocessError, RuntimeError):
            self.enviar_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "No se pudo aprovisionar el buzón"})

    def log_message(self, formato: str, *args: object) -> None:
        print(f"{self.address_string()} - {formato % args}", flush=True)


if __name__ == "__main__":
    if not TOKEN:
        raise SystemExit("PROVISIONER_TOKEN es obligatorio")
    servidor = ThreadingHTTPServer((HOST, PORT), Manejador)
    print(f"Aprovisionador de correo escuchando internamente en {HOST}:{PORT}", flush=True)
    servidor.serve_forever()
