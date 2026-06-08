## 1. Modelos de Base de Datos y Migraciones

- [x] 1.1 Crear los modelos SQLAlchemy `Evaluacion`, `ReservaEvaluacion` y `ResultadoEvaluacion` en `backend/models/evaluaciones.py`.
- [x] 1.2 Registrar el nuevo módulo en `backend/models/__init__.py`.
- [x] 1.3 Generar la migración de Alembic para crear las tablas correspondientes.

## 2. Esquemas Pydantic

- [x] 2.1 Crear esquemas en `backend/schemas/evaluacion.py` para listar, crear, y proveer métricas (ej. `EvaluacionCreate`, `EvaluacionMetrics`).
- [x] 2.2 Crear esquemas para importar/responder sobre reservas y registrar resultados (`ReservaImport`, `ResultadoCreate`).

## 3. Lógica de Negocio (Servicios)

- [x] 3.1 Implementar `EvaluacionService.crear_evaluacion` y `EvaluacionService.listar_globales` en `backend/services/evaluaciones.py`.
- [x] 3.2 Implementar `EvaluacionService.importar_reservas` validando los usuarios.
- [x] 3.3 Implementar `EvaluacionService.registrar_resultados` para la carga de calificaciones.
- [x] 3.4 Implementar `EvaluacionService.obtener_metricas` (cruzar reservas con resultados para obtener inscriptos, presentados, ausentes y % de aprobación).

## 4. Endpoints de la API

- [x] 4.1 Crear el router en `backend/api/endpoints/evaluaciones.py` con las rutas correspondientes.
- [x] 4.2 Registrar el router de evaluaciones en `backend/app/main.py`.

## 5. Pruebas Unitarias y Funcionales

- [x] 5.1 Testear el flujo de creación de evaluación y listado.
- [x] 5.2 Testear la correcta validación durante la importación de reservas.
- [x] 5.3 Validar que el panel de métricas responda con los cálculos correctos de asistencia y aprobación.
