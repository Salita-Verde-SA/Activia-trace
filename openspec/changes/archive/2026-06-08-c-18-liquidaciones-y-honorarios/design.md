## Context
El módulo de liquidaciones permite calcular la remuneración mensual de los docentes. La fórmula de cálculo se compone de un Salario Base (determinado por el rol) y un Salario Plus (determinado por la clave de familia de las materias asignadas y el rol). 
Con las resoluciones de PA-22 y PA-23, sabemos que:
- Las materias definen opcionalmente su `clave_plus`.
- El Plus NO se acumula por comisión: se paga una sola vez por familia y por rol.
- Existen docentes que emiten factura, a los cuales no se les deposita directamente la liquidación general sino que su cálculo queda apartado en "Liquidación por Factura".

## Goals / Non-Goals

**Goals:**
- Estructurar el almacenamiento histórico de las variables (SalarioBase y SalarioPlus con vigencias).
- Definir la lógica de cálculo por período (mes y año).
- Permitir un proceso de "Cierre" que vuelve la liquidación inmutable.
- Permitir separar contablemente al docente "facturero" vs. docente "nexo" vs. docente regular.

**Non-Goals:**
- No se genera el archivo bancario de transferencia (ej. txt para el banco), el sistema se detiene en el monto a liquidar.

## Decisions
- **Vigencia de Grillas**: Tanto `SalarioBase` como `SalarioPlus` tendrán `fecha_desde` y `fecha_hasta`. El cálculo usará el registro vigente en el período a liquidar (ej. vigente para mayo de 2026).
- **Mapeo de Materia a Plus**: Se agregará una columna `clave_plus` (String, nullable) a la tabla `materias` (ej. 'PROG', 'ING'). Esto se incluye en la migración de este change.
- **Inmutabilidad**: Al cerrar la liquidación (cambiar estado a CERRADA), se copiará el detalle del cálculo en un JSON (snapshot) o se fijará el valor total, ya que la grilla o las asignaciones pasadas podrían cambiar en el futuro.
- **Cierre por Docente**: La liquidación guardará un registro `Liquidacion` por cada usuario (docente) para un período `(mes, año)`.

## Risks / Trade-offs
- **[Risk]** Cambios retroactivos: Si se cambia la grilla salarial de un mes pasado y se recalcula, los montos diferirán.
  - **Mitigation**: El estado CERRADA impide recalcular. Solo las liquidaciones ABIERTAS se recalculan al vuelo al ser consultadas.
- **[Risk]** Rendimiento: Calcular las liquidaciones de miles de docentes on-the-fly.
  - **Mitigation**: El listado de FINANZAS traerá las liquidaciones precalculadas, o el proceso de cierre calculará y persistirá el snapshot de manera asincrónica o batch si fuera necesario. Para MVP se usará un cálculo síncrono al consultar el endpoint `/api/liquidaciones/pre-calculo`.
