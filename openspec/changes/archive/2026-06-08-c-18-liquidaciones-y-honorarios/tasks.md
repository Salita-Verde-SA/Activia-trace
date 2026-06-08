## 1. Modelos de Base de Datos y Migraciones

- [x] 1.1 Crear modelos `SalarioBase`, `SalarioPlus`, `Liquidacion` y `Factura` en `backend/models/liquidaciones.py`.
- [x] 1.2 Actualizar el modelo `Materia` en `backend/models/materia.py` agregando la columna `clave_plus`.
- [x] 1.3 Registrar los nuevos modelos en `backend/models/__init__.py`.
- [x] 1.4 Generar la migración de Alembic para la actualización de `Materia` y la creación de las nuevas tablas.

## 2. Esquemas Pydantic

- [x] 2.1 Crear esquemas para ABM de grilla salarial en `backend/schemas/salario.py`.
- [x] 2.2 Crear esquemas para `Liquidacion` y pre-cálculo en `backend/schemas/liquidacion.py`.
- [x] 2.3 Crear esquemas para `Factura` en `backend/schemas/factura.py`.

## 3. Lógica de Negocio (Servicios)

- [x] 3.1 Implementar `LiquidacionService.calcular_liquidacion_mensual` validando asignaciones vigentes, roles, y plus por familia no acumulativo.
- [x] 3.2 Implementar `LiquidacionService.generar_pre_liquidaciones` para devolver listado de todos los docentes de un período.
- [x] 3.3 Implementar `LiquidacionService.cerrar_liquidacion_mensual` (estado CERRADA e inmutable + registro de auditoría `LIQUIDACION_CERRAR`).
- [x] 3.4 Implementar ABM de `SalarioBase` y `SalarioPlus` manejando el empalme de fechas `desde` y `hasta`.
- [x] 3.5 Implementar `FacturaService` para el registro de comprobantes y la lógica de exclusión.

## 4. Endpoints de la API

- [x] 4.1 Crear el router en `backend/api/endpoints/liquidaciones.py` con permisos `liquidaciones:*`.
- [x] 4.2 Crear el router en `backend/api/endpoints/facturas.py`.
- [x] 4.3 Crear el router en `backend/api/endpoints/salarios.py` para la grilla salarial.
- [x] 4.4 Registrar los routers en `__init__.py` y `main.py`.

## 5. Pruebas Unitarias y Funcionales

- [x] 5.1 Testear que el cálculo de `SalarioBase` seleccione el valor vigente para la fecha solicitada.
- [x] 5.2 Testear que un docente con MÚLTIPLES comisiones de la misma clave cobre el `SalarioPlus` una sola vez.
- [x] 5.3 Testear el cierre de liquidación, verificando inmutabilidad y generación de log de auditoría.
- [x] 5.4 Testear que un usuario emisor de factura quede excluido correctamente del monto general a liquidar.
