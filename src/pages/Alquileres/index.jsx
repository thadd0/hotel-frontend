import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Table, Btn, EmptyState, Pagination, Modal, Field, useToast } from '../../components/UI/index.jsx';
import { ClipboardList, LogOut, ShoppingCart, Plus, Trash2, Pencil } from 'lucide-react';
import { getCuentasByAlquiler, postCuenta, putCuenta, deleteCuenta } from '../../api/consumos';

const PER_PAGE = 12;

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md, 8px)',
  border: '1px solid var(--border)', fontSize: 14,
  color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit',
};

export default function Alquileres() {
  const { alquileres, checkOut, userRole } = useHotel();
  const isAdmin = userRole === 'admin';
  const addToast = useToast();

  const [tab, setTab] = useState('ACTIVO'); // 'ACTIVO' | 'FINALIZADO'
  const [page, setPage] = useState(1);
  const [checkOutModal, setCheckOutModal] = useState(null); // alquiler object or null
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');

  // Cuenta (consumos) state
  const [cuentaModal, setCuentaModal] = useState(null); // alquiler object or null
  const [cuentaItems, setCuentaItems] = useState([]); // CuentaAlquilerDTO[]
  const [newConsumo, setNewConsumo] = useState({ descripcion: '', precioUnit: '', cantidad: 1 });
  const [editConsumoId, setEditConsumoId] = useState(null); // id of consumo being edited

  const filtered = useMemo(() =>
    alquileres.filter(a => a.estadoAlquiler === tab),
    [alquileres, tab]
  );

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleTabChange = (t) => { setTab(t); setPage(1); };

  const handleCheckOut = () => {
    if (!checkOutModal) return;
    checkOut(checkOutModal.id, metodoPago);
    addToast('Check-out realizado con éxito', 'success');
    setCheckOutModal(null);
  };

  // Open cuenta modal — try API, fallback to mock
  const openCuenta = async (alquiler) => {
    setCuentaModal(alquiler);
    setNewConsumo({ descripcion: '', precioUnit: '', cantidad: 1 });
    setEditConsumoId(null);
    try {
      const data = await getCuentasByAlquiler(alquiler.id);
      setCuentaItems(data);
    } catch {
      setCuentaItems(MOCK_CUENTAS[alquiler.id] || []);
    }
  };

  const addConsumo = async () => {
    const { descripcion, precioUnit, cantidad } = newConsumo;
    if (!descripcion.trim() || !precioUnit || cantidad < 1) return;
    const precio = parseFloat(precioUnit);
    const payload = { descripcion: descripcion.trim(), precioUnit: precio, cantidad: Number(cantidad), estado: 'PENDIENTE' };

    if (editConsumoId) {
      // Update existing consumo
      try {
        const updated = await putCuenta(cuentaModal.id, editConsumoId, payload);
        setCuentaItems(prev => prev.map(c => c.id === editConsumoId ? updated : c));
      } catch {
        setCuentaItems(prev => prev.map(c => c.id === editConsumoId ? { ...c, ...payload, subTotal: precio * Number(cantidad) } : c));
      }
      addToast('Consumo actualizado', 'success');
      setEditConsumoId(null);
    } else {
      // Add new consumo
      try {
        const saved = await postCuenta(cuentaModal.id, payload);
        setCuentaItems(prev => [...prev, saved]);
      } catch {
        const item = {
          id: Date.now(),
          ...payload,
          subTotal: precio * Number(cantidad),
          alquilerId: cuentaModal.id,
        };
        setCuentaItems(prev => [...prev, item]);
      }
      addToast('Consumo agregado', 'success');
    }
    setNewConsumo({ descripcion: '', precioUnit: '', cantidad: 1 });
  };

  const removeConsumo = async (id) => {
    try {
      await deleteCuenta(cuentaModal.id, id);
    } catch { /* fallback: just remove locally */ }
    setCuentaItems(prev => prev.filter(c => c.id !== id));
    addToast('Consumo eliminado', 'info');
  };

  const startEditConsumo = (c) => {
    setEditConsumoId(c.id);
    setNewConsumo({ descripcion: c.descripcion, precioUnit: String(c.precioUnit), cantidad: c.cantidad });
  };

  const cancelEdit = () => {
    setEditConsumoId(null);
    setNewConsumo({ descripcion: '', precioUnit: '', cantidad: 1 });
  };

  const cuentaTotal = cuentaItems.reduce((sum, c) => sum + c.subTotal, 0);

  return (
    <div className="page-anim">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Alquileres</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>Rentas activas e historial</p>
        </div>
      </div>

      {/* Tabs: Activos / Historial */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
        <TabBtn active={tab === 'ACTIVO'} onClick={() => handleTabChange('ACTIVO')} label="Activos" count={alquileres.filter(a => a.estadoAlquiler === 'ACTIVO').length} />
        {isAdmin && (
          <TabBtn active={tab === 'FINALIZADO'} onClick={() => handleTabChange('FINALIZADO')} label="Historial" count={alquileres.filter(a => a.estadoAlquiler === 'FINALIZADO').length} />
        )}
      </div>

      {paged.length === 0 ? (
        <EmptyState message={tab === 'ACTIVO' ? 'No hay alquileres activos' : 'Sin historial'} icon={<ClipboardList size={48} />} />
      ) : (
        <>
          <Table headers={['#', 'Habitación', 'Cliente', 'Ingreso', 'Fecha Prevista', 'SubTotal', 'Pendiente', 'Estado', '']}>
            {paged.map(a => (
              <tr key={a.id}>
                <td style={td}>{a.id}</td>
                <td style={td}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 'var(--r-sm, 4px)', fontSize: 12, fontWeight: 700,
                    background: 'var(--accent-light, #e3f2fd)', color: 'var(--accent)',
                  }}>
                    {a.numeroHabitacion}
                  </span>
                </td>
                <td style={{ ...td, fontWeight: 600 }}>{a.nombreCliente}</td>
                <td style={td}>{formatDate(a.fechaIngreso)}</td>
                <td style={td}>{formatDate(a.fechaPrevista)}</td>
                <td style={{ ...td, fontWeight: 700 }}>S/ {parseFloat(a.subTotal).toFixed(2)}</td>
                <td style={td}>
                  <span style={{
                    fontWeight: 700,
                    color: a.pagoPendiente > 0 ? 'var(--red, #e53935)' : 'var(--green, #43a047)',
                  }}>
                    S/ {parseFloat(a.pagoPendiente).toFixed(2)}
                  </span>
                </td>
                <td style={td}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 'var(--r-sm, 4px)', fontSize: 11, fontWeight: 600,
                    color: a.estadoAlquiler === 'ACTIVO' ? 'var(--green, #43a047)' : 'var(--text-muted)',
                    background: a.estadoAlquiler === 'ACTIVO' ? 'var(--green-bg, #e8f5e9)' : 'var(--surface-2, #f5f5f5)',
                  }}>
                    {a.estadoAlquiler}
                  </span>
                </td>
                <td style={td}>
                  {a.estadoAlquiler === 'ACTIVO' && (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Btn variant="ghost" style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => openCuenta(a)}
                        icon={<ShoppingCart size={13} />}>
                        Cuenta
                      </Btn>
                      <Btn variant="ghost" style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => { setCheckOutModal(a); setMetodoPago('EFECTIVO'); }}
                        icon={<LogOut size={13} />}>
                        Check-out
                      </Btn>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          <div style={{ marginTop: 12 }}>
            <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
          </div>
        </>
      )}

      {/* Check-out modal — calls POST /{id}/check-out?metodoPago=X */}
      <Modal open={!!checkOutModal} onOpenChange={(open) => !open && setCheckOutModal(null)} title="Confirmar Check-out" width={400}>
        {checkOutModal && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, marginBottom: 8 }}>
                <strong>Habitación:</strong> {checkOutModal.numeroHabitacion} — <strong>{checkOutModal.nombreCliente}</strong>
              </div>
              <div style={{ fontSize: 14, marginBottom: 4 }}>
                <strong>Pendiente:</strong>{' '}
                <span style={{ color: 'var(--red, #e53935)', fontWeight: 700 }}>
                  S/ {parseFloat(checkOutModal.pagoPendiente).toFixed(2)}
                </span>
              </div>
            </div>
            <Field label="Método de Pago">
              <select style={inputStyle} value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="YAPE">Yape</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setCheckOutModal(null)}>Cancelar</Btn>
              <Btn onClick={handleCheckOut}>Confirmar Check-out</Btn>
            </div>
          </>
        )}
      </Modal>

      {/* Cuenta / Consumos modal — GET/POST /alquiler/{id}/cuenta */}
      <Modal open={!!cuentaModal} onOpenChange={(open) => !open && setCuentaModal(null)} title="Cuenta del Alquiler" width={560}>
        {cuentaModal && (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14 }}>
                <strong>Hab. {cuentaModal.numeroHabitacion}</strong> — {cuentaModal.nombreCliente}
              </div>
            </div>

            {/* Existing items */}
            {cuentaItems.length > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border)' }}>
                      <th style={thStyle}>Descripción</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>P. Unit</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Cant.</th>
                      <th style={{ ...thStyle, textAlign: 'right' }}>SubTotal</th>
                      <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
                      <th style={thStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentaItems.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdCuenta}>{c.descripcion}</td>
                        <td style={{ ...tdCuenta, textAlign: 'right' }}>S/ {c.precioUnit.toFixed(2)}</td>
                        <td style={{ ...tdCuenta, textAlign: 'center' }}>{c.cantidad}</td>
                        <td style={{ ...tdCuenta, textAlign: 'right', fontWeight: 600 }}>S/ {c.subTotal.toFixed(2)}</td>
                        <td style={{ ...tdCuenta, textAlign: 'center' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 'var(--r-sm, 4px)',
                            background: c.estado === 'PENDIENTE' ? 'var(--orange-bg, #fff3e0)' : 'var(--green-bg, #e8f5e9)',
                            color: c.estado === 'PENDIENTE' ? 'var(--orange, #ef6c00)' : 'var(--green, #43a047)',
                          }}>
                            {c.estado}
                          </span>
                        </td>
                        <td style={tdCuenta}>
                          {c.estado === 'PENDIENTE' && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button onClick={() => startEditConsumo(c)} title="Editar" style={{
                                border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 2,
                              }}>
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => removeConsumo(c.id)} title="Eliminar" style={{
                                border: 'none', background: 'none', cursor: 'pointer', color: 'var(--red, #e53935)', padding: 2,
                              }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0', fontWeight: 700, fontSize: 14 }}>
                  Total consumos: S/ {cuentaTotal.toFixed(2)}
                </div>
              </div>
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Sin consumos registrados
              </div>
            )}

            {/* Add new consumo */}
            {cuentaModal.estadoAlquiler === 'ACTIVO' && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  {editConsumoId ? 'Editar consumo' : 'Agregar consumo'}
                </div>
                <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 0.7fr auto', gap: 8, alignItems: 'end' }}>
                  <Field label="Descripción">
                    <input style={inputStyle} value={newConsumo.descripcion}
                      onChange={(e) => setNewConsumo(p => ({ ...p, descripcion: e.target.value }))}
                      placeholder="Ej: Agua mineral" />
                  </Field>
                  <Field label="Precio Unit.">
                    <input style={inputStyle} type="number" min="0" step="0.5" value={newConsumo.precioUnit}
                      onChange={(e) => setNewConsumo(p => ({ ...p, precioUnit: e.target.value }))}
                      placeholder="0.00" />
                  </Field>
                  <Field label="Cant.">
                    <input style={inputStyle} type="number" min="1" value={newConsumo.cantidad}
                      onChange={(e) => setNewConsumo(p => ({ ...p, cantidad: e.target.value }))}
                      placeholder="1" />
                  </Field>
                  <Btn onClick={addConsumo} style={{ marginBottom: 1 }} icon={<Plus size={14} />}>
                    {editConsumoId ? 'Guardar' : 'Agregar'}
                  </Btn>
                  {editConsumoId && (
                    <Btn variant="ghost" onClick={cancelEdit} style={{ marginBottom: 1 }}>Cancelar</Btn>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setCuentaModal(null)}>Cerrar</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

const td = { padding: '10px 14px', fontSize: 13 };
const thStyle = { padding: '8px 10px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'left' };
const tdCuenta = { padding: '8px 10px', fontSize: 13 };

// Mock consumos data (will be replaced by API calls to /alquiler/{id}/cuenta)
const MOCK_CUENTAS = {
  1: [
    { id: 101, descripcion: 'Agua mineral', precioUnit: 3, cantidad: 2, subTotal: 6, estado: 'PENDIENTE', alquilerId: 1 },
    { id: 102, descripcion: 'Toallas extra', precioUnit: 5, cantidad: 1, subTotal: 5, estado: 'PENDIENTE', alquilerId: 1 },
  ],
  2: [
    { id: 201, descripcion: 'Room service - cena', precioUnit: 35, cantidad: 2, subTotal: 70, estado: 'PENDIENTE', alquilerId: 2 },
  ],
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function TabBtn({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        borderRadius: 'var(--r-md, 8px)', fontFamily: 'inherit',
        background: active ? 'var(--accent)' : 'var(--surface-2, #f5f5f5)',
        color: active ? '#fff' : 'var(--text-muted)',
        transition: 'all .15s',
      }}
    >
      {label} <span style={{ fontSize: 11, opacity: 0.8 }}>({count})</span>
    </button>
  );
}
