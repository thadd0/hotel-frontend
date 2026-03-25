import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Table, Btn, EmptyState, Pagination, Modal, Field, useToast } from '../../components/UI/index.jsx';
import { ClipboardList, LogOut, ShoppingCart, Plus, Trash2, Pencil, Check, Download } from 'lucide-react';
import { getCuentasByAlquiler, postCuenta, putCuenta, deleteCuenta } from '../../api/consumos';
import { patchAlquilerMontos } from '../../api/alquileres';
import { descargarReporteAlquileresActivos } from '../../utils/reportesPdf';

const PER_PAGE = 12;

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md, 8px)',
  border: '1px solid var(--border)', fontSize: 14,
  color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit',
};

export default function Alquileres() {
  const { alquileres, checkOut, refreshAlquiler, userRole } = useHotel();
  const isAdmin = userRole === 'admin';
  const addToast = useToast();

  const [tab, setTab] = useState('ACTIVO'); // 'ACTIVO' | 'FINALIZADO'
  const [page, setPage] = useState(1);
  const [checkOutModal, setCheckOutModal] = useState(null); // alquiler object or null
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Checkout detail state
  const [checkoutCuentaItems, setCheckoutCuentaItems] = useState([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Cuenta (consumos) state
  const [cuentaModal, setCuentaModal] = useState(null); // alquiler object or null
  const [cuentaItems, setCuentaItems] = useState([]); // CuentaAlquilerDTO[]
  const [newConsumo, setNewConsumo] = useState({ descripcion: '', precioUnit: '', cantidad: 1 });
  const [pagoConsumoModal, setPagoConsumoModal] = useState(null); // CuentaAlquilerDTO | null
  const [pagoConsumoMetodo, setPagoConsumoMetodo] = useState('EFECTIVO');
  const [editPopover, setEditPopover] = useState(null); // { id, descripcion, precioUnit, cantidad }
  const [editMontosModal, setEditMontosModal] = useState(null);
  const [editMontosForm, setEditMontosForm] = useState({ subTotal: '', pagoPendiente: '' });

  const filtered = useMemo(() =>
    alquileres.filter(a => a.estadoAlquiler === tab),
    [alquileres, tab]
  );

  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleTabChange = (t) => { setTab(t); setPage(1); };

  const openCheckout = async (a) => {
    setCheckOutModal(a);
    setMetodoPago('EFECTIVO');
    setCheckoutCuentaItems([]);
    setCheckoutLoading(true);
    try {
      const items = await getCuentasByAlquiler(a.id);
      setCheckoutCuentaItems(items.filter(c => c.estado === 'PENDIENTE'));
    } catch { /* show empty list */ } finally {
      setCheckoutLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!checkOutModal || isCheckingOut) return;
    const currentCheckout = checkOutModal;
    setIsCheckingOut(true);
    try {
      await checkOut(currentCheckout.id, metodoPago);
      addToast('Check-out realizado con éxito', 'success');
    } catch {
      addToast('Error al realizar check-out', 'error');
    } finally {
      setIsCheckingOut(false);
      setCheckOutModal(null);
      setCheckoutCuentaItems([]);
    }
  };

  // Open cuenta modal — try API, fallback to mock
  const openCuenta = async (alquiler) => {
    setCuentaModal(alquiler);
    setNewConsumo({ descripcion: '', precioUnit: '', cantidad: 1 });
    setEditPopover(null);
    setPagoConsumoModal(null);
    setPagoConsumoMetodo('EFECTIVO');
    try {
      const data = await getCuentasByAlquiler(alquiler.id);
      setCuentaItems(data);
    } catch {
      setCuentaItems(MOCK_CUENTAS[alquiler.id] || []);
    }
  };

  const addConsumo = async () => {
    const { descripcion, precioUnit, cantidad } = newConsumo;
    if (!descripcion.trim() || cantidad < 1) return;
    const alquilerEsEmpresa = Boolean(cuentaModal?.empresaNombre && cuentaModal?.empresaNombre !== '—');
    const puedeEditarPrecioUnit = isAdmin || !alquilerEsEmpresa;
    const precio = puedeEditarPrecioUnit ? parseFloat(precioUnit || '0') : 0;
    const payload = { descripcion: descripcion.trim(), precioUnit: precio, cantidad: Number(cantidad), estado: 'PENDIENTE' };

    // Add new consumo
    try {
      const saved = await postCuenta(cuentaModal.id, payload);
      setCuentaItems(prev => [...prev, saved]);
      refreshAlquiler(cuentaModal.id);
      setCuentaModal(prev => prev ? { ...prev, pagoPendiente: parseFloat(prev.pagoPendiente) + saved.subTotal } : prev);
    } catch {
      const item = {
        id: Date.now(),
        ...payload,
        subTotal: precio * Number(cantidad),
        alquilerId: cuentaModal.id,
      };
      setCuentaItems(prev => [...prev, item]);
      setCuentaModal(prev => prev ? { ...prev, pagoPendiente: parseFloat(prev.pagoPendiente) + item.subTotal } : prev);
    }
    addToast('Consumo agregado', 'success');
    setNewConsumo({ descripcion: '', precioUnit: '', cantidad: 1 });
  };

  const saveEditConsumo = async () => {
    if (!editPopover) return;
    if (!isAdmin) return;
    const { id, descripcion, precioUnit, cantidad } = editPopover;
    if (!descripcion.trim() || !precioUnit || Number(cantidad) < 1) return;

    const precio = parseFloat(precioUnit);
    const payload = {
      descripcion: descripcion.trim(),
      precioUnit: precio,
      cantidad: Number(cantidad),
      estado: 'PENDIENTE',
    };

    try {
      const updated = await putCuenta(cuentaModal.id, id, payload);
      setCuentaItems(prev => prev.map(c => c.id === id ? updated : c));
      refreshAlquiler(cuentaModal.id);
    } catch {
      setCuentaItems(prev => prev.map(c => c.id === id ? { ...c, ...payload, subTotal: precio * Number(cantidad) } : c));
    }

    setEditPopover(null);
    addToast('Consumo actualizado', 'success');
  };

  const removeConsumo = async (id) => {
    if (!cuentaModal?.id) return;
    try {
      await deleteCuenta(cuentaModal.id, id);
      const refreshedItems = await getCuentasByAlquiler(cuentaModal.id);
      setCuentaItems(refreshedItems);

      const updatedAlquiler = await refreshAlquiler(cuentaModal.id);
      if (updatedAlquiler) {
        setCuentaModal((prev) => (prev ? { ...prev, pagoPendiente: updatedAlquiler.pagoPendiente } : prev));
      }

      if (editPopover?.id === id) setEditPopover(null);
      addToast('Consumo eliminado', 'info');
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      addToast(backendMessage || 'No se pudo eliminar el consumo', 'error');
    }
  };

  const startEditConsumo = (c) => {
    setEditPopover((prev) => {
      if (prev?.id === c.id) return null;
      return {
        id: c.id,
        descripcion: c.descripcion,
        precioUnit: String(c.precioUnit),
        cantidad: c.cantidad,
      };
    });
  };

  const cuentaTotal = cuentaItems.reduce((sum, c) => sum + c.subTotal, 0);
  const alquilerCuentaEsEmpresa = Boolean(cuentaModal?.empresaNombre && cuentaModal?.empresaNombre !== '—');
  const mostrarPrecioCuenta = isAdmin || !alquilerCuentaEsEmpresa;
  const puedeMarcarPagadoCuenta = isAdmin || !alquilerCuentaEsEmpresa;
  const openPagoConsumoModal = (c) => {
    setPagoConsumoModal(c);
    setPagoConsumoMetodo('EFECTIVO');
  };

  const markConsumoAsPaid = async (c, metodoPago = 'EFECTIVO') => {
    try {
      const updated = await putCuenta(cuentaModal.id, c.id, {
        descripcion: c.descripcion, precioUnit: c.precioUnit, cantidad: c.cantidad, estado: 'PAGADO',
      }, metodoPago);
      setCuentaItems(prev => prev.map(x => x.id === c.id ? updated : x));
      const updatedAlquiler = await refreshAlquiler(cuentaModal.id);
      if (updatedAlquiler) {
        setCuentaModal(prev => prev ? { ...prev, pagoPendiente: updatedAlquiler.pagoPendiente } : prev);
      } else {
        setCuentaModal(prev => prev ? { ...prev, pagoPendiente: Math.max(0, parseFloat(prev.pagoPendiente) - c.subTotal) } : prev);
      }
      setPagoConsumoModal(null);
      addToast('Consumo marcado como pagado', 'success');
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      addToast(backendMessage || 'No se pudo marcar el consumo como pagado', 'error');
    }
  };

  const openEditMontos = (alquiler) => {
    setEditMontosModal(alquiler);
    setEditMontosForm({
      subTotal: String(Number(alquiler.subTotal || 0).toFixed(2)),
      pagoPendiente: String(Number(alquiler.pagoPendiente || 0).toFixed(2)),
    });
  };

  const saveEditMontos = async () => {
    if (!editMontosModal) return;
    const subTotal = Number(editMontosForm.subTotal);
    const pagoPendiente = Number(editMontosForm.pagoPendiente);
    if (Number.isNaN(subTotal) || Number.isNaN(pagoPendiente) || subTotal < 0 || pagoPendiente < 0) {
      addToast('Ingrese montos válidos', 'error');
      return;
    }

    try {
      const updated = await patchAlquilerMontos(editMontosModal.id, { subTotal, pagoPendiente });
      await refreshAlquiler(editMontosModal.id);
      setEditMontosModal(null);
      addToast(`Montos actualizados para alquiler ${updated.id}`, 'success');
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      addToast(backendMessage || 'No se pudieron actualizar los montos', 'error');
    }
  };

  const alquilerHeaders = ['#', 'Habitación', 'Cliente', 'Empresa', 'Historial Caja', 'Ingreso', 'Fecha Prevista', 'SubTotal', 'Pendiente', 'Estado', ''];


  return (
    <div className="page-anim">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Alquileres</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>Rentas activas e historial</p>
        </div>
        {tab === 'ACTIVO' && paged.length > 0 && (
          <Btn variant="ghost" icon={<Download size={14} />} onClick={() => descargarReporteAlquileresActivos(paged)}>
            Descargar PDF Activos
          </Btn>
        )}
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
          <Table headers={alquilerHeaders}>
            {paged.map(a => (
              <tr key={a.id}>
                {(() => {
                  const esEmpresa = Boolean(a.empresaNombre && a.empresaNombre !== '—');
                  const puedeVerMontos = isAdmin || !esEmpresa;
                  return (
                    <>
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
                <td style={td}>{a.empresaNombre || '—'}</td>
                <td style={{ ...td, fontWeight: 700, color: 'var(--accent-dark)' }}>
                  {puedeVerMontos ? `S/ ${Number(a.totalPagadoCaja || 0).toFixed(2)}` : '—'}
                </td>
                <td style={td}>{formatDate(a.fechaIngreso)}</td>
                <td style={td}>{formatDate(a.fechaPrevista)}</td>
                <td style={{ ...td, fontWeight: 700 }}>
                  {puedeVerMontos ? `S/ ${parseFloat(a.subTotal).toFixed(2)}` : '—'}
                </td>
                <td style={td}>
                  {puedeVerMontos ? (
                    <span style={{
                      fontWeight: 700,
                      color: a.pagoPendiente > 0 ? 'var(--red, #e53935)' : 'var(--green, #43a047)',
                    }}>
                      S/ {parseFloat(a.pagoPendiente).toFixed(2)}
                    </span>
                  ) : '—'}
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
                  <div style={{ display: 'flex', gap: 4 }}>
                    <Btn variant="ghost" style={{ fontSize: 12, padding: '4px 10px' }}
                      onClick={() => openCuenta(a)}
                      icon={<ShoppingCart size={13} />}>
                      Cuenta
                    </Btn>
                    {isAdmin && (
                      <Btn variant="ghost" style={{ fontSize: 12, padding: '4px 10px' }}
                        onClick={() => openEditMontos(a)}>
                        Editar montos
                      </Btn>
                    )}
                    {a.estadoAlquiler === 'ACTIVO' && (
                      <Btn style={{ fontSize: 12, padding: '4px 10px', background: 'var(--red, #e53935)', color: '#fff', border: 'none' }}
                        onClick={() => openCheckout(a)}
                        icon={<LogOut size={13} />}>
                        Check-out
                      </Btn>
                    )}
                  </div>
                </td>
                    </>
                  );
                })()}
              </tr>
            ))}
          </Table>
          <div style={{ marginTop: 12 }}>
            <Pagination page={page} total={filtered.length} perPage={PER_PAGE} onChange={setPage} />
          </div>
        </>
      )}

      {/* Check-out modal — calls POST /{id}/check-out?metodoPago=X */}
      <Modal open={!!checkOutModal} onOpenChange={(open) => !open && setCheckOutModal(null)} title="Confirmar Check-out" width={480}>
        {checkOutModal && (
          <>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              Hab. {checkOutModal.numeroHabitacion} — {checkOutModal.nombreCliente}
            </div>
            {/* Bill breakdown */}
            <div style={{ background: 'var(--surface-2, #f5f5f5)', borderRadius: 'var(--r-md, 8px)', padding: '12px 16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Base habitación</span>
                <span>S/ {parseFloat(checkOutModal.subTotal).toFixed(2)}</span>
              </div>
              {checkoutLoading && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '4px 0' }}>Cargando consumos...</div>
              )}
              {!checkoutLoading && checkoutCuentaItems.length > 0 && (
                <>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.4px', margin: '8px 0 4px' }}>
                    Consumos pendientes
                  </div>
                  {checkoutCuentaItems.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', paddingLeft: 8, marginBottom: 2 }}>
                      <span>{c.descripcion} × {c.cantidad}</span>
                      <span>S/ {c.subTotal.toFixed(2)}</span>
                    </div>
                  ))}
                </>
              )}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
                <span>Total a cobrar</span>
                <span style={{ color: parseFloat(checkOutModal.pagoPendiente) > 0 ? 'var(--red, #e53935)' : 'var(--green, #43a047)' }}>
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
              <Btn variant="ghost" onClick={() => { setCheckOutModal(null); setCheckoutCuentaItems([]); }}>Cancelar</Btn>
              <Btn onClick={handleCheckOut} disabled={isCheckingOut}>
                {isCheckingOut ? 'Procesando...' : 'Confirmar Check-out'}
              </Btn>
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
                      {mostrarPrecioCuenta && <th style={{ ...thStyle, textAlign: 'right' }}>P. Unit</th>}
                      <th style={{ ...thStyle, textAlign: 'center' }}>Cant.</th>
                      {mostrarPrecioCuenta && <th style={{ ...thStyle, textAlign: 'right' }}>SubTotal</th>}
                      <th style={{ ...thStyle, textAlign: 'center' }}>Estado</th>
                      <th style={thStyle}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cuentaItems.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={tdCuenta}>{c.descripcion}</td>
                        {mostrarPrecioCuenta && <td style={{ ...tdCuenta, textAlign: 'right' }}>S/ {c.precioUnit.toFixed(2)}</td>}
                        <td style={{ ...tdCuenta, textAlign: 'center' }}>{c.cantidad}</td>
                        {mostrarPrecioCuenta && <td style={{ ...tdCuenta, textAlign: 'right', fontWeight: 600 }}>S/ {c.subTotal.toFixed(2)}</td>}
                        <td style={{ ...tdCuenta, textAlign: 'center' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 'var(--r-sm, 4px)',
                            background: c.estado === 'PENDIENTE' ? 'var(--orange-bg, #fff3e0)' : 'var(--green-bg, #e8f5e9)',
                            color: c.estado === 'PENDIENTE' ? 'var(--orange, #ef6c00)' : 'var(--green, #43a047)',
                          }}>
                            {c.estado}
                          </span>
                        </td>
                        <td style={{ ...tdCuenta, position: 'relative' }}>
                          {cuentaModal?.estadoAlquiler === 'ACTIVO' && (
                            <div style={{ display: 'flex', gap: 4 }}>
                              {c.estado === 'PENDIENTE' && isAdmin && (
                                <button onClick={() => startEditConsumo(c)} title="Editar" style={{
                                  border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', padding: 2,
                                }}>
                                  <Pencil size={14} />
                                </button>
                              )}
                              {c.estado === 'PENDIENTE' && puedeMarcarPagadoCuenta && (
                                <button onClick={() => openPagoConsumoModal(c)} title="Marcar como pagado" style={{
                                  border: 'none', background: 'none', cursor: 'pointer', color: 'var(--green, #43a047)', padding: 2,
                                }}>
                                  <Check size={14} />
                                </button>
                              )}
                              <button onClick={() => removeConsumo(c.id)} title="Eliminar" style={{
                                border: 'none', background: 'none', cursor: 'pointer', color: 'var(--red, #e53935)', padding: 2,
                              }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                          {isAdmin && editPopover?.id === c.id && (
                            <div style={{
                              position: 'absolute',
                              right: 0,
                              bottom: 'calc(100% + 6px)',
                              width: 280,
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--r-md, 8px)',
                              boxShadow: 'var(--shadow-md, 0 8px 20px rgba(0,0,0,.12))',
                              padding: 10,
                              zIndex: 20,
                            }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.4px' }}>
                                Editar consumo
                              </div>
                              <div style={{ display: 'grid', gap: 6 }}>
                                <input
                                  style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }}
                                  value={editPopover.descripcion}
                                  onChange={(e) => setEditPopover(p => ({ ...p, descripcion: e.target.value }))}
                                  placeholder="Descripción"
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 84px', gap: 6 }}>
                                  <input
                                    style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }}
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={editPopover.precioUnit}
                                    onChange={(e) => setEditPopover(p => ({ ...p, precioUnit: e.target.value }))}
                                    placeholder="P. Unit"
                                  />
                                  <input
                                    style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }}
                                    type="number"
                                    min="1"
                                    value={editPopover.cantidad}
                                    onChange={(e) => setEditPopover(p => ({ ...p, cantidad: e.target.value }))}
                                    placeholder="Cant."
                                  />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 2 }}>
                                  <Btn size="xs" onClick={saveEditConsumo}>Guardar</Btn>
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0', fontWeight: 700, fontSize: 14 }}>
                  {mostrarPrecioCuenta ? `Total consumos: S/ ${cuentaTotal.toFixed(2)}` : `Items registrados: ${cuentaItems.length}`}
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
                {(() => {
                  const alquilerEsEmpresa = Boolean(cuentaModal?.empresaNombre && cuentaModal?.empresaNombre !== '—');
                  const mostrarPrecioUnit = isAdmin || !alquilerEsEmpresa;
                  return (
                    <>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.5px' }}>
                  Agregar consumo
                </div>
                <div className="form-grid-row" style={{ display: 'grid', gridTemplateColumns: mostrarPrecioUnit ? '2fr 1fr 0.7fr auto' : '2fr 0.7fr auto', gap: 8, alignItems: 'end' }}>
                  <Field label="Descripción">
                    <input style={inputStyle} value={newConsumo.descripcion}
                      onChange={(e) => setNewConsumo(p => ({ ...p, descripcion: e.target.value }))}
                      placeholder="Ej: Agua mineral" />
                  </Field>
                  {mostrarPrecioUnit && (
                    <Field label="Precio Unit.">
                      <input style={inputStyle} type="number" min="0" step="0.5" value={newConsumo.precioUnit}
                        onChange={(e) => setNewConsumo(p => ({ ...p, precioUnit: e.target.value }))}
                        placeholder="0.00" />
                    </Field>
                  )}
                  <Field label="Cant.">
                    <input style={inputStyle} type="number" min="1" value={newConsumo.cantidad}
                      onChange={(e) => setNewConsumo(p => ({ ...p, cantidad: e.target.value }))}
                      placeholder="1" />
                  </Field>
                  <div style={{ marginBottom: 16 }}>
                    <Btn onClick={addConsumo} icon={<Plus size={14} />}>
                      Agregar
                    </Btn>
                  </div>
                </div>
                    </>
                  );
                })()}
              </div>
            )}
          </>
        )}
      </Modal>

      <Modal open={!!pagoConsumoModal} onOpenChange={(open) => !open && setPagoConsumoModal(null)} title="Marcar consumo como pagado" width={420}>
        {pagoConsumoModal && (
          <>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
              {pagoConsumoModal.descripcion} - S/ {Number(pagoConsumoModal.subTotal || 0).toFixed(2)}
            </div>
            <Field label="Método de pago" required>
              <select
                value={pagoConsumoMetodo}
                onChange={(e) => setPagoConsumoMetodo(e.target.value)}
                style={inputStyle}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="YAPE">Yape</option>
                <option value="TRANSFERENCIA">Transferencia</option>
              </select>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setPagoConsumoModal(null)}>Cancelar</Btn>
              <Btn onClick={() => markConsumoAsPaid(pagoConsumoModal, pagoConsumoMetodo)}>Confirmar pago</Btn>
            </div>
          </>
        )}
      </Modal>

      <Modal open={!!editMontosModal} onOpenChange={(open) => !open && setEditMontosModal(null)} title="Editar montos del alquiler" width={420}>
        {editMontosModal && (
          <>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
              Alquiler #{editMontosModal.id} - Hab. {editMontosModal.numeroHabitacion}
            </div>
            <Field label="SubTotal (S/)" required>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                value={editMontosForm.subTotal}
                onChange={(e) => setEditMontosForm((p) => ({ ...p, subTotal: e.target.value }))}
              />
            </Field>
            <Field label="Pendiente (S/)" required>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.01"
                value={editMontosForm.pagoPendiente}
                onChange={(e) => setEditMontosForm((p) => ({ ...p, pagoPendiente: e.target.value }))}
              />
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setEditMontosModal(null)}>Cancelar</Btn>
              <Btn onClick={saveEditMontos}>Guardar</Btn>
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
