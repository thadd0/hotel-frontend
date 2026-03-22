# TODO - Mejoras Hotel Admin (Role-based + New Sections)
Mantener fidelidad visual 100%. Solo añadir. Usar Radix UI.

## ✅ Plan Aprobado
1. **Context + Data**: Añadir empresa, tipos_alquiler/habitacion, token, toggleRole.
2. **GenericCRUD**: Prop readOnly (hide buttons para recepcionista).
3. **Header**: Toggle role (Radix Select discreto).
4. **Sidebar**: NAV role-conditional.
5. **App.jsx**: New routes.
6. **New pages**: Empresa (read), Clientes (CRUD), TiposAlquiler/Habitacion.
7. **Apply readOnly**: Existing CRUD pages.
8. **Test**: npm run dev, toggle roles, verify.

## ⏳ Progress
- [x] 1. Update src/context/HotelContext.jsx + src/data/initialData.js (empresa, tiposAlquiler/habitacion states + CRUD + toggleRole + token)
- [x] 2. Update src/components/GenericCRUD.jsx (readOnly prop + hide Add/Edit/Delete/Modal/Confirm para recepcionista)
- [x] 3. Update src/components/Layout/Header.jsx (role toggle con RSelect discreto junto badge)
- [x] 4. Update src/components/Layout/Sidebar.jsx (NAV role-conditional: admin full, recepcion limitada)
- [ ] 5. Update src/App.jsx (new routes + imports)
- [ ] 6. Create src/pages/Empresa/index.jsx
- [ ] 7. Create src/pages/Clientes/index.jsx
- [ ] 8. Create src/pages/TiposAlquiler/index.jsx
- [ ] 9. Create src/pages/TiposHabitacion/index.jsx
- [ ] 10. Update existing pages (pass readOnly={userRole==='recepcion'})
- [ ] 11. Test: npm run dev

**Comando test**: `npm run dev`
**Next**: Paso 1 (Context/Data).
