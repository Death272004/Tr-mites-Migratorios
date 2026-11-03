# 🗃️ Versiones anteriores · Trámites Migratorios

<p align="center">
  <img src="../recursos-proyecto/assets/project-status.svg" alt="Estado actual del proyecto" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Archivo-histórico-F28C28?style=for-the-badge" alt="Archivo histórico">
  <img src="https://img.shields.io/badge/14%20ramas-conservadas-8B5CF6?style=for-the-badge" alt="14 ramas conservadas">
  <img src="https://img.shields.io/badge/Estado-solo%20consulta-56C596?style=for-the-badge" alt="Solo consulta">
</p>

<p align="center">
  <a href="#-propósito">🎯 Propósito</a> ·
  <a href="#-contenido">📦 Contenido</a> ·
  <a href="#-ramas-activas">🌿 Ramas activas</a> ·
  <a href="#-reglas-de-uso">🔐 Reglas</a>
</p>

<p align="center"><strong>Historial de ramas retiradas del flujo principal</strong><br>Referencia de avances, cierres de Sprint y experimentos del proyecto</p>

## 🎯 Propósito

Esta carpeta funciona como un archivo histórico del repositorio. Conserva copias de ramas que ya no se utilizan como ramas activas, pero que siguen siendo útiles para revisar decisiones, comparar avances y demostrar la evolución técnica del sistema.

Las carpetas son snapshots del estado de cada rama cuando fue archivada. No representan el código vigente del producto.

## 📦 Contenido archivado

| Carpeta | Rama o propósito original |
| --- | --- |
| `DB` | Rama de trabajo relacionada con base de datos. |
| `feature-hu-07-openapi` | `feature/hu-07-openapi`. |
| `feature-hu-08-22-backend-sprints-1-4` | Backend de historias HU-08 a HU-22 durante Sprints 1–4. |
| `feature-hu-10-entorno` | `feature/hu-10-entorno`. |
| `feature-hu-23-25-verificaciones` | Verificaciones y fuentes simuladas de HU-23 a HU-25. |
| `feature-sprint-6-integracion-calidad` | Integración de calidad del Sprint 6. |
| `integration-sprint-6-devops` | Integración DevOps del Sprint 6. |
| `integracion-frontend-backend` | `integracion/frontend-backend`. |
| `qa-pruebas-sprints-2-4` | Pruebas QA de los Sprints 2–4. |
| `sprint-1-cierre` | Cierre y evidencias del Sprint 1. |
| `sprint-2-cierre` | Cierre y evidencias del Sprint 2. |
| `sprint-3-cierre` | Cierre y evidencias del Sprint 3. |
| `sprint-3-completo` | Versión ampliada del cierre del Sprint 3. |
| `sprint-4-cierre` | Cierre y evidencias del Sprint 4. |

> El número de carpetas archivadas puede variar si se incorporan nuevos snapshots. La tabla refleja el contenido actual de esta rama.

## 🌿 Ramas activas

El trabajo vigente se organiza en:

- `main`: integración principal del proyecto.
- `DevOps`: entornos, Docker, CI y operación local.
- `Documentacion`: documentación general y entregables.
- `Backend`: API, reglas de negocio y persistencia.
- `Frontend`: interfaz y flujo de usuario.
- `QA`: pruebas, métricas y evidencias de calidad.

Las ramas archivadas se mantienen separadas para evitar que un avance antiguo se confunda con la versión actual.

## 🔍 Cómo consultar una versión

1. Abre la carpeta que quieras revisar.
2. Lee su README y verifica el alcance de esa copia.
3. Compara sus archivos con `main` o con la rama activa correspondiente.
4. No reutilices configuraciones antiguas sin confirmar que siguen siendo compatibles.

Estas copias pueden contener endpoints, scripts, nombres de archivos o configuraciones que fueron reemplazados posteriormente.

## 🔐 Reglas de uso

- No desarrollar nuevas funcionalidades dentro de esta carpeta.
- No tratar estas copias como ramas activas.
- No eliminar evidencias sin confirmar su valor histórico.
- No copiar secretos, `.env` reales ni datos personales desde una versión archivada.
- Toda mejora vigente debe realizarse en la rama funcional correspondiente y luego integrarse mediante el flujo definido.

## 🧭 Estado del archivo

**Fecha de archivo registrada:** 25 de octubre de 2026
**Uso recomendado:** consulta histórica, comparación técnica y respaldo de evidencias.
**Estado:** conservado; no forma parte del flujo de desarrollo diario.
