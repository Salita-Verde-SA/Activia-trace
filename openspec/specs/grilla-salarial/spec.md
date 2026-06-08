# grilla-salarial Specification

## Purpose
TBD - created by archiving change c-18-liquidaciones-y-honorarios. Update Purpose after archive.
## Requirements
### Requirement: Gestión de Grilla Salarial
El sistema SHALL proveer un ABM para que FINANZAS gestione los valores históricos de `SalarioBase` y `SalarioPlus`, definiendo su fecha de vigencia (`desde`, `hasta`).

#### Scenario: Cambio de valores salariales
- **WHEN** finanzas inserta un nuevo valor de `SalarioBase` para el rol `PROFESOR` con vigencia desde `01-06-2026`.
- **THEN** el sistema establece la fecha `hasta` del valor anterior en `31-05-2026` y utiliza el nuevo monto para cálculos de liquidaciones generadas para fechas posteriores al 1 de junio de 2026.

