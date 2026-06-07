## Why

La plataforma necesita gestionar la identidad de los usuarios y sus roles asignados dentro del contexto académico. Es necesario definir los modelos base para el `Usuario` (protegiendo su PII) y para las `Asignaciones` de roles que otorgan acceso a contextos específicos (carrera, cohorte, materia, comisión).

## What Changes

- Se crea el modelo `Usuario` con datos sensibles cifrados (email, dni, cuil, cbu, alias_cbu).
- Se crea el modelo `Asignacion` para la relación entre un usuario y un rol en un contexto determinado.
- Se implementa el ABM de usuarios (`/api/admin/usuarios`) protegido para administradores.
- Se implementa el CRUD de asignaciones (`/api/asignaciones`) para gestionar equipos docentes y responsables.
- Se define la migración de base de datos para crear ambas tablas.

## Capabilities

### New Capabilities
- `usuario`: Gestión del ciclo de vida del usuario, resguardando PII cifrada.
- `asignacion`: Gestión de la asignación de roles a usuarios, con control de vigencia y jerarquía.

### Modified Capabilities
- `rbac-core`: Se actualizarán las reglas para considerar el estado y vigencia de las asignaciones al evaluar los permisos.

## Impact

- Base de Datos: Nuevas tablas `usuario` y `asignacion`.
- API: Nuevos routers de administración para usuarios y asignaciones.
- Seguridad: Cifrado en reposo para los campos de PII del usuario utilizando AES-256.
