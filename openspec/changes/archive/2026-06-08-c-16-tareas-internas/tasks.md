## 1. Modelos de Base de Datos y Migraciones

- [x] 1.1 Crear los modelos SQLAlchemy `Tarea` y `ComentarioTarea` en `backend/models/tareas.py`.
- [x] 1.2 Registrar el nuevo módulo en `backend/models/__init__.py`.
- [x] 1.3 Generar la migración de Alembic para crear las tablas correspondientes.

## 2. Esquemas Pydantic

- [x] 2.1 Crear esquemas para `Tarea` en `backend/schemas/tarea.py` (creación, respuesta y listado filtrado).
- [x] 2.2 Crear esquemas para `ComentarioTarea` (creación, respuesta).

## 3. Lógica de Negocio (Servicios)

- [x] 3.1 Implementar `TareaService.crear_tarea` en `backend/services/tareas.py` manejando validación de asignación.
- [x] 3.2 Implementar `TareaService.listar_mis_tareas` para devolver tareas donde `asignado_a` es el usuario actual.
- [x] 3.3 Implementar `TareaService.cambiar_estado` permitiendo la transición (Pendiente, En progreso, Resuelta, Cancelada).
- [x] 3.4 Implementar `TareaService.agregar_comentario` y `TareaService.listar_comentarios` de una tarea.
- [x] 3.5 Implementar `TareaService.listar_globales` para administración global (filtros por `asignado_a` y `estado`).

## 4. Endpoints de la API

- [x] 4.1 Crear el router en `backend/api/endpoints/tareas.py` con las rutas correspondientes.
- [x] 4.2 Registrar el router de tareas en `backend/api/endpoints/__init__.py` y `backend/app/main.py`.

## 5. Pruebas Unitarias y Funcionales

- [x] 5.1 Testear el flujo de creación de tarea, asignación cruzada y guardado de `asignado_por`.
- [x] 5.2 Testear las transiciones de estado y la adición de comentarios en el hilo.
- [x] 5.3 Validar que los filtros del listado global respondan de acuerdo a los permisos y criterios provistos.
