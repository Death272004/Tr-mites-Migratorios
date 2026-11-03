#  Recursos del proyecto · Trámites Migratorios

<p align="center">
  <img src="assets/readme-hero.svg" alt="Sistema Interoperable de Trámites Migratorios" width="100%">
</p>


<p align="center">
  <img src="assets/project-status.svg" alt="Estado del proyecto" width="100%">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Recursos-compartidos-F28C28?style=for-the-badge" alt="Recursos compartidos">
  <img src="https://img.shields.io/badge/QA-evidencias-8B5CF6?style=for-the-badge" alt="Evidencias QA">
  <img src="https://img.shields.io/badge/Proyecto-académico-56C596?style=for-the-badge" alt="Proyecto académico">
</p>

<p align="center">
  <a href="#-propósito"> Propósito</a> ·
  <a href="#-contenido"> Contenido</a> ·
  <a href="#-uso"> Uso</a> ·
  <a href="#-reglas"> Reglas</a>
</p>

<p align="center"><strong>Convenciones, evidencias, assets y referencias comunes del repositorio</strong><br>Un solo lugar para los recursos que apoyan al equipo completo</p>

##  Propósito

Esta carpeta reúne los recursos generales que no pertenecen exclusivamente al frontend, backend, QA o DevOps. Su objetivo es mantener el repositorio ordenado y facilitar que cualquier integrante encuentre las convenciones, evidencias y elementos visuales compartidos del proyecto.

> El contenido acompaña al producto académico y utiliza únicamente información ficticia o de demostración. No contiene credenciales, secretos ni datos reales de instituciones públicas.

##  Contenido

| Recurso | Qué contiene |
| --- | --- |
| `assets/` | Banners, separadores, indicadores visuales y gráficos usados en los README. |
| `evidencias/` | Cierres, verificaciones y resultados técnicos de los Sprints 1 al 6. |
| `CONVENCIONES-GIT.md` | Reglas para ramas, commits, pull requests y trabajo colaborativo. |
| `ENTORNOS-Y-SECRETOS.md` | Configuración de entornos, variables y prácticas para no exponer secretos. |

##  Uso

Los README de la raíz, Frontend, Backend y DevOps reutilizan los assets de `assets/`. Las evidencias se consultan para respaldar las entregas de cada Sprint y relacionar actividades, pruebas y resultados.

Para añadir una evidencia:

1. Usa un nombre corto y descriptivo, por ejemplo `sprint-6-validacion-local-2026-10-29.md`.
2. Indica fecha, responsable, alcance, comandos o pasos ejecutados y resultado.
3. Incluye enlaces a archivos del repositorio, sin pegar secretos ni datos personales.
4. Verifica que las rutas relativas funcionen desde la carpeta `recursos-proyecto`.

##  Reglas de mantenimiento

- Este directorio contiene recursos compartidos; no reemplaza las carpetas funcionales del producto.
- Las pruebas y evidencias de QA se documentan aquí solo cuando son referencias generales del proyecto; los artefactos ejecutables permanecen en `QA/`.
- La documentación de API y diseño específico permanece junto al módulo correspondiente o en la rama `Documentacion`.
- No se deben subir tokens, contraseñas, archivos `.env` reales ni información personal.
- Si se renombra esta carpeta, deben actualizarse los enlaces de los README que consumen sus assets.

##  Relación con el repositorio

```text
recursos-proyecto/
├── assets/       ← elementos visuales compartidos
├── evidencias/   ← respaldos de validaciones y Sprints
├── *.md          ← convenciones y configuración general
└── README.md     ← guía de este directorio
```

Este espacio permite que las áreas trabajen con referencias comunes sin mezclar documentación general con el código de Frontend, Backend o la configuración de DevOps.
