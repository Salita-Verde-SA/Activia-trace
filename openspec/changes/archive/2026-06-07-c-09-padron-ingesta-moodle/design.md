## Context

El ingreso de datos sobre los alumnos y sus cursadas (el padrón) es el paso fundamental para que el sistema funcione. Actualmente, Moodle es la fuente de la verdad académica en la institución. Se requiere ingestar estos datos periódicamente (para mantener la lista de alumnos actualizada) y también recuperar las actividades que deben ser corregidas. Al mismo tiempo, dado que Moodle puede caerse o ser inaccesible, necesitamos contar con un sistema de respaldo (fallback) manual vía importación de Excel/CSV.

## Goals / Non-Goals

**Goals:**
- Implementar un cliente HTTP robusto en `integrations/moodle_ws.py` para sincronizar usuarios, comisiones y actividades usando los web services expuestos por Moodle.
- Soportar importación manual de padrones mediante la carga de archivos `.xlsx` y `.csv`.
- Implementar un versionado inmutable del padrón usando `VersionPadron` y `EntradaPadron`. Activar una nueva versión del padrón debe desactivar la versión activa anterior de la misma materia×cohorte.
- Proveer un endpoint de emergencia (vaciado) para limpiar por completo una materia mal cargada.

**Non-Goals:**
- En este change NO se procesarán calificaciones. Solamente se sincronizarán los usuarios (y se guardará un mapping de los IDs de Moodle) junto con el catálogo de actividades, preparando el terreno para `C-10 calificaciones-y-umbral`.
- Las tareas asíncronas / cron jobs (worker de Cola) se implementarán en la capa correspondiente (`C-12`). Aquí solo sentamos la base de los modelos y lógica síncrona.

## Decisions

1. **Versionado Inmutable**: En vez de hacer UPSERT sobre la tabla `EntradaPadron`, creamos un `VersionPadron` cada vez que se ingesta. Si la ingesta es correcta, se marca esta versión como la `activa=True` y se desactiva la anterior. Esto permite tener auditoría perfecta y facilitar un "rollback".
2. **Cliente Moodle Aislado**: Toda interacción con Moodle se centralizará en `integrations/moodle_ws.py`. No habrá librerías externas complejas, usaremos peticiones `httpx` al endpoint `/webservice/rest/server.php`. Moodle responde con errores 200 OK + payload de error, por lo que este cliente deberá parsearlos correctamente y transformarlos en excepciones estándar internas (que serán mapeadas a un error HTTP 502 Bad Gateway para los frontends).
3. **Mapeo de Usuarios**: Si un usuario viene del padrón y no existe en nuestra tabla `Usuario`, se insertará sin datos sensibles hasta que acceda, o se relacionará vía `email` o `documento`.

## Risks / Trade-offs

- **[Risk] Moodle Web Services Lentos o Caídos** → Mitigación: Uso de timeouts y manejo estandarizado de `httpx.ConnectError` transformándolos en HTTP 502, con la alternativa de fallback manual activa para el usuario.
- **[Risk] Archivos Excel muy grandes bloqueando el Event Loop** → Mitigación: Uso de librerías en hilos (`openpyxl` vía `run_in_threadpool` de FastAPI o `anyio.to_thread`) o bien límites en el tamaño de subida.
