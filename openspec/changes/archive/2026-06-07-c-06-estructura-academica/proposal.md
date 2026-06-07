## Why

El sistema Active Trace requiere de una base estructural (carreras, materias y cohortes) sobre la cual se organizan las actividades académicas. Actualmente, la plataforma cuenta con la infraestructura de seguridad, multi-tenant y auditoría, pero no dispone de un catálogo maestro donde asentar planes de estudio y ciclos lectivos (cohortes). Esto impide habilitar los flujos principales de padrones, calificaciones, asignaciones docentes y módulos operativos dependientes de estos catálogos.

## What Changes

- Creación de los modelos de base de datos para `Carrera`, `Cohorte` y `Materia`.
- Implementación de los repositorios correspondientes, respetando el aislamiento por `tenant_id`.
- Implementación de la capa de servicios y rutas `ABM (Alta, Baja, Modificación)` bajo el endpoint `/api/admin/carreras`, `/api/admin/cohortes` y `/api/admin/materias`.
- Aplicación estricta de validaciones de unicidad a nivel base de datos (`(tenant_id, codigo)` para Carrera y Materia; `(tenant_id, carrera_id, nombre)` para Cohorte).
- **BREAKING**: (a nivel negocio) Se implementará la regla que impide la apertura de cohortes para carreras cuyo estado sea `Inactivo`.
- Cierre conceptual de las preguntas abiertas PA-01 (catálogo único de materias por tenant) y PA-07 (las cohortes pertenecen exclusivamente a una carrera).

## Capabilities

### New Capabilities
- `carrera`: Gestión del ciclo de vida y catálogo de carreras por tenant.
- `cohorte`: Administración de cohortes ligadas a una carrera y un período específico.
- `materia`: Gestión del catálogo centralizado de materias de la institución.

### Modified Capabilities

## Impact

- **Base de datos**: Se añade la migración `004` creando las tablas `carrera`, `cohorte`, y `materia` con sus respectivos índices compuestos y constraints de foreign keys hacia `tenant`.
- **API**: Nuevos endpoints expuestos bajo el prefijo `/api/admin/` protegidos con el permiso `estructura:gestionar` (exclusivo para el rol `ADMIN`).
- **Dependencias y flujos futuros**: Este módulo desbloquea la carga del Padrón y las Asignaciones Docentes, ya que cualquier registro posterior requiere la asociación previa de Carrera, Cohorte y Materia.
