# Sistema Interoperable para la Gestión de Trámites Migratorios en Panamá

## Documentación del proyecto

La documentación se organiza en cuatro documentos independientes y un backlog de siete sprints. Los cinco entregables están conectados entre sí: la arquitectura define la estructura técnica; el plan de acción organiza el trabajo; el plan de desarrollo explica cómo se construirá el sistema; el plan de pruebas establece cómo se validará; y el backlog convierte el proyecto en épicas, historias de usuario y tareas ejecutables.

La propuesta parte del problema identificado: los trámites migratorios pueden tardar entre 3 y 8 meses, según el caso planteado, debido a la entrega repetida de documentos y a las validaciones manuales. La solución busca reducir tareas redundantes mediante intercambios de información autorizados entre el Servicio Nacional de Migración (SNM), el Tribunal Electoral (TE), la Caja de Seguro Social (CSS) y el Registro Público de Panamá, con la posible participación de la Autoridad Nacional para la Innovación Gubernamental (AIG) en la coordinación tecnológica.

Alcance importante: la integración real con los sistemas institucionales dependerá de los permisos, convenios, interfaces disponibles y validaciones jurídicas correspondientes. Por ello, el prototipo académico debe poder funcionar con datos ficticios y servicios simulados, sin asumir acceso directo a bases de datos gubernamentales.

## Índice de entregables

| # | Documento | Archivo |
| --- | --------- | ------- |
| 1 | Propuesta de arquitectura | [01-propuesta-de-arquitectura.md](01-propuesta-de-arquitectura.md) |
| 2 | Plan de acción | [02-plan-de-accion.md](02-plan-de-accion.md) |
| 3 | Plan de desarrollo | [03-plan-de-desarrollo.md](03-plan-de-desarrollo.md) |
| 4 | Plan de pruebas | [04-plan-de-pruebas.md](04-plan-de-pruebas.md) |
| 5 | Backlog detallado del proyecto: siete sprints | [05-backlog-siete-sprints.md](05-backlog-siete-sprints.md) |
| 6 | Roles y accesos | [06-roles-y-accesos.md](06-roles-y-accesos.md) |

## Documentos por rama de trabajo

Derivados del backlog maestro (`05-backlog-siete-sprints.md`), cada documento explica a una rama **qué tiene que hacer** (historias y tareas por sprint) y **con qué hacerlo** (herramientas obligatorias y complementarias):

| Rama | Archivo | Herramientas obligatorias principales |
| --- | --- | --- |
| Frontend | [Rama-01-Frontend.md](Rama-01-Frontend.md) | Docker, Java (lectura de API), JMeter y ZAP en correcciones |
| Backend | [Rama-02-Backend.md](Rama-02-Backend.md) | Java, Docker, JMeter y ZAP en correcciones |
| QA y Seguridad | [Rama-03-QA-Seguridad.md](Rama-03-QA-Seguridad.md) | OWASP ZAP, Apache JMeter, Docker, Java |
| Producto y Documentación | [Rama-04-Producto-Documentacion.md](Rama-04-Producto-Documentacion.md) | Docker, revisión de informes ZAP/JMeter |
| DevOps | [Rama-05-DevOps.md](Rama-05-DevOps.md) | Docker (central), Git/CI, Java (compilación), entornos de ZAP y JMeter |

## Diferencia entre los documentos

| Documento | Qué define |
| --------- | ---------- |
| Propuesta de arquitectura | Cómo se estructura el sistema y cómo se comunican sus componentes. |
| Plan de acción | Qué se hará, en qué orden, quién lo hará, qué recursos necesita y cómo se medirá el resultado. |
| Plan de desarrollo | Cómo se implementarán los módulos, las bases de datos, las API y las reglas de negocio. |
| Plan de pruebas | Cómo se comprobarán la funcionalidad, la seguridad, el rendimiento y la usabilidad. |
| Backlog | Qué épicas, historias de usuario y tareas concretas se ejecutarán en cada uno de los siete sprints. |
| Roles y accesos | Quién accede al sistema, a qué pantallas, API y datos, bajo qué reglas de autenticación y auditoría. |
