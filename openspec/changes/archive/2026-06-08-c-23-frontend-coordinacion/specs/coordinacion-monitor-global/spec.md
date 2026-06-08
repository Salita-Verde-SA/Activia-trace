## ADDED Requirements

### Requirement: Monitor Global y Dashboards
El sistema SHALL proveer una colección de widgets analíticos al ADMIN para supervisar el uso de la plataforma, el estado de las comisiones y métricas transversales.

#### Scenario: Visualización del estado global
- **WHEN** el administrador accede a la ruta `/admin/monitor`.
- **THEN** la UI carga tarjetas informativas con las métricas más recientes sin bloquear el hilo principal, implementando estados de carga (skeletons) independientes por cada widget.
