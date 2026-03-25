import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { RSelect, SearchInput, Table, Btn, Field, Modal, ConfirmDialog, EmptyState, Pagination, EditBtn, DeleteBtn, useToast } from '../../components/UI/index.jsx';
import { Plus, DollarSign } from 'lucide-react';
import styles from './Tarifas.module.css';

const PER_PAGE = 12;

export default function Tarifas() {
  const { tarifas, tiposHabitacion, tiposAlquiler, addTarifa, updateTarifa, deleteTarifa, incrementarTarifasPorcentaje, userRole } = useHotel();
  const addToast = useToast();
  const isAdmin = userRole === 'admin';

  const [filterTipoHab, setFilterTipoHab] = useState('');
  const [filterTipoAlq, setFilterTipoAlq] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ precio: '', tipoHabitacionId: '', tipoAlquilerId: '' });
  const [confirmId, setConfirmId] = useState(null);
  const [errors, setErrors] = useState({});
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [incrementoPorcentaje, setIncrementoPorcentaje] = useState('');

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

  const handlePrecioChange = (rawValue) => {
    const normalized = String(rawValue || '').replace(',', '.');
    const cleaned = normalized.replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    const safe = parts.length > 2
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : cleaned;
    const [intPart = '', decPart = ''] = safe.split('.');
    const hasDecimalPoint = safe.includes('.');
    const limited = hasDecimalPoint
      ? `${intPart}.${decPart.slice(0, 2)}`
      : intPart;
    setForm((prev) => ({ ...prev, precio: limited }));
  };

  const validate = () => {
    const errs = {};
    const precioNum = Number(form.precio);
    const habId = Number(form.tipoHabitacionId);
    const alqId = Number(form.tipoAlquilerId);
    
    if (!form.precio || isNaN(precioNum) || precioNum <= 0) errs.precio = 'Precio válido requerido';
    if (!form.tipoHabitacionId || habId <= 0) errs.tipoHabitacionId = 'Seleccione tipo de habitación válido';
    if (!form.tipoAlquilerId || alqId <= 0) errs.tipoAlquilerId = 'Seleccione tipo de alquiler válido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const tipoHabId = Number(form.tipoHabitacionId);
    const tipoAlqId = Number(form.tipoAlquilerId);
    const precioNum = Number(form.precio);
    
    // Double-check IDs are valid numbers before sending
    if (tipoHabId <= 0 || tipoAlqId <= 0 || precioNum <= 0) {
      addToast('Verifica que todos los campos estén correctamente seleccionados', 'error');
      return;
    }

    const payload = {
      precio: precioNum,
      tipoHabitacionId: tipoHabId,
      tipoAlquilerId: tipoAlqId,
    };

    const alreadyExists = tarifas.some((t) => (
      t.tipoHabitacion?.id === payload.tipoHabitacionId
      && t.tipoAlquiler?.id === payload.tipoAlquilerId
      && t.id !== editId
    ));

    if (alreadyExists) {
      addToast('Ya existe una tarifa para esa combinación de habitación y alquiler', 'error');
      return;
    }

    try {
      editId ? await updateTarifa(editId, payload) : await addTarifa(payload);
      addToast(editId ? 'Tarifa actualizada' : 'Tarifa creada', 'success');
      setModalOpen(false);
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      addToast(backendMessage || 'Error al guardar la tarifa', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTarifa(confirmId);
      addToast('Tarifa eliminada', 'info');
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      addToast(backendMessage || 'Error al eliminar la tarifa', 'error');
    }
    setConfirmId(null);
  };

  const handleIncrementoMasivo = async () => {
    const porcentaje = Number(incrementoPorcentaje);
    if (!porcentaje || porcentaje <= 0) {
      addToast('Ingrese un porcentaje válido mayor a 0', 'error');
      return;
    }
    try {
      await incrementarTarifasPorcentaje(porcentaje);
      addToast('Tarifas incrementadas correctamente', 'success');
      setBulkModalOpen(false);
      setIncrementoPorcentaje('');
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      addToast(backendMessage || 'No se pudo aplicar el incremento', 'error');
    }
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
        {isAdmin && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" onClick={() => setBulkModalOpen(true)}>
              Aumentar %
            </Btn>
            <Btn icon={<Plus size={14} />} className={styles.crudNew} onClick={openNew}>
              Nueva Tarifa
            </Btn>
          </div>
        )}
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
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <EditBtn onClick={() => openEdit(tarifa)} />
                      <DeleteBtn onClick={() => setConfirmId(tarifa.id)} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
        <div className={styles.paginationContainer}>
          <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
        </div>
      </div>

      <Modal open={modalOpen && isAdmin} onOpenChange={setModalOpen} title={editId ? 'Editar Tarifa' : 'Nueva Tarifa'}>
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
          <div className={styles.priceInputWrap}>
            <span className={styles.pricePrefix}>S/</span>
            <input
              type="text"
              inputMode="decimal"
              value={form.precio}
              onChange={e => handlePrecioChange(e.target.value)}
              placeholder="0.00"
              className={styles.priceInput}
            />
          </div>
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSubmit}>{editId ? 'Actualizar' : 'Crear'}</Btn>
        </div>
      </Modal>

      <Modal open={bulkModalOpen && isAdmin} onOpenChange={setBulkModalOpen} title="Aumentar tarifas por porcentaje">
        <Field label="Porcentaje (%)" required>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={incrementoPorcentaje}
            onChange={(e) => setIncrementoPorcentaje(e.target.value)}
            placeholder="Ej: 8"
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md)',
              border: '1px solid var(--border)', fontSize: 14,
              color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit',
            }}
          />
        </Field>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 0 }}>
          Esta acción incrementa todas las tarifas actuales con el porcentaje indicado.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setBulkModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleIncrementoMasivo}>Aplicar incremento</Btn>
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

