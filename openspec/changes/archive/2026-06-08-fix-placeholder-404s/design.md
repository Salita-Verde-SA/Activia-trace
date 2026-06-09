## Context

En React, el dashboard base incluye vistas de datos que se montan sin una selección previa de contexto (por ejemplo, sin una materia seleccionada explícitamente por el usuario). Para mantener el tipado y el flujo, la UI inyecta un UUID vacío `00000000-0000-0000-0000-000000000000`. Esto provoca que el backend de FastAPI devuelva `404 Not Found` en la base de datos real.

## Goals / Non-Goals

**Goals:**
- Prevenir que React Query haga refetching continuo de endpoints fallidos por placeholders.
- Evitar que la consola se inunde de errores HTTP 404 durante navegación sin estado.
- Resolver el problema principalmente desde el Frontend, impidiendo las llamadas con IDs de placeholder.

**Non-Goals:**
- No se busca modificar agresivamente el backend para aceptar UUIDs vacíos si no es estrictamente necesario, ya que esto podría ocultar errores genuinos.

## Decisions

**Decisión 1: Interceptar en el Cliente (Frontend)**
Se opta por resolver esto a nivel de los Custom Hooks o de `CalificacionesApi`, retornando inmediatamente una promesa resuelta con valores nulos o vacíos si `materiaId === '00000000-0000-0000-0000-000000000000'`.
*Rationale*: Es la capa más cercana a la UI, evita consumo de red innecesario y protege al backend de procesar basura.

## Risks / Trade-offs

- **Risk:** Lógica duplicada de placeholders en el frontend.
  - **Mitigation:** Centralizar la verificación usando una constante global `PLACEHOLDER_UUID`.
