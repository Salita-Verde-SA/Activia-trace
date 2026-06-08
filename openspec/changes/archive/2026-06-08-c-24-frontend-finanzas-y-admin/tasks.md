## 1. Setup Types and API Services

- [x] 1.1 Create Finanzas API services (`liquidacionesApi.ts`, `salariosApi.ts`, `facturasApi.ts`)
- [x] 1.2 Create Admin API services (`estructuraApi.ts`, `usuariosApi.ts`, `auditoriaApi.ts`)
- [x] 1.3 Create TypeScript interfaces for Finanzas models (`Liquidacion`, `SalarioBase`, `SalarioPlus`, `Factura`)
- [x] 1.4 Create TypeScript interfaces for Admin models (`Carrera`, `Cohorte`, `Materia`, `Usuario`, `AuditLog`)

## 2. Admin Module - Estructura Académica

- [x] 2.1 Implement useEstructura hooks for fetching and mutations
- [x] 2.2 Create Carreras CRUD panel
- [x] 2.3 Create Cohortes CRUD panel
- [x] 2.4 Create Materias CRUD panel
- [x] 2.5 Assemble EstructuraAcademicaPage with tabs for the panels

## 3. Admin Module - Gestión Usuarios

- [x] 3.1 Implement useUsuarios hooks
- [x] 3.2 Create UsuariosTable with role and status display
- [x] 3.3 Create AddUserForm and EditRolesModal
- [x] 3.4 Assemble GestionUsuariosPage

## 4. Admin Module - Panel de Auditoría

- [x] 4.1 Implement useAuditoria hook with pagination/filters
- [x] 4.2 Create AuditoriaLogTable with E-AUD columns
- [x] 4.3 Create AuditoriaFilters component (date range, action, user)
- [x] 4.4 Assemble AuditoriaPage

## 5. Finanzas Module - Grilla Salarial

- [x] 5.1 Implement useSalarios hooks
- [x] 5.2 Create SalariosBaseEditor table/form
- [x] 5.3 Create SalariosPlusEditor table/form
- [x] 5.4 Assemble GrillaSalarialPage

## 6. Finanzas Module - Liquidaciones

- [x] 6.1 Implement useLiquidaciones and useFacturas hooks
- [x] 6.2 Create LiquidacionSegmentTabs (General / NEXO / Factura)
- [x] 6.3 Create LiquidacionTable view with individual details
- [x] 6.4 Create CloseLiquidacionAction and Confirmation Modal
- [x] 6.5 Create LiquidacionesHistory view
- [x] 6.6 Assemble LiquidacionesDashboardPage

## 7. Integration & Routing

- [x] 7.1 Register Admin routes in App.tsx
- [x] 7.2 Register Finanzas routes in App.tsx
- [x] 7.3 Add navigation links to the sidebar/menu based on user roles
- [x] 7.4 Add E2E/Unit tests for critical UI components (e.g. Liquidaciones dashboard)
