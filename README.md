# HotelAdmin v2 — React 19 + Radix UI

Sistema de gestión hotelera. Frontend puro, listo para conectar a un backend REST.

## Stack
- **React 19** + **Vite 6**
- **React Router DOM 7**
- **Radix UI Primitives** (Dialog, AlertDialog, Select, Switch, Tooltip, Separator, Label)
- **Lucide React** (íconos)
- CSS Variables puras (sin frameworks de estilo)
- Fuente: **Outfit** (Google Fonts)

## Instalación

```bash
npm install
npm run dev
```

## Estructura

```
src/
├── main.jsx
├── App.jsx                         # Router + HotelProvider + TooltipProvider
├── index.css                       # Variables CSS, estilos base, Radix overrides
│
├── context/
│   └── HotelContext.jsx            # Estado global (useState) + CRUD actions
│
├── data/
│   └── initialData.js              # Datos mock + definición de ESTADOS
│
├── components/
│   ├── Layout/
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx             # Nav lateral con NavLink + estilos activos
│   │   └── Header.jsx              # Radix Select para selector de sucursal
│   ├── UI/
│   │   └── index.jsx               # Todos los primitivos UI:
│   │                               #   Btn, Badge, Modal (Radix Dialog),
│   │                               #   ConfirmDialog (Radix AlertDialog),
│   │                               #   RSelect (Radix Select), SwitchField,
│   │                               #   Tip (Tooltip), Card, Table, Pagination,
│   │                               #   Field, SearchInput, EditBtn, DeleteBtn
│   └── GenericCRUD.jsx             # CRUD reutilizable (Categorías, Ubicaciones, Tarifas)
│
└── pages/
    ├── RecepcionGeneral.jsx        # Grid de tarjetas con estado visual
    ├── Habitaciones.jsx            # CRUD completo con filtros múltiples
    ├── Categorias.jsx
    ├── Ubicaciones.jsx
    ├── Tarifas.jsx
    └── Sucursales.jsx
```

## Conectar al backend

En `HotelContext.jsx`:
- Reemplaza los `useState` iniciales con `useEffect` + `fetch` para cargar datos.
- Reemplaza las funciones `add/update/delete` con llamadas `POST/PUT/DELETE` a tu API.
- Los `sucursalActiva` y filtros del frontend se mantienen igual.

## Funcionalidades

| Módulo | Funcionalidades |
|--------|----------------|
| Recepción | Tarjetas por habitación, cambio rápido de estado, filtros, contador por estado |
| Habitaciones | CRUD completo, multi-selección de tarifas, filtros por estado/ubicación/categoría |
| Categorías | CRUD + toggle visible con Radix Switch |
| Ubicaciones | CRUD + toggle visible |
| Tarifas | CRUD + precios con prefijo S/ |
| Sucursales | CRUD básico |
| Global | Selector de sucursal en header filtra todo automáticamente |
