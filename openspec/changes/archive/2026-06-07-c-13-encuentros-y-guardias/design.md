## Context
La institución necesita herramientas para la planificación y seguimiento de encuentros sincrónicos recurrentes (ej. tutorías semanales) y guardias del personal, asegurando que estos se integren al ecosistema de Activia Trace para auditorías, generación de cronogramas y futura liquidación de horas o KPIs.

## Goals / Non-Goals

**Goals:**
- Centralizar la generación de encuentros usando un modelo de herencia (Slot -> Instancias).
- Permitir la exportación de cronogramas de encuentros a HTML para inserción manual en Moodle.
- Administrar el registro de guardias (fecha, horas, reporte).

**Non-Goals:**
- No se creará integración con Google Calendar API (solo se guarda la URL proveída por el docente).
- No se requiere controlar la asistencia ni puntualidad de los alumnos o docentes en esta fase.

## Decisions

- **Modelo Slot-Instancia**: Se empleará un patrón donde el `SlotEncuentro` funciona como el patrón de recurrencia (día de la semana, hora, repeticiones) y la `InstanciaEncuentro` representa cada materialización en una fecha concreta. Esto permite alterar (suspender, reprogramar, comentar) una clase individual sin romper el modelo maestro.
- **Exportación HTML**: Se generará un snippet de HTML puro desde el backend (o UI) que el docente puede insertar directamente en su bloque de Moodle.
- **Modelo de Guardias**: Se crearán registros directos de cumplimiento de horas de guardia atados al usuario, sin dependencia del modelo de encuentros.

## Risks / Trade-offs

- **[Risk]** Generación masiva accidental de instancias.
  - **Mitigation:** Validación estricta limitando la cantidad máxima de semanas recurrentes (ej: máximo 20 o 25 semanas por cuatrimestre).
- **[Risk]** Problemas con husos horarios (Timezones) en cálculos semanales.
  - **Mitigation:** Las fechas se guardarán en DB explícitamente como TIMESTAMP WITH TIME ZONE.
