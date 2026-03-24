import { useState, useEffect, useCallback } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Table, Btn, Field, Modal, EmptyState, Pagination, useToast } from '../../components/UI/index.jsx';
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar, FileText } from 'lucide-react';
import { getResumenHoy, getResumen, postEgreso, postIngresoExtra } from '../../api/caja';

const PER_PAGE = 15;

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md, 8px)',
  border: '1px solid var(--border)', fontSize: 14,
  color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit',
};

const amountInputWrapStyle = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  alignItems: 'center',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r-md, 8px)',
  background: 'var(--surface)',
};

const amountPrefixStyle = {
  height: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 12px',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--accent-dark)',
  background: 'var(--bg)',
  borderRight: '1px solid var(--border)',
  borderTopLeftRadius: 'var(--r-md, 8px)',
  borderBottomLeftRadius: 'var(--r-md, 8px)',
};

const amountInputStyle = {
  width: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: 'var(--text)',
  fontFamily: 'inherit',
  fontSize: 22,
  fontWeight: 700,
  textAlign: 'right',
  padding: '8px 12px',
};

export default function Caja() {
  const { userRole } = useHotel();
  const addToast = useToast();
  const isAdmin = userRole === 'admin';

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState('EGRESO');
  const [form, setForm] = useState({ monto: '', concepto: '', metodoPago: 'EFECTIVO' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState({
    totalIngresos: 0,
    totalEgresos: 0,
    balance: 0,
    cantidadMovimientos: 0,
    movimientos: [],
  });

  // Resumen date filter (admin)
  const [filtroDesde, setFiltroDesde] = useState('');
  const [filtroHasta, setFiltroHasta] = useState('');
  const fetchResumen = useCallback(async () => {
    setLoading(true);
    try {
      // Admin date range summary endpoint
      if (isAdmin && filtroDesde && filtroHasta) {
        const data = await getResumen(filtroDesde, filtroHasta);
        setResumen({
          totalIngresos: data?.totalIngresos || 0,
          totalEgresos: data?.totalEgresos || 0,
          balance: data?.balance || 0,
          cantidadMovimientos: data?.cantidadMovimientos || 0,
          movimientos: Array.isArray(data?.movimientos) ? data.movimientos : [],
        });
      } else {
        // Default: today's movements endpoint
        const movs = await getResumenHoy();
        const movimientos = Array.isArray(movs) ? movs : [];
        const totalIngresos = movimientos.filter(m => m.tipo !== 'EGRESO').reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
        const totalEgresos = movimientos.filter(m => m.tipo === 'EGRESO').reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
        setResumen({
          totalIngresos,
          totalEgresos,
          balance: totalIngresos - totalEgresos,
          cantidadMovimientos: movimientos.length,
          movimientos,
        });
      }
    } catch {
      setResumen({ totalIngresos: 0, totalEgresos: 0, balance: 0, cantidadMovimientos: 0, movimientos: [] });
      addToast('No se pudo cargar información de caja desde backend.', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, filtroDesde, filtroHasta, addToast]);

  useEffect(() => {
    fetchResumen();
  }, [fetchResumen]);

  const paged = resumen.movimientos.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openModal = (tipo) => {
    setModalTipo(tipo);
    setForm({ monto: '', concepto: '', metodoPago: 'EFECTIVO' });
    setErrors({});
    setModalOpen(true);
  };

  const handleMontoChange = (rawValue) => {
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
    setForm((prev) => ({ ...prev, monto: limited }));
  };

  const validate = () => {
    const errs = {};
    if (!form.monto || isNaN(form.monto) || Number(form.monto) <= 0) errs.monto = 'Monto válido requerido';
    if (!form.concepto.trim()) errs.concepto = 'Concepto requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      monto: Number(form.monto),
      concepto: form.concepto,
      metodoPago: form.metodoPago,
    };
    try {
      if (modalTipo === 'EGRESO') {
        await postEgreso(payload);
      } else {
        await postIngresoExtra(payload);
      }
      addToast(modalTipo === 'EGRESO' ? 'Egreso registrado.' : 'Ingreso registrado.', 'success');
      await fetchResumen();
    } catch {
      addToast('No se pudo registrar movimiento en backend.', 'error');
      return;
    }
    setModalOpen(false);
  };

  return (
    <div className="page-anim">
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Caja / Movimientos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>Registra ingresos, egresos y controla saldo</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Btn icon={<Plus size={14} />} onClick={() => openModal('INGRESO_EXTRA')}>Ingreso Extra</Btn>
          <Btn icon={<TrendingDown size={14} />} variant="ghost" onClick={() => openModal('EGRESO')}>Registrar Egreso</Btn>
        </div>
      </div>

      {/* Summary Cards — aligned to ResumenCajaDTO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <SummaryCard label="Total Ingresos" value={resumen.totalIngresos} color="var(--green, #43a047)" bg="var(--green-bg, #e8f5e9)" icon={<TrendingUp size={18} />} />
        <SummaryCard label="Total Egresos" value={resumen.totalEgresos} color="var(--red, #e53935)" bg="var(--red-bg, #fbe9e7)" icon={<TrendingDown size={18} />} />
        <SummaryCard label="Balance" value={resumen.balance} color={resumen.balance >= 0 ? 'var(--accent)' : 'var(--red, #e53935)'} bg="var(--accent-light, #e3f2fd)" icon={<DollarSign size={18} />} />
        <SummaryCard label="Movimientos" value={resumen.cantidadMovimientos} isCount color="var(--text-2)" bg="var(--surface-2, #f5f5f5)" icon={<FileText size={18} />} />
      </div>

      {/* Admin: date range filter — aligned to GET /resumen?desde&hasta */}
      {isAdmin && (
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 18, padding: '14px 16px',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md, 8px)',
        }}>
          <Calendar size={16} color="var(--text-muted)" style={{ marginBottom: 8 }} />
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Desde</label>
            <input type="date" style={{ ...inputStyle, width: 150 }} value={filtroDesde} onChange={e => { setFiltroDesde(e.target.value); setPage(1); }} />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Hasta</label>
            <input type="date" style={{ ...inputStyle, width: 150 }} value={filtroHasta} onChange={e => { setFiltroHasta(e.target.value); setPage(1); }} />
          </div>
          {(filtroDesde || filtroHasta) && (
            <Btn variant="ghost" style={{ marginBottom: 2 }} onClick={() => { setFiltroDesde(''); setFiltroHasta(''); setPage(1); }}>Limpiar</Btn>
          )}
        </div>
      )}

      {/* Movements table */}
      {loading ? (
        <EmptyState message="Cargando movimientos..." icon={<DollarSign size={48} />} />
      ) : paged.length === 0 ? (
        <EmptyState message="No hay movimientos registrados" icon={<DollarSign size={48} />} />
      ) : (
        <>
          <Table headers={['Fecha', 'Tipo', 'Monto', 'Método', 'Concepto', 'Usuario', 'Hab.', 'Cliente']}>
            {paged.map(m => (
              <tr key={m.id}>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{new Date(m.fecha).toLocaleDateString('es-PE')}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 'var(--r-sm, 4px)', fontSize: 11, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    color: m.tipo === 'EGRESO' ? 'var(--red, #e53935)' : 'var(--green, #43a047)',
                    background: m.tipo === 'EGRESO' ? 'var(--red-bg, #fbe9e7)' : 'var(--green-bg, #e8f5e9)',
                  }}>
                    {m.tipo === 'EGRESO' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {m.tipo}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: 14, color: 'var(--accent-dark)' }}>
                  S/ {parseFloat(m.monto).toFixed(2)}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{m.metodoPago || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{(m.concepto || '').substring(0, 40)}{(m.concepto || '').length > 40 ? '...' : ''}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{m.nombreUsuario || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{m.numeroHabitacion || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 13 }}>{m.nombreCliente || '—'}</td>
              </tr>
            ))}
          </Table>
          <div style={{ marginTop: 12 }}>
            <Pagination page={page} total={resumen.movimientos.length} perPage={PER_PAGE} onChange={setPage} />
          </div>
        </>
      )}

      {/* Modal for Egreso / Ingreso Extra  — payload matches GastoRequestDTO */}
      <Modal open={modalOpen} onOpenChange={setModalOpen} title={modalTipo === 'EGRESO' ? 'Registrar Egreso' : 'Ingreso Extra'}>
        <Field label="Monto (S/)" error={errors.monto} required>
          <div style={amountInputWrapStyle}>
            <span style={amountPrefixStyle}>S/</span>
            <input
              type="text"
              inputMode="decimal"
              value={form.monto}
              onChange={e => handleMontoChange(e.target.value)}
              placeholder="0.00"
              style={amountInputStyle}
            />
          </div>
        </Field>
        <Field label="Concepto" error={errors.concepto} required>
          <input
            type="text"
            value={form.concepto}
            onChange={e => setForm({ ...form, concepto: e.target.value })}
            placeholder="Descripción del movimiento"
            style={inputStyle}
          />
        </Field>
        <Field label="Método de Pago">
          <select
            value={form.metodoPago}
            onChange={e => setForm({ ...form, metodoPago: e.target.value })}
            style={inputStyle}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="YAPE">Yape</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </select>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSubmit}>{modalTipo === 'EGRESO' ? 'Registrar Egreso' : 'Registrar Ingreso'}</Btn>
        </div>
      </Modal>
    </div>
  );
}

function SummaryCard({ label, value, color, bg, icon, isCount }) {
  return (
    <div style={{
      padding: '16px 18px', borderRadius: 'var(--r-md, 8px)',
      background: bg, border: `1px solid ${color}22`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8     }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>
        {isCount ? value : `S/ ${value.toFixed(2)}`}
      </div>
    </div>
  );
}

