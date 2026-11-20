# Directorio de Usuarios del Proyecto (Entorno Local / Demo)

> **Advertencia:** Todas las cuentas listadas corresponden al entorno académico/local sembrado por las migraciones Flyway (`V7` a `V15`, `V18`, `V19`). Las contraseñas iniciales solo deben usarse en desarrollo local y demostración; en cualquier entorno real deben cambiarse y desactivarse el perfil `demo` (`SPRING_PROFILES_ACTIVE=`, `DEMO_AUTOCOMPLETAR=false`).

## 1. Personal interno (Área `BUFETE`)

| Nombre | Correo | Contraseña inicial | Rol | Área | Permisos |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Kenneth Carter | `kenneth.carter@tr-utp.com` | `kenneth.carter` | `ADMIN` | `BUFETE` | `CONSULTAR`, `ADMINISTRAR` |
| Richard Rodriguez | `richard.rodriguez@tr-utp.com` | `richard.rodriguez` | `SUPERVISOR` | `BUFETE` | `CONSULTAR`, `REPORTAR` |
| Edgar Rosario | `edgar.rosario@tr-utp.com` | `edgar.rosario` | `FUNCIONARIO` | `BUFETE` | `CONSULTAR`, `VERIFICAR`, `OBSERVAR`, `RESOLVER`, `NOTIFICAR` |
| Jonathan Gomez | `jonathan.gomez@tr-utp.com` | `jonathan.gomez` | `FUNCIONARIO` | `BUFETE` | `CONSULTAR`, `VERIFICAR`, `OBSERVAR`, `RESOLVER`, `NOTIFICAR` |
| Vivian Paris | `vivian.paris@tr-utp.com` | `vivian.paris` | `AUDITOR` | `BUFETE` | `CONSULTAR`, `AUDITAR`, `REPORTAR` |

## 2. Pasantes institucionales (Verificaciones restringidas por área · `V15`)

Estas cuentas solo pueden consultar y atender verificaciones asignadas a su fuente institucional. No pueden gestionar consentimientos, solicitudes ARCO ni cambiar el estado de los expedientes del bufete.

| Nombre | Correo | Contraseña inicial | Rol | Área | Permisos |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Pasante Registro Público (demo) | `pasante.rp@tr-utp.com` | `Demo-Tramites-2026` | `FUNCIONARIO` | `RP` | `CONSULTAR`, `VERIFICAR`, `OBSERVAR` |
| Pasante CSS (demo) | `pasante.css@tr-utp.com` | `Demo-Tramites-2026` | `FUNCIONARIO` | `CSS` | `CONSULTAR`, `VERIFICAR`, `OBSERVAR` |
| Pasante Tribunal Electoral (demo) | `pasante.te@tr-utp.com` | `Demo-Tramites-2026` | `FUNCIONARIO` | `TE` | `CONSULTAR`, `VERIFICAR`, `OBSERVAR` |

## 3. Solicitantes del portal (`V8`, `V9`, `V12`, `V13`)

| Nombre | Correo | Contraseña inicial | Rol | Tipo de solicitante | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Daniela Anaya | `daniela.anaya@tr-utp.com` | `daniela.anaya` | `SOLICITANTE` | `TURISTA` | `ACTIVA` |
| Edwin Cisnero | `edwin.cisnero@tr-utp.com` | `edwin.cisnero` | `SOLICITANTE` | `PASANTE_BUFETE` | `ACTIVA` |
| Leonardo Liang | `leonardo.liang@tr-utp.com` | `leonardo.liang` | `SOLICITANTE` | `MIGRANTE_INDEPENDIENTE` | `ACTIVA` |
| Javier Pravia | `javier.pravia@tr-utp.com` | `javier.pravia` | `SOLICITANTE` | `NACIONAL` | `ACTIVA` |
| Yomayri Martinez *(si existía `yomayri2911@gmail.com` antes de `V12`)* | `yomayri.martinez@tr-utp.com` | `yomayri.martinez` | `SOLICITANTE` | `NACIONAL` | `ACTIVA` |
| Cuenta archivada | `cuenta.archivada@tr-utp.com` | *(no utilizable)* | `SOLICITANTE` | — | `DESHABILITADA` |

## 4. Cuentas de servicio (Correo local Docker)

| Correo | Uso |
| :--- | :--- |
| `no.reply@tr-utp.com` | Remitente interno del servidor SMTP local (`docker-mailserver`); no es una cuenta de inicio de sesión en la aplicación. |

## 5. Inicio de sesión rápido (Autocompletado local)

- En [docker-compose.yml](../docker-compose.yml), el autocompletado de demostración se habilita localmente mediante `SPRING_PROFILES_ACTIVE=demo` y `DEMO_AUTOCOMPLETAR=true`.
- En [application.yml](../Backend/src/main/resources/application.yml) y [.env.example](../.env.example), `DEMO_AUTOCOMPLETAR` permanece en `false` por defecto por seguridad.
