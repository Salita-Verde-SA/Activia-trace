## Context

En el contexto de Active Trace, la identidad de los usuarios y sus roles asignados son fundamentales para el control de acceso y el modelo multi-tenant. Hasta ahora, el sistema manejaba autenticación base, pero falta el modelado completo de los usuarios con protección de datos personales (PII) cifrada con AES-256 (como requiere la arquitectura) y la gestión de asignaciones de roles jerárquicos a contextos académicos específicos.

## Goals / Non-Goals

**Goals:**
- Implementar el modelo `Usuario` protegiendo la PII (`email`, `dni`, `cuil`, `cbu`, `alias_cbu`) mediante cifrado en base de datos.
- Proveer el modelo `Asignacion` para la asignación de roles granulares.
- Implementar los endpoints de administración de ABM de usuarios y asignaciones respetando `tenant_id` y permisos.

**Non-Goals:**
- No se implementará en esta fase la lógica de liquidación de honorarios (aunque se sienten las bases de datos de `cbu`/`cuil`).
- No se implementa registro abierto de usuarios (todo usuario es creado por ADMIN u orquestación).

## Decisions

- **Cifrado de PII:** Se utilizará el cifrado AES-256 (utilizando `Fernet` u otro en `core.security.encryption`) con un TypeDecorator personalizado en SQLAlchemy para cifrar/descifrar en vuelo los campos como `dni`, `cuil`, `cbu`.
- **Identificadores:** El legajo es un campo opcional y derivado de negocio. No se utiliza como PK. La PK es UUID (`id`).
- **Estado de Asignaciones:** La asignación cuenta con un lapso de vigencia (`desde`/`hasta`). Las asignaciones vencidas no se eliminan físicamente (histórico), pero la autorización `require_permission` debe evaluar `estado_vigencia` o fechas activas al momento del request.
- **Unicidad de Usuario:** Se mantendrá restricción de unicidad para el par `(tenant_id, email)` utilizando un hash determinista si el email está cifrado (o, si es necesario para búsqueda y login, mantener el email en hash determinista separado del cifrado bidireccional).

## Risks / Trade-offs

- **Cifrado en búsquedas:** Buscar por email o DNI es complejo si están cifrados de forma no determinista (ej. salting por fila).
  *Mitigación:* Para el email (que se usa para login), se implementará un hash determinista (blind index) o se almacenará el email normalizado si se decide que no requiere cifrado AES (revisar definición estricta de PII para email en login vs datos duros como CBU).
- **Sobrecarga en middleware de permisos:** Evaluar vigencia en cada request podría ser costoso.
  *Mitigación:* Caché o inclusión de roles activos directamente en el JWT, o índices optimizados.
