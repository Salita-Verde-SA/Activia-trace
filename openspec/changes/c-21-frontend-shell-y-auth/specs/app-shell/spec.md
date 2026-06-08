## ADDED Requirements

### Requirement: Layout de Aplicación (Shell)
El sistema SHALL proveer un Layout Principal (Shell) que contenga la barra de navegación lateral (Sidebar) y el Header superior, reservando un área principal para el renderizado del contenido de las páginas.

#### Scenario: Visualización del Shell
- **WHEN** un usuario autenticado ingresa a cualquier ruta protegida (e.g. `/`)
- **THEN** se renderiza la página envuelta en el Layout Principal con el Sidebar visible y responsivo.

### Requirement: Sidebar Dinámico Basado en Roles
El Sidebar SHALL renderizar únicamente los enlaces (rutas) a los módulos a los cuales el usuario autenticado tiene acceso según sus roles.

#### Scenario: Visualización como Docente
- **WHEN** un usuario con rol exclusivo de `PROFESOR` se loguea
- **THEN** el Sidebar muestra opciones como "Mis Materias" o "Calificaciones", pero oculta opciones administrativas como "Liquidaciones" o "Panel de Auditoría".

### Requirement: Protección de Rutas Cliente
El enrutador frontend (React Router) SHALL impedir el acceso a las rutas hijas del Shell si no hay un usuario autenticado, redirigiendo al inicio de sesión.

#### Scenario: Intento de acceso sin sesión
- **WHEN** un visitante anónimo navega directamente a `/dashboard`
- **THEN** el sistema lo redirige inmediatamente a `/login`
