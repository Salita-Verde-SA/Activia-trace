---
name: python-testing-patterns
description: Patrones avanzados y lecciones aprendidas para testing en Python, específicamente con FastAPI, SQLAlchemy (asyncpg), pytest y pytest-asyncio. Úsala siempre que vayas a escribir, depurar o configurar tests de integración, unitarios o E2E.
---

# Python Testing Patterns (FastAPI + SQLAlchemy Async)

Esta skill documenta las mejores prácticas y los "gotchas" descubiertos en el proyecto para evitar cuellos de botella y bloqueos (hangs) eternos durante las pruebas.

## Reglas Duras de Testing

1. **Sin Mocks de DB:** ¡Jamás mockees la base de datos! Usá una base de datos real (Test Container) o una base efímera configurada dinámicamente. El mock invalida la prueba de integración.
2. **Strict TDD:** Escribí el test primero. Si falla, escribí el código mínimo. Triangulá y luego refactorizá. Cobertura mínima: 80% líneas, 90% reglas de negocio.
3. **Aislamiento de Tests:** Cada test debe ser independiente. Limpiá las tablas entre ejecuciones o transacciones.

## Configuración y Evitar "Hangs" / Deadlocks

Trabajar con `pytest-asyncio` y `asyncpg` puede generar bloqueos y comportamientos silenciosos si no se configuran bien los pools y dependencias:

### 1. Manejo del Engine de Base de Datos
- **Utilizá `NullPool`:** Para las bases de datos de test, configurá SQLAlchemy con `poolclass=NullPool`. Esto fuerza a que cada conexión se abra y cierre explícitamente, evitando que queden conexiones abiertas (zombies) que bloqueen las operaciones `DROP TABLE` posteriores.
- **Sobreescritura de Dependencias:** Usá `app.dependency_overrides[get_db] = _override_get_db`. Asegurate de que la sesión del test use la MISMA URL/Engine de test.

### 2. Ciclo de Vida de Fixtures Asíncronos
- Usá `@pytest_asyncio.fixture` en lugar de `@pytest.fixture` para fixtures asíncronos que usen `yield`.
- **Excepción común de `await`:** Si tu fixture asíncrono devuelve un diccionario u objeto de Python normal (ej. `return {"user": user}`), NO le hagas `await` dentro del test (`user_data = await test_user` lanzará `TypeError: object dict can't be used in 'await' expression`). El framework evalúa la corrutina antes de inyectarla.
- **Deadlocks por Imports Faltantes:** Si un test falla y se interrumpe abruptamente por un `ImportError` o un `UnboundLocalError`, las rutinas de `finally` podrían no cerrar conexiones limpiamente. Solucioná los errores de Python simples antes de pensar que Postgres se trabó.

### 3. TestClient y Lifespan
- Usar `httpx.AsyncClient` con `ASGITransport(app=app)`.
- Si experimentás "hangs" durante llamadas a `client.post()`, revisá si el endpoint está abriendo una conexión nueva que compite con un bloqueo (lock) de fila generado por una transacción no commiteada en el `db_session` del test. Hacé `await db_session.commit()` antes de usar el `client` si ambos interactúan con la misma data.

### 4. Fixtures y Setup de Datos Globales (Evitar IntegrityError)
- **Conflictos en datos sin tenant (ej. Permisos/Roles):** Al ejecutar tests concurrentes o iterativos en una sesión de test que no hace truncado total (como al levantar todo el modelo por cada test), usar chequeos en memoria (`if no existe: inserta`) para datos compartidos causará condiciones de carrera y fallos por `IntegrityError` debido a asincronía.
- **Patrón a usar:** SIEMPRE usá operaciones "Upsert" nativas de base de datos (por ejemplo, `insert(...).on_conflict_do_nothing()`) desde las fixtures o funciones de setup cuando inicialices datos estáticos o metadatos de configuración.

## Patrones de Clean Architecture

- **Testear Repositories:** Los tests de repository deben asegurar que el filtrado por `tenant_id` y el soft-delete funcionan correctamente de forma predeterminada (aislamiento Row-Level). Instanciá modelos de prueba (ej. `DummyModel`) y verificá el aislamiento en queries.
- **Testear Services:** Deben testear la lógica del negocio sin depender del enrutador web.
- **Testear Endpoints (Routers):** Deben testear serialización, respuestas HTTP correctas (códigos 200, 401, 403, 404) y dependencias de auth (validar JWT).

## Qué hacer si la suite de tests se cuelga eternamente:

1. Probablemente haya una conexión zombie en la BD porque cancelaste un test en medio de la ejecución.
2. Solución rápida (vía docker): `docker restart <nombre-del-contenedor-postgres>`.
3. Validá si algún `db_session` no fue cerrado o si quedó un error de sintaxis silenciado que impidió llegar al bloque `finally` del engine de tests.
