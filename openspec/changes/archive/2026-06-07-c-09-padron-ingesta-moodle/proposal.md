## Why

La institución necesita consolidar la información del alumnado (padrón) proveniente del LMS (Moodle) y otros sistemas para poder dar seguimiento académico. Resulta vital poder importar esta información tanto de forma manual (archivos Excel/CSV) como a través de una integración automática con los Web Services de Moodle, manteniendo el historial de versiones del padrón y soportando operaciones seguras como el vaciado de datos en caso de errores en la carga inicial.

## What Changes

- **Modelos de Padrón Versionado**: Creación de los modelos `VersionPadron` y `EntradaPadron`. Solo existirá una versión activa por `materia × cohorte`; activar una nueva desactivará automáticamente la anterior.
- **Importación Manual (Fallback)**: Endpoints para subir, previsualizar y confirmar archivos `.xlsx` y `.csv` de padrones (F1.3, F1.4).
- **Integración con Moodle Web Services**: Creación de un cliente en `integrations/moodle_ws.py` capaz de realizar la sincronización de usuarios y actividades (on-demand y nocturna). Manejo robusto de errores HTTP 502 con lógicas de reintento.
- **Vaciado de Materia**: Operación de emergencia para vaciar todos los datos de cursada de una materia (F1.5, RN-04).
- **Auditoría**: Generación de log de auditoría `PADRON_CARGAR` tras una actualización del padrón.

## Capabilities

### New Capabilities
- `padron-gestion`: Gestión del ciclo de vida del padrón de alumnos (importación manual, versionado, vaciado).
- `moodle-integration`: Integración con Moodle Web Services para la sincronización automática de padrones y actividades.

### Modified Capabilities
- `<existing-name>`: (No se modifican specs previas, todo se maneja mediante nuevas capacidades de dominio).

## Impact

- **API**: Nuevos endpoints de ingesta manual bajo `/api/padron/*` (o similar, respetando guards como `padron:gestionar`).
- **Base de Datos**: Nuevas tablas `version_padron` y `entrada_padron`.
- **Integraciones**: Incorporación de un nuevo cliente HTTP dedicado a consumir los endpoints XML-RPC / REST del LMS Moodle.
- **Sistema Asíncrono**: Preparación del terreno (si es requerido en el diseño) para soportar la sincronización nocturna (cron job).
