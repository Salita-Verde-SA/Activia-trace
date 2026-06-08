## 1. Schema y Payload de DTOs

- [x] 1.1 Definir los Pydantic Schemas para la creación masiva de asignaciones (`AsignacionMasivaCreate`).
- [x] 1.2 Definir los Pydantic Schemas para la respuesta de equipos docentes (`EquipoDocenteView`), incluyendo cruces con la información de materia y rol.
- [x] 1.3 Definir el DTO para el input de clonado de equipos (`ClonadoEquipoRequest`).

## 2. Lógica de Servicio (AsignacionService)

- [x] 2.1 Implementar el método `asignar_bloque` en `AsignacionService` para la inserción masiva transaccional validando fechas.
- [x] 2.2 Implementar el método `clonar_equipo` que duplique el grupo de docentes de una materia/cohorte hacia otra con nuevas fechas.
- [x] 2.3 Implementar el método `modificar_vigencia_equipo` para actualizar en bloque el campo `hasta` (y/o `desde`) de un grupo de docentes.
- [x] 2.4 Asegurarse de que cada método emita correctamente los eventos de auditoría correspondientes (`ASIGNACION_MODIFICAR`).

## 3. Endpoints de API

- [x] 3.1 Implementar el endpoint `POST /api/equipos/asignacion-masiva` protegido por `equipos:asignar`.
- [x] 3.2 Implementar el endpoint `POST /api/equipos/clonar` protegido por `equipos:asignar`.
- [x] 3.3 Implementar el endpoint `PATCH /api/equipos/vigencia` protegido por `equipos:asignar`.
- [x] 3.4 Implementar el endpoint `GET /api/equipos/mis-equipos` disponible para el rol DOCENTE/PROFESOR/TUTOR.
- [x] 3.5 Implementar endpoint para la exportación de la grilla de equipo (CSV o JSON list).

## 4. Testing

- [x] 4.1 Añadir tests unitarios en `test_asignacion.py` para la lógica de inserción masiva en `AsignacionService`.
- [x] 4.2 Añadir tests de clonado de equipos, asegurando que las nuevas asignaciones contengan las fechas pasadas por parámetro y no sobreescriban las anteriores.
- [x] 4.3 Testear el endpoint `mis-equipos` con un docente autenticado.
