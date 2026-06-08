## ADDED Requirements

### Requirement: Panel de métricas de aviso
El sistema SHALL permitir al emisor o a roles administrativos consultar el estado de lectura de un aviso emitido, devolviendo la métrica de cobertura (leídos vs total de alcance).

#### Scenario: Visualización de lectura incompleta
- **WHEN** un admin consulta las métricas del aviso "Alerta de corte de luz" que afecta a "Cohorte 2026"
- **THEN** el sistema evalúa el número total de alumnos activos en "Cohorte 2026", cuenta los registros de `AcknowledgmentAviso` y retorna `{"total": 50, "ack_count": 45, "pending": 5}`.
