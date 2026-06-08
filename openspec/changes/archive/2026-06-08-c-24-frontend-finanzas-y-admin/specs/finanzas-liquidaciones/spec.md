## ADDED Requirements

### Requirement: Panel de vista de liquidaciones
The system SHALL display a panel with liquidaciones of the period segmented by (general / NEXO / factura).

#### Scenario: View liquidaciones
- **WHEN** the user navigates to the liquidaciones view
- **THEN** the system displays segments and KPIs corresponding to the liquidaciones

### Requirement: Cerrar liquidación
The system SHALL provide a way to close an open liquidación.

#### Scenario: Close liquidación
- **WHEN** the user triggers the close action on a liquidación
- **THEN** the liquidación is immutably closed

### Requirement: Historial de liquidaciones
The system SHALL provide a view to check past liquidaciones.

#### Scenario: View history
- **WHEN** the user visits the historial tab
- **THEN** they see past closed liquidaciones
