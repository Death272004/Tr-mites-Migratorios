# Pipeline de integración continua

El archivo `DevOps/ci.yml` contiene el workflow propuesto para ejecutarse en cada push y pull request. Para activarlo en GitHub debe copiarse a `.github/workflows/ci.yml` con una cuenta o token que tenga permiso `workflow`.

## Etapas

1. Descarga el repositorio.
2. Configura Java 21 y la caché de Maven.
3. Ejecuta `./mvnw test` dentro de `Backend`.
4. Valida la sintaxis de `docker-compose.yml`.
5. Construye las imágenes de backend y frontend.

## Criterio de aprobación

La integración se considera correcta cuando las pruebas del backend terminan sin fallos, Compose es válido y las imágenes se construyen. Si alguna etapa falla, el cambio debe revisarse antes de integrarlo a `main`.

## Seguridad

El pipeline no contiene credenciales reales. Los secretos y archivos `.env` se mantienen fuera del repositorio. Los datos usados por las pruebas son ficticios.
