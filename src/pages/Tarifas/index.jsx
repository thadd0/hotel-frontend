import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { RSelect, SearchInput, Table, Card, Btn, Field, Modal, ConfirmDialog, EmptyState, Pagination, EditBtn, DeleteBtn } from '../../components/UI/index.jsx';
import { Plus, DollarSign } from 'lucide-react';
import styles from './Tarifas.module.css';

const PER_PAGE = 12;
function getHoraMultiplier(catId) {
  return catId === 1 ? 30 / 50 : 40 / 80;
}

const TIPO_ALQUILERES = [
  { value: 'dia', label: 'Por Día', multiplier: 1 },
  { value: 'noche', label: 'Por Noche', multiplier: 0.8 },
  { value: 'hora', label: 'Por Hora', getMultiplier: getHoraMultiplier },
];

export default function Tarifas() {
  const { tarifas, categorias, allHabitaciones: habitaciones, addTarifa, updateTarifa, deleteTarifa } = useHotel();

  // States for filters and CRUD
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterAlquiler, setFilterAlquiler] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ nombre: '', visible: true });
  const [confirmId, setConfirmId] = useState(null);
  const [errors, setErrors] = useState({});

  // Compute enriched combos: tarifa x categoria (via habitaciones) x alquiler
  const combos = useMemo(() => {
    const tarifaMap = new Map(tarifas.map(t => [t.id, parseFloat(t.nombre)]));
    const catMap = new Map(categorias.map(c => [c.id, c.nombre]));
    
    const tarifaCats = new Map(); // tarifaId -> Set<catId>
    habitaciones.forEach(h => {
      h.tarifaIds.forEach(tid => {
        if (!tarifaCats.has(tid)) tarifaCats.set(tid, new Set());
        tarifaCats.get(tid).add(h.categoriaId);
      });
    });

    const combosList = [];
    tarifas.forEach(tarifa => {
      const cats = tarifaCats.get(tarifa.id) || new Set([1,2]); // fallback to all cats if no rooms
      cats.forEach(catId => {
        const catNombre = catMap.get(catId) || 'Desconocida';
        TIPO_ALQUILERES.forEach(alquiler => {
          const base = tarifaMap.get(tarifa.id) || 0;
            const horaMultiplier = alquiler.getMultiplier ? alquiler.getMultiplier(catId) : 0.04;
            combosList.push({
              ...tarifa,
              categoriaId: catId,
              catNombre,
              alquiler,
              basePrecio: base,
              precioDia: (base * 1).toFixed(2),
              precioNoche: (base * 0.8).toFixed(2),
              precioHora: (base * horaMultiplier).toFixed(2),
            });
        });
      });
    });
    return combosList;
  }, [tarifas, categorias, habitaciones]);

  // Apply filters
  const filteredCombos = useMemo(() => {
    let result = combos;
    if (filterCategoria && filterCategoria !== '0') {
      result = result.filter(c => c.categoriaId === parseInt(filterCategoria));
    }
    if (filterAlquiler && filterAlquiler !== 'none') {
      result = result.filter(c => c.alquiler.value === filterAlquiler);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.nombre.toLowerCase().includes(q) ||
        c.catNombre.toLowerCase().includes(q) ||
        c.alquiler.label.toLowerCase().includes(q)
      );
    }
    return result;
  }, [combos, filterCategoria, filterAlquiler, search]);

  const pagedCombos = filteredCombos.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // CRUD handlers
  const openNew = () => {
    setEditId(null);
    setForm({ nombre: '', visible: true });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({ nombre: item.nombre, visible: item.visible ?? true });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'Precio requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { ...form };
    if (editId) {
      updateTarifa(editId, payload);
    } else {
      addTarifa(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    deleteTarifa(confirmId);
    setConfirmId(null);
  };

  const categoriaOptions = [
    { value: '0', label: 'Todas las Categorías' },
    ...categorias.map(c => ({ value: String(c.id), label: c.nombre }))
  ];

  const alquilerOptions = [
    { value: 'none', label: 'Todos los Tipos' },
    ...TIPO_ALQUILERES.map(a => ({ value: a.value, label: a.label }))
  ];

  return (
    <div className={styles.tarifasPage}>
      {/* Header + New Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Tarifas</h1>
        <Btn icon={<Plus size={14} />} className={styles.crudNew} onClick={openNew}>
          Nueva Tarifa
        </Btn>
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Tipo de Habitación</label>
          <RSelect value={filterCategoria || '0'} onValueChange={setFilterCategoria} options={categoriaOptions} />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Tipo de Alquiler</label>
          <RSelect value={filterAlquiler || 'none'} onValueChange={setFilterAlquiler} options={alquilerOptions} />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Buscar</label>
          <SearchInput value={search} onChange={setSearch} placeholder="Precio, categoría..." />
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <span className={styles.statsCount}>{filteredCombos.length}</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {filteredCombos.length} tarifa{pagedCombos.length !== 1 ? 's' : ''} encontrada{pagedCombos.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {pagedCombos.length === 0 ? (
          <EmptyState 
            message="No hay tarifas que coincidan con los filtros" 
            icon={<DollarSign size={40} />} 
          />
        ) : (
          <Table headers={['Categoría', 'Tipo de Alquiler', 'Precio', 'Visible', '']}>
            {pagedCombos.map(combo => (
              <tr key={`${combo.id}-${combo.categoriaId}-${combo.alquiler.value}`} className={styles.tr}>
                <td className={styles.td}>{combo.catNombre.split(' ')[0]}</td>
                <td className={styles.td}>{combo.alquiler.label}</td>
                <td className={`${styles.td} ${styles.precioCell}`} style={{ textAlign: 'right', width: '160px' }}>
                  <strong style={{ fontSize: 16, color: 'var(--accent-dark)' }}>S/ {(combo.basePrecio * (combo.alquiler.getMultiplier ? combo.alquiler.getMultiplier(combo.categoriaId) : combo.alquiler.multiplier)).toFixed(2)}</strong>
                </td>
                <td className={styles.td}>
                  <span className={`${styles.visibleBadge} ${combo.visible ? styles.visibleYes : styles.visibleNo}`}>
                    {combo.visible ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className={`${styles.td} ${styles.actionsCell}`}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <EditBtn onClick={() => openEdit(combo)} />
                    <DeleteBtn onClick={() => setConfirmId(combo.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div className={styles.paginationContainer}>
          <Pagination page={page} total={filteredCombos.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      {/* CRUD Modal */}
      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editId ? 'Editar Tarifa' : 'Nueva Tarifa'}>
        <Field label="Precio Base (S/)" error={errors.nombre} required>
          <input
            type="number"
            value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: 50"
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', fontSize: 16, textAlign: 'right',
              color: 'var(--text)', background: 'var(--surface)', outline: 'none',
              transition: 'border-color .15s ease, box-shadow .15s ease',
              fontFamily: 'inherit',
            }}
          />
        </Field>
        <Field label="Visible">
          {/* Simple checkbox since SwitchField needs Radix props */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.visible}
              onChange={e => setForm({ ...form, visible: e.target.checked })}
              style={{
                width: 18, height: 18, accentColor: 'var(--accent)',
              }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Mostrar en sistema</span>
          </label>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSubmit}>{editId ? 'Actualizar' : 'Crear'}</Btn>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={setConfirmId}
        onConfirm={handleDelete}
        message="¿Eliminar esta tarifa base? Las habitaciones seguirán funcionando."
      />
    </div>
  );
}

