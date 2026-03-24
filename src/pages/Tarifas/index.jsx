import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { RSelect, SearchInput, Table, Btn, Field, Modal, ConfirmDialog, EmptyState, Pagination, EditBtn, DeleteBtn } from '../../components/UI/index.jsx';
import { Plus, DollarSign } from 'lucide-react';
import styles from './Tarifas.module.css';

const PER_PAGE = 12;

export default function Tarifas() {
  const { tarifas, tiposHabitacion, tiposAlquiler, addTarifa, updateTarifa, deleteTarifa } = useHotel();

  const [filterTipoHab, setFilterTipoHab] = useState('');
  const [filterTipoAlq, setFilterTipoAlq] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ precio: '', tipoHabitacionId: '', tipoAlquilerId: '' });
  const [confirmId, setConfirmId] = useState(null);
  const [errors, setErrors] = useState({});

  // Filter tarifas
  const filtered = useMemo(() => {
    let result = tarifas;
    if (filterTipoHab && filterTipoHab !== '0') {
      result = result.filter(t => t.tipoHabitacion?.id === parseInt(filterTipoHab));
    }
    if (filterTipoAlq && filterTipoAlq !== '0') {
      result = result.filter(t => t.tipoAlquiler?.id === parseInt(filterTipoAlq));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.tipoHabitacion?.nombre?.toLowerCase().includes(q) ||
        t.tipoAlquiler?.nombre?.toLowerCase().includes(q) ||
        String(t.precio).includes(q)
      );
    }
    return result;
  }, [tarifas, filterTipoHab, filterTipoAlq, search]);

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openNew = () => {
    setEditId(null);
    setForm({ precio: '', tipoHabitacionId: '', tipoAlquilerId: '' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      precio: String(item.precio ?? ''),
      tipoHabitacionId: String(item.tipoHabitacion?.id ?? ''),
      tipoAlquilerId: String(item.tipoAlquiler?.id ?? ''),
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.precio || isNaN(form.precio) || Number(form.precio) <= 0) errs.precio = 'Precio válido requerido';
    if (!form.tipoHabitacionId) errs.tipoHabitacionId = 'Seleccione tipo de habitación';
    if (!form.tipoAlquilerId) errs.tipoAlquilerId = 'Seleccione tipo de alquiler';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      precio: Number(form.precio),
      tipoHabitacionId: Number(form.tipoHabitacionId),
      tipoAlquilerId: Number(form.tipoAlquilerId),
    };
    try {
      editId ? await updateTarifa(editId, payload) : await addTarifa(payload);
      addToast(editId ? 'Tarifa actualizada' : 'Tarifa creada', 'success');
      setModalOpen(false);
    } catch {
      addToast('Error al guardar la tarifa', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTarifa(confirmId);
      addToast('Tarifa eliminada', 'info');
    } catch {
      addToast('Error al eliminar la tarifa', 'error');
    }
    setConfirmId(null);
  };

  const tipoHabOptions = [
    { value: '0', label: 'Todos los Tipos Hab.' },
    ...tiposHabitacion.map(t => ({ value: String(t.id), label: t.nombre })),
  ];

  const tipoAlqOptions = [
    { value: '0', label: 'Todos los Tipos Alq.' },
    ...tiposAlquiler.map(t => ({ value: String(t.id), label: t.nombre })),
  ];

  return (
    <div className={styles.tarifasPage}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Tarifas</h1>
        <Btn icon={<Plus size={14} />} className={styles.crudNew} onClick={openNew}>
          Nueva Tarifa
        </Btn>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Tipo de Habitación</label>
          <RSelect value={filterTipoHab || '0'} onValueChange={setFilterTipoHab} options={tipoHabOptions} />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Tipo de Alquiler</label>
          <RSelect value={filterTipoAlq || '0'} onValueChange={setFilterTipoAlq} options={tipoAlqOptions} />
        </div>
        <div className={styles.filterField}>
          <label className={styles.filterLabel}>Buscar</label>
          <SearchInput value={search} onChange={setSearch} placeholder="Precio, tipo..." />
        </div>
      </div>

      <div className={styles.statsRow}>
        <span className={styles.statsCount}>{filtered.length}</span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {filtered.length} tarifa{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className={styles.tableContainer}>
        {paged.length === 0 ? (
          <EmptyState
            message="No hay tarifas que coincidan con los filtros"
            icon={<DollarSign size={40} />}
          />
        ) : (
          <Table headers={['Tipo Habitación', 'Tipo Alquiler', 'Precio', '']}>
            {paged.map(tarifa => (
              <tr key={tarifa.id} className={styles.tr}>
                <td className={styles.td}>{tarifa.tipoHabitacion?.nombre || '—'}</td>
                <td className={styles.td}>{tarifa.tipoAlquiler?.nombre || '—'}</td>
                <td className={`${styles.td} ${styles.precioCell}`} style={{ textAlign: 'right', width: '160px' }}>
                  <strong style={{ fontSize: 16, color: 'var(--accent-dark)' }}>S/ {Number(tarifa.precio).toFixed(2)}</strong>
                </td>
                <td className={`${styles.td} ${styles.actionsCell}`}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <EditBtn onClick={() => openEdit(tarifa)} />
                    <DeleteBtn onClick={() => setConfirmId(tarifa.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div className={styles.paginationContainer}>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      <Modal open={modalOpen} onOpenChange={setModalOpen} title={editId ? 'Editar Tarifa' : 'Nueva Tarifa'}>
        <Field label="Tipo de Habitación" error={errors.tipoHabitacionId} required>
          <select
            value={form.tipoHabitacionId}
            onChange={e => setForm({ ...form, tipoHabitacionId: e.target.value })}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', fontSize: 14,
              color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit',
            }}
          >
            <option value="">Seleccione...</option>
            {tiposHabitacion.map(t => <option key={t.id} value={String(t.id)}>{t.nombre}</option>)}
          </select>
        </Field>

        <Field label="Tipo de Alquiler" error={errors.tipoAlquilerId} required>
          <select
            value={form.tipoAlquilerId}
            onChange={e => setForm({ ...form, tipoAlquilerId: e.target.value })}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', fontSize: 14,
              color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit',
            }}
          >
            <option value="">Seleccione...</option>
            {tiposAlquiler.map(t => <option key={t.id} value={String(t.id)}>{t.nombre}</option>)}
          </select>
        </Field>

        <Field label="Precio (S/)" error={errors.precio} required>
          <input
            type="number"
            value={form.precio}
            onChange={e => setForm({ ...form, precio: e.target.value })}
            placeholder="Ej: 50.00"
            min="0"
            step="0.01"
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', fontSize: 16, textAlign: 'right',
              color: 'var(--text)', background: 'var(--surface)', outline: 'none',
              transition: 'border-color .15s ease, box-shadow .15s ease',
              fontFamily: 'inherit',
            }}
          />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSubmit}>{editId ? 'Actualizar' : 'Crear'}</Btn>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={setConfirmId}
        onConfirm={handleDelete}
        message="¿Eliminar esta tarifa? Esta acción no se puede deshacer."
      />
    </div>
  );
}

