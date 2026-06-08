## ADDED Requirements

### Requirement: Cierre de liquidación
El sistema SHALL permitir cerrar la liquidación de un período. Una liquidación cerrada SHALL ser inmutable, persistiendo el detalle del cálculo en un formato estructurado y registrando el evento de auditoría.

#### Scenario: Cierre inmutable
- **WHEN** un usuario de finanzas cierra la liquidación del mes 05-2026.
- **THEN** el sistema guarda el snapshot de montos y componentes, cambia el estado a "Cerrada", impide cualquier actualización futura sobre ese registro, y genera el evento de auditoría `LIQUIDACION_CERRAR`.
