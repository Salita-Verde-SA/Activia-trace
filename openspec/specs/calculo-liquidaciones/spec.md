## MODIFIED Requirements

### Requirement: Cálculo acumulativo del Plus salarial
El sistema SHALL calcular el monto total de Plus sumando el importe correspondiente de **cada comisión individual** asignada al docente, permitiendo la acumulación múltiple de pluses que compartan la misma clave.

#### Scenario: Múltiples comisiones de la misma familia
- **WHEN** un docente tiene 3 comisiones activas de una materia que otorga Plus
- **THEN** el motor de cálculo suma 3 veces el monto del Plus a la remuneración Base
