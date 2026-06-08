## 1. Modelos y Base de Datos

- [x] 1.1 Crear el modelo `ProgramaMateria` en `backend/models/programas.py` con sus relaciones a Materia, Carrera, Cohorte y su `tenant_id`.
- [x] 1.2 Crear el modelo `FechaAcademica` en `backend/models/programas.py` (o en un archivo separado `fechas.py`) con tipo de evento y `tenant_id`.
- [x] 1.3 Generar la migración de Alembic para ambas tablas.

## 2. API y Backend (Programas)

- [x] 2.1 Crear schemas Pydantic para `ProgramaMateria` (Create, Update, Response).
- [x] 2.2 Implementar `ProgramaMateriaRepository` con soporte para multi-tenancy.
- [x] 2.3 Implementar `ProgramaMateriaService` con la validación de integridad (Materia-Carrera-Cohorte).
- [x] 2.4 Exponer `/api/programas` en FastAPI con permisos (`estructura:gestionar`) para upload/consulta.

## 3. API y Backend (Fechas Académicas)

- [x] 3.1 Crear schemas Pydantic para `FechaAcademica`.
- [x] 3.2 Implementar `FechaAcademicaRepository`.
- [x] 3.3 Implementar `FechaAcademicaService`.
- [x] 3.4 Exponer `/api/fechas-academicas` en FastAPI con rutas CRUD.

## 4. Pruebas Backend

- [x] 4.1 Escribir pruebas para el repositorio y servicio de `ProgramaMateria`.
- [x] 4.2 Escribir pruebas para el repositorio y servicio de `FechaAcademica`.
- [x] 4.3 Pruebas E2E de los endpoints creados con FastAPI `TestClient`.

## 5. Frontend

- [x] 5.1 Crear tipos y servicios Axios para llamadas a `/api/programas` y `/api/fechas-academicas`.
- [x] 5.2 Implementar el hook `useProgramas` y `useFechasAcademicas` con React Query.
- [x] 5.3 Crear la UI para listar, subir y borrar programas.
- [x] 5.4 Crear la UI para el calendario/listado de fechas académicas.
