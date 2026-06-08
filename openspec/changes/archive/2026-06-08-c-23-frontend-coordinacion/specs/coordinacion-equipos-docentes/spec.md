## ADDED Requirements

### Requirement: Gestión de Equipos Docentes
El sistema SHALL proveer una interfaz para que el COORDINADOR asigne, revoque y clone equipos docentes de manera individual o masiva.

#### Scenario: Clonado de equipo docente
- **WHEN** el coordinador selecciona una materia, una cohorte origen y una cohorte destino para clonar el equipo docente.
- **THEN** la UI confirma la operación, llama a la API de clonado y muestra el nuevo equipo asignado a la cohorte destino.

#### Scenario: Edición de vigencia
- **WHEN** el coordinador ajusta las fechas de inicio o fin de la asignación de un docente.
- **THEN** la UI guarda los cambios y la API asegura que el docente pierda el rol de PROFESOR automáticamente fuera del rango.
