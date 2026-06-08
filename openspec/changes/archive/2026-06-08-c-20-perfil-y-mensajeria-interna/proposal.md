## Why

Para lograr un sistema autónomo y multi-tenant, cada usuario del sistema debe tener control sobre la configuración de su propio perfil, especialmente sus datos fiscales y bancarios necesarios para el módulo de liquidaciones, reduciendo la carga administrativa. Paralelamente, la plataforma requiere de un sistema de mensajería interna (entre docentes, coordinadores, administración) que corra en paralelo a las comunicaciones unidireccionales de alumnos, garantizando trazabilidad y centralizando la resolución de dudas operativas dentro del sistema.

## What Changes

- **Edición de Perfil**: Endpoint para que el usuario autenticado pueda actualizar su nombre, alias CBU, datos fiscales, banco y modalidad de cobro (dejando el CUIL/DNI inmutables salvo intervención de Admin).
- **Mensajería Interna**: Modelo y endpoints para la creación, lectura y respuesta de hilos de mensajes directos (Direct Messages) entre usuarios del sistema (docentes, coordinadores, finanzas, etc.).
- **Bandeja de Entrada**: Interfaz API para listar conversaciones activas, ordenadas por última actualización, marcando mensajes no leídos.

## Capabilities

### New Capabilities
- `edicion-perfil`: Permite a un usuario autenticado modificar sus datos personales, bancarios y de contacto.
- `mensajeria-interna`: Habilita el envío de mensajes y respuestas en hilos entre usuarios del tenant.
- `bandeja-entrada`: Proporciona la lógica para listar, paginar y filtrar (ej. no leídos) los hilos de mensajes de un usuario.

### Modified Capabilities

## Impact

- **Modelos**: Se introducirá una nueva variante o tabla relacionada para `MensajeInterno` u operaremos sobre el modelo existente `MensajeDirecto` (creado en C-09) adaptándolo para comunicación bidireccional si no lo está.
- **API**: Nuevos endpoints bajo `/api/perfil` y `/api/mensajes/internos`.
- **Seguridad**: Los endpoints deben asegurar que un usuario solo pueda editar su propio perfil, y solo pueda leer/responder hilos donde es participante.
