## ADDED Requirements

### Requirement: Registro y exclusión de docentes con factura
El sistema SHALL permitir registrar las facturas cargadas por docentes bajo esta modalidad. Los docentes que tienen facturas registradas en el período SHALL ser excluidos del total de la liquidación general, separándose contablemente.

#### Scenario: Exclusión de liquidación general
- **WHEN** el docente `A` está marcado como emisor de factura y sube la factura del mes actual,
- **THEN** su monto se calcula, pero el registro de `Liquidacion` tiene el flag `excluido_por_factura=True`, lo que permite que finanzas separe el monto a abonar en cuentas distintas.
