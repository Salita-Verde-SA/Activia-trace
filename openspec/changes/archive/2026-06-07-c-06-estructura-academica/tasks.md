## 1. Modelado de Datos y Migración

- [x] 1.1 Crear modelos en SQLAlchemy para `Carrera`, `Cohorte` y `Materia` en `backend/models/estructura.py` (o similar), incluyendo FK a `tenant_id` y constraints de unicidad compuestos.
- [x] 1.2 Exportar los nuevos modelos en `backend/models/__init__.py`.
- [x] 1.3 Generar y revisar la migración de Alembic `004_carrera_cohorte_materia`.

## 2. Pydantic Schemas

- [x] 2.1 Crear `backend/schemas/carrera.py` con schemas para creación, actualización y lectura (incluyendo `model_config = ConfigDict(extra='forbid')`).
- [x] 2.2 Crear `backend/schemas/cohorte.py`.
- [x] 2.3 Crear `backend/schemas/materia.py`.

## 3. Repositories y Services

- [x] 3.1 Implementar `CarreraRepository`, `CohorteRepository` y `MateriaRepository` en `backend/repositories/`.
- [x] 3.2 Implementar `EstructuraService` (o servicios individuales por entidad) en `backend/services/`.
- [x] 3.3 Implementar en `EstructuraService` la validación de unicidad, el control de "Carrera Inactiva" para cohortes y el registro de eventos en el `AuditLog`.

## 4. API Endpoints

- [x] 4.1 Crear router `/api/admin/carreras` en `backend/api/routers/admin/carreras.py` protegiendo los endpoints con `require_permission("estructura:gestionar")`.
- [x] 4.2 Crear router `/api/admin/cohortes` en `backend/api/routers/admin/cohortes.py` con permisos requeridos.
- [x] 4.3 Crear router `/api/admin/materias` en `backend/api/routers/admin/materias.py` con permisos requeridos.
- [x] 4.4 Registrar los routers en `backend/api/routers/admin/__init__.py` o `app/main.py`.

## 5. Testing

- [x] 5.1. Escribir tests E2E para el ciclo de vida completo (alta, listar, inactivar).
- [x] 5.2. Verificar restricción de creación de cohortes en carreras inactivas.
- [x] 5.3. Verificar aislamiento por tenant en todos los queries y mutations.
