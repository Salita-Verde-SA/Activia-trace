## ADDED Requirements

### Requirement: Vista de equipos por docente
El sistema SHALL proveer un endpoint para que un docente pueda visualizar las asignaciones vigentes donde está involucrado, facilitando la consulta rápida de sus clases y permisos actuales.

#### Scenario: Docente consulta sus equipos
- **WHEN** un docente autenticado solicita la vista de "mis-equipos"
- **THEN** el sistema retorna la lista de sus asignaciones filtrada por el tenant_id actual y fecha vigente

### Requirement: Asignación Masiva
El sistema SHALL permitir la creación de múltiples asignaciones en una sola operación transaccional, asociando un grupo de docentes a una materia, carrera, cohorte y rol con un rango de fechas.

#### Scenario: Administrador asigna bloque de profesores
- **WHEN** el coordinador envía un bloque de docentes para la materia "Programación" en el primer cuatrimestre
- **THEN** el sistema crea todas las asignaciones juntas o falla la transacción completa en caso de error

### Requirement: Clonado de equipos
El sistema SHALL permitir la duplicación de todas las asignaciones vigentes de una materia/cohorte hacia otra cohorte (o período), requiriendo establecer nuevas fechas `desde` y `hasta`.

#### Scenario: Coordinador clona el equipo del año anterior
- **WHEN** se clona el equipo docente de la Cohorte 2025 a la Cohorte 2026
- **THEN** el sistema crea nuevas asignaciones para los mismos docentes con las nuevas fechas especificadas

### Requirement: Exportación de equipos
El sistema SHALL proveer una forma de exportar la conformación del equipo docente de un contexto a un archivo descargable.

#### Scenario: Exportación a archivo
- **WHEN** el administrador solicita exportar el equipo docente
- **THEN** el sistema genera un archivo conteniendo roles, docentes, materia y fechas de vigencia
