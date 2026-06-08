## ADDED Requirements

### Requirement: Cálculo de liquidaciones mensuales
El sistema SHALL permitir calcular la liquidación mensual de todos los usuarios docentes. El cálculo SHALL sumar el Salario Base (por el rol asignado en el período) y el Salario Plus (por la clave de la materia dictada, acumulado una sola vez por clave y rol).

#### Scenario: Cálculo con múltiples comisiones de igual clave
- **WHEN** un profesor tiene 3 comisiones vigentes de la materia `Programación I` (cuya clave es `PROG`) y solicita la pre-liquidación.
- **THEN** el sistema retorna la suma de `SalarioBase(PROFESOR) * 3` más `SalarioPlus(PROG, PROFESOR) * 1`.
