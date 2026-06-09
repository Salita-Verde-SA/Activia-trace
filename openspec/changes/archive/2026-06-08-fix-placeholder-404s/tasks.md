## 1. Constants

- [x] 1.1 Add `PLACEHOLDER_UUID = '00000000-0000-0000-0000-000000000000'` constant in frontend types/constants file.

## 2. API Updates (Calificaciones)

- [x] 2.1 Update `getUmbral` in `calificacionesApi.ts` to return `{ porcentaje_requerido: 60 }` immediately if `materiaId === PLACEHOLDER_UUID`.
- [x] 2.2 Update `getAtrasados` in `calificacionesApi.ts` to return `{ alumnos: [] }` immediately if `materiaId === PLACEHOLDER_UUID`.
- [x] 2.3 Update `getRanking` in `calificacionesApi.ts` to return `{ actividades: [] }` immediately if `materiaId === PLACEHOLDER_UUID`.
- [x] 2.4 Update `getSabana` in `calificacionesApi.ts` to return `{ alumnos: [] }` immediately if `materiaId === PLACEHOLDER_UUID`.

## 3. UI/Component Verification

- [x] 3.1 Verify `CalificacionesPage.tsx` handles the mocked/empty data without throwing exceptions.
- [x] 3.2 Verify `MonitorGlobalPage.tsx` handles the mocked/empty data without throwing exceptions.
