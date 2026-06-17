## ADDED Requirements

### Requirement: Versionado del Padrón
El sistema SHALL mantener el historial de ingestas mediante versiones inmutables del padrón (`VersionPadron`) para cada `materia_id` y `cohorte_id`. Solo una versión SHALL ser la activa en un momento dado. Al crear una nueva versión, el sistema SHALL resolver el `usuario_id` de cada entrada usando el `email_hash` (blind index determinístico) para garantizar la vinculación correcta incluso cuando el email está cifrado en la base de datos.

#### Scenario: Ingesta de nuevo padrón exitosa
- **WHEN** un docente o sistema sube o importa un nuevo padrón correctamente
- **THEN** el sistema crea una nueva versión, la marca como activa y automáticamente desactiva la versión activa anterior de esa materia y cohorte

#### Scenario: Resolución de usuario_id por email_hash
- **WHEN** el sistema procesa las entradas del CSV importado
- **THEN** busca cada email en la tabla de usuarios usando `email_hash` (resultado de `get_blind_index(email.strip().lower())`) y asigna el `usuario_id` correspondiente si existe; deja `NULL` si el alumno no tiene cuenta en el sistema

### Requirement: Importación Manual de Excel y CSV
El sistema SHALL permitir la importación manual de un padrón de alumnos desde un archivo `.xlsx` o `.csv`, soportando la vista previa de las columnas y la validación de la información (ej. alumnos sin cuenta).

#### Scenario: Subida de archivo CSV
- **WHEN** el coordinador carga un archivo CSV delimitado con formato estándar Moodle
- **THEN** el sistema lee los registros, realiza el macheo contra usuarios existentes y genera las entradas del padrón correspondientes

### Requirement: Vaciado de Padrón
El sistema SHALL ofrecer un endpoint protegido que permita a un administrador o coordinador vaciar (soft-delete) todas las entradas del padrón y versiones de una materia y cohorte específica en caso de un error crítico de carga inicial.

#### Scenario: Vaciado de emergencia
- **WHEN** el usuario con permisos `padron:gestionar` ejecuta el comando de vaciado para una materia
- **THEN** el sistema desactiva todas las versiones del padrón vigentes y marca como eliminadas (soft delete) sus entradas, registrando la acción en auditoría
