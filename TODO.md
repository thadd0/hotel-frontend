# Backend Alignment Master TODO - Phased Plan

## 🎯 Phase 1: Types & Enums (1 hour)
**Goal**: Define TS types matching backend schema + enums.

Files:
- `src/types.ts`: Add Rol, TipoDocumento, TipoHabitacion, TipoAlquiler, Usuario, Cliente, Habitacion (piso), Tarifa (tipo_hab+tipo_alq), Alquiler, CuentaAlquiler, MovimientoCaja.
- Enums: EstadoHabitacion, EstadoAlquiler, EstadoCuenta, MetodoPago, TipoMovimiento.

✅ 1. **types.ts**: Backend-aligned types + enums (Rol, Cliente, Habitacion.piso, Tarifa combo, Alquiler, CuentaAlquiler, MovimientoCaja, enums)

## 🎯 Phase 2: Context & API (2 hours)
**Goal**: HotelContext state/CRUDS for all tables.

Files:
- `src/context/HotelContext.jsx`: Add states/CRUDS for rol, tipo_documento, cliente, usuario (admin only), alquiler, cuenta_alquiler, movimiento_caja.
- `src/api/`*: New files (clientes.ts, usuarios.ts, alquileres.ts, consumos.ts).
- Login: Use num_documento + rol from backend.

**✅ Done**: Update context + new APIs

## 🎯 Phase 3: Core Pages Update (3 hours)
**Goal**: Align existing pages to new schema.

| Page | Changes |
|------|---------|
| CheckInModal | cliente (buscar/crear), tipo_habitacion/alquiler selects, piso from habitacion, create alquiler |
| Habitaciones | piso, tipo_habitacion FK, estado enum, detail → add cuenta_alquiler |
| Tarifas | tipo_habitacion + tipo_alquiler grid, precio per combo |
| Caja | metodo_pago enum, id_alquiler FK |

**✅ Done**: CheckIn + Habitaciones + Tarifas + Caja aligned

## 🎯 Phase 4: New Modules (5 hours)
**Goal**: 4 new pages + sidebar routing + role guards.

| Module | Path | Who Sees | Description |
|--------|------|----------|-------------|
| Clientes | /clientes | Admin/Recepcion | CRUD clientes |
| Usuarios | /usuarios | Admin only | CRUD usuarios/roles |
| Consumos | /habitacion/:id/consumos | Recepcion | Add CuentaAlquiler to ocupada room |
| Alquileres | /alquileres | Admin | CRUD/filter alquileres (historial) |

**Files**: src/pages/[Clientes|Usuarios|Alquileres]/index.jsx + api/*.ts + Sidebar conditionals (userRole==='ROLE_ADMINISTRADOR')

**✅ Done**: Create all 4 pages + routes + guards

## 🎯 Phase 5: Role Guards & Polish (1 hour)
**Goal**: Sidebar dynamic per rol, Header role badge.

Files:
- Sidebar.jsx: Filter nav by userRole
- Header.jsx: Badge user.rol.nombre
- RecepcionGeneral: Button 'Agregar Consumo' on OCUPADA rooms

**✅ Done**: Guards + UI polish

## 🚀 Followup Steps
1. `npm run dev` → Test Phase 1 types.
2. Backend API endpoints live? (confirm /api/rol, /api/clientes etc.)
3. Login test: Admin 00000000 / recepcion 11111111.

**Approve Phase 1?** Update types.ts first.

