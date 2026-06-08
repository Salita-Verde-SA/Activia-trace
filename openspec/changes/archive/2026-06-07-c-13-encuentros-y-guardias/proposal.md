## Why

Para administrar y hacer un seguimiento efectivo de los encuentros sincrónicos (tanto regulares como únicos), Activia Trace necesita incorporar modelos para "SlotEncuentro" e "InstanciaEncuentro". Además, la institución requiere un registro y exportación formal de las "Guardias" de tutores o coordinadores para propósitos organizativos y de auditoría.

## What Changes

- Modelos `SlotEncuentro` (patrón recurrente), `InstanciaEncuentro` (clase específica) y `Guardia`.
- Endpoints de ABM para generar encuentros recurrentes o únicos con cálculo automático de instancias según la cantidad de semanas.
- Edición granular de cada instancia de encuentro (modificar estado, agregar enlaces de Meet y grabaciones de clase).
- Generación y exportación de bloques HTML estructurados que los docentes pueden copiar y pegar en el aula virtual de Moodle.
- Registro de tutores y administradores de guardias operativas, con capacidades de exportación global.

## Capabilities

### New Capabilities
- `encuentros-recurrentes`: Creación y proyección matemática de instancias basadas en un patrón o slot de repetición semanal.
- `gestion-instancias`: Posibilidad de modificar cada instancia de clase (links de clases, estados de dictado) o cancelarla independientemente del slot padre.
- `generacion-bloque-html`: Producción de HTML para Moodle donde se resumen los encuentros y recursos por cada asignatura/comisión.
- `registro-guardias`: Registro formal de guardias de tutores o coordinadores.

### Modified Capabilities

- No existen capabilities previas modificadas en el dominio de encuentros y guardias, es una feature completamente nueva.

## Impact

- **Nuevas API**: Rutas bajo `/api/encuentros/*` y `/api/guardias/*` protegidas por el guard `encuentros:gestionar`.
- **Estructura de Base de Datos**: Tres nuevas entidades (`SlotEncuentro`, `InstanciaEncuentro` y `Guardia`) ligadas transversalmente a la estructura académica (materias/asignaciones).
