## MODIFIED Requirements

### Requirement: Layout y navegación del rol ALUMNO
El sistema SHALL mostrar en el `Sidebar` las rutas permitidas para el rol ALUMNO, excluyendo cualquier ruta de administración o docente.

#### Scenario: Alumno navega por el portal
- **WHEN** el alumno inicia sesión
- **THEN** visualiza las opciones "Dashboard", "Mi Estado", "Mis Avisos" y "Coloquios" y puede navegar entre ellas de forma fluida a través de las rutas definidas en `App.tsx` (`/alumno/estado`, `/alumno/avisos`, `/alumno/coloquios`).
