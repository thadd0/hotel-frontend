import { useState, useEffect, useCallback, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Table, Btn, Field, Modal, EmptyState, Pagination, Card, RSelect, SearchInput, inputStyle, tdStyle, PageHeader, useToast } from '../../components/UI/index.jsx';
import { DollarSign, TrendingUp, TrendingDown, Plus, FileText, Download, Pencil, ArrowUp, ArrowDown, Filter, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { getMovimientosRango, postEgreso, postIngresoExtra, patchMovimientoMonto, getResumenHoy, cobrarMovimientoEmpresa } from '../../api/caja';
import { descargarReporteCajaMovimientos, generarCierreCaja } from '../../utils/reportesPdf';
import { sanitizeDecimal, METODOS_PAGO } from '../../utils/formHelpers';

const PER_PAGE = 15;
const CAJA_FILTROS_STORAGE_KEY = 'caja.filtros.rango';

const chipStyle = (active) => ({
  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
  background: active ? 'var(--accent-light,#e3f2fd)' : 'var(--surface)',
  color: active ? 'var(--accent)' : 'var(--text-2)',
  borderRadius: 999, padding: '5px 14px', fontSize: 13, cursor: 'pointer',
  fontWeight: active ? 600 : 400, transition: 'background .12s, color .12s',
});

const quickDateBtn = {
  border: '1px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text-2)', borderRadius: 6, padding: '5px 12px',
  fontSize: 12, cursor: 'pointer', fontWeight: 500,
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
  const { userRole, empresas } = useHotel();
  const addToast = useToast();
  const isAdmin = userRole === 'admin';

  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  // Resumen date filter (todos los roles) - persistido en localStorage
  const [filtroDesde, setFiltroDesde] = useState(() => {
    try {
      const raw = localStorage.getItem(CAJA_FILTROS_STORAGE_KEY);
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.desde || '';
    } catch {
      return '';
    }
  });
  const [filtroHasta, setFiltroHasta] = useState(() => {
    try {
      const raw = localStorage.getItem(CAJA_FILTROS_STORAGE_KEY);
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.hasta || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    if (!filtroDesde && !filtroHasta) {
      localStorage.removeItem(CAJA_FILTROS_STORAGE_KEY);
      return;
    }
    localStorage.setItem(CAJA_FILTROS_STORAGE_KEY, JSON.stringify({ desde: filtroDesde, hasta: filtroHasta }));
  }, [filtroDesde, filtroHasta]);

  const [filtrosOpen, setFiltrosOpen]     = useState(false);
  const [filtroTipo, setFiltroTipo]       = useState('');
  const [filtroMetodo, setFiltroMetodo]   = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroEmpresaNombre, setFiltroEmpresaNombre] = useState('');
  const [buscarNombre, setBuscarNombre]   = useState('');
  const [sortDir, setSortDir]             = useState('desc');

  const filtroActivos = [filtroDesde, filtroHasta, filtroTipo, filtroMetodo, filtroCliente, filtroEmpresaNombre, buscarNombre.trim()].filter(Boolean).length;
  const limpiarFiltros = () => { setFiltroDesde(''); setFiltroHasta(''); setFiltroTipo(''); setFiltroMetodo(''); setFiltroCliente(''); setFiltroEmpresaNombre(''); setBuscarNombre(''); setPage(1); };

  // Edit monto state (admin only)
  const [editMontoModal, setEditMontoModal] = useState(null); // movimiento or null
  const [editMontoValue, setEditMontoValue] = useState('');

  // Tab state
  const [activeTab, setActiveTab] = useState('movimientos');

  // Cobrar empresa state (admin only)
  const [cobrarModal, setCobrarModal] = useState(null);
  const [cobrarMetodo, setCobrarMetodo] = useState('EFECTIVO');
  const [cobrarSubmitting, setCobrarSubmitting] = useState(false);
  const [pageEmpresa, setPageEmpresa] = useState(1);

  const fetchResumen = useCallback(async () => {
    setLoading(true);
    try {
      const desde = filtroDesde || '2000-01-01';
      const hasta = filtroHasta || new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
      const movs = await getMovimientosRango(desde, hasta);
      const movimientos = Array.isArray(movs) ? movs : [];
      const totalIngresos = movimientos.filter(m => m.tipo === 'INGRESO').reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
      const totalEgresos = movimientos.filter(m => m.tipo === 'EGRESO').reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
      setResumen({
        totalIngresos,
        totalEgresos,
        balance: totalIngresos - totalEgresos,
        cantidadMovimientos: movimientos.length,
        movimientos,
      });
    } catch {
      setResumen({ totalIngresos: 0, totalEgresos: 0, balance: 0, cantidadMovimientos: 0, movimientos: [] });
      addToast('No se pudo cargar información de caja desde backend.', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtroDesde, filtroHasta, addToast]);

  useEffect(() => {
    fetchResumen();
  }, [fetchResumen]);

  const movimientosFiltrados = useMemo(() => {
    let filtered = resumen.movimientos;
    if (filtroTipo) filtered = filtered.filter(m => filtroTipo === 'INGRESO' ? m.tipo === 'INGRESO' : m.tipo === 'EGRESO');
    if (filtroMetodo) filtered = filtered.filter(m => m.metodoPago?.toUpperCase() === filtroMetodo);
    if (filtroCliente === 'SOLO_CLIENTES') filtered = filtered.filter(m => !m.nombreEmpresa || m.nombreEmpresa === '—');
    if (filtroCliente === 'SOLO_EMPRESAS') filtered = filtered.filter(m => m.nombreEmpresa && m.nombreEmpresa !== '—');
    if (filtroEmpresaNombre) filtered = filtered.filter(m => m.nombreEmpresa === filtroEmpresaNombre);
    if (buscarNombre.trim()) {
      const q = buscarNombre.toLowerCase().trim();
      filtered = filtered.filter(m =>
        m.concepto?.toLowerCase().includes(q) ||
        m.nombreCliente?.toLowerCase().includes(q) ||
        m.nombreUsuario?.toLowerCase().includes(q) ||
        m.nombreEmpresa?.toLowerCase().includes(q) ||
        String(m.numeroHabitacion).includes(q)
      );
    }
    return filtered;
  }, [resumen.movimientos, filtroTipo, filtroMetodo, filtroCliente, filtroEmpresaNombre, buscarNombre]);

  const movimientosSorted = useMemo(() => {
    return [...movimientosFiltrados].sort((a, b) => {
      const ta = new Date(a.fecha).getTime();
      const tb = new Date(b.fecha).getTime();
      return sortDir === 'desc' ? tb - ta : ta - tb;
    });
  }, [movimientosFiltrados, sortDir]);

  const cuentasEmpresaPendientes = useMemo(() => {
    return [...resumen.movimientos.filter(m => m.tipo === 'PENDIENTE')]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [resumen.movimientos]);

  const totalPendienteEmpresas = useMemo(() =>
    cuentasEmpresaPendientes.reduce((s, m) => s + (parseFloat(m.monto) || 0), 0),
    [cuentasEmpresaPendientes]
  );

  const empresasConDeuda = useMemo(() =>
    new Set(cuentasEmpresaPendientes.map(m => m.nombreEmpresa).filter(Boolean)).size,
    [cuentasEmpresaPendientes]
  );

  /* Resumen: tarjetas muestran solo los montos que el rol puede ver.
     Recepcionista ve todas las filas pero monto/método de empresa = "—",
     así que los totales deben excluir esos montos ocultos. */
  const resumenFiltrado = useMemo(() => {
    const monetarios = isAdmin
      ? movimientosFiltrados
      : movimientosFiltrados.filter(m => !(m.nombreEmpresa && m.nombreEmpresa !== '—'));
    const totalIngresos = monetarios
      .filter(m => m.tipo === 'INGRESO')
      .reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
    const totalEgresos = monetarios
      .filter(m => m.tipo === 'EGRESO')
      .reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
    return {
      totalIngresos,
      totalEgresos,
      balance: totalIngresos - totalEgresos,
      cantidadMovimientos: movimientosFiltrados.length,
    };
  }, [movimientosFiltrados, isAdmin]);

  const paged = movimientosSorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCobrar = async () => {
    if (!cobrarModal) return;
    setCobrarSubmitting(true);
    try {
      await cobrarMovimientoEmpresa(cobrarModal.id, cobrarMetodo);
      addToast('Pago de empresa registrado.', 'success');
      setCobrarModal(null);
      await fetchResumen();
    } catch (error) {
      const msg = error?.response?.data?.message;
      addToast(msg || 'Error al registrar el pago.', 'error');
    } finally {
      setCobrarSubmitting(false);
    }
  };

  const openModal = (tipo) => {
    setModalTipo(tipo);
    setForm({ monto: '', concepto: '', metodoPago: 'EFECTIVO' });
    setErrors({});
    setModalOpen(true);
  };

  const handleMontoChange = (rawValue) => {
    setForm((prev) => ({ ...prev, monto: sanitizeDecimal(rawValue) }));
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
    setSubmitting(true);
    try {
      if (modalTipo === 'EGRESO') {
        await postEgreso(payload);
      } else {
        await postIngresoExtra(payload);
      }
      addToast(modalTipo === 'EGRESO' ? 'Egreso registrado.' : 'Ingreso registrado.', 'success');
      await fetchResumen();
      setModalOpen(false);
    } catch (error) {
      const msg = error?.response?.data?.message;
      addToast(msg || 'No se pudo registrar movimiento en backend.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-anim">
      <PageHeader title="Caja / Movimientos" subtitle={`Registra ingresos, egresos y controla saldo · ${movimientosFiltrados.length}`}>
          <Btn icon={<Plus size={14} />} onClick={() => openModal('INGRESO_EXTRA')} title="Registrar ingresos fuera de alquileres (servicios, depósitos, etc.)">Ingreso Adicional</Btn>
          <Btn icon={<TrendingDown size={14} />} variant="ghost" onClick={() => openModal('EGRESO')}>Registrar Egreso</Btn>
      </PageHeader>

      {/* Summary Cards — aligned to ResumenCajaDTO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 18 }}>
        <SummaryCard label="Total Ingresos" value={resumenFiltrado.totalIngresos} color="var(--green, #43a047)" bg="var(--green-bg, #e8f5e9)" icon={<TrendingUp size={16} />} />
        <SummaryCard label="Total Egresos" value={resumenFiltrado.totalEgresos} color="var(--red, #e53935)" bg="var(--red-bg, #fbe9e7)" icon={<TrendingDown size={16} />} />
        <SummaryCard label="Balance" value={resumenFiltrado.balance} color={resumenFiltrado.balance >= 0 ? 'var(--accent)' : 'var(--red, #e53935)'} bg="var(--accent-light, #e3f2fd)" icon={<DollarSign size={16} />} />
        <SummaryCard label="Movimientos" value={resumenFiltrado.cantidadMovimientos} isCount color="var(--text-2)" bg="var(--surface-2, #f5f5f5)" icon={<FileText size={16} />} />
      </div>

      {/* Tab selector */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid var(--border)' }}>
        {[['movimientos', 'Movimientos'], ['cuentas_empresa', 'Cuentas Empresa']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            padding: '8px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            color: activeTab === key ? 'var(--accent)' : 'var(--text-2)',
            borderBottom: activeTab === key ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: -2, transition: 'color .12s, border-color .12s',
          }}>
            {label}
            {key === 'cuentas_empresa' && cuentasEmpresaPendientes.length > 0 && (
              <span style={{ background: '#e65100', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700, marginLeft: 6 }}>
                {cuentasEmpresaPendientes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'movimientos' && <>
      <Card padding="12px 16px" style={{ marginBottom: 18 }}>
        {/* Toolbar row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => setFiltrosOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              border: `1.5px solid ${filtroActivos > 0 ? 'var(--accent)' : 'var(--border)'}`,
              background: filtroActivos > 0 ? 'var(--accent-light,#e3f2fd)' : 'var(--surface)',
              color: filtroActivos > 0 ? 'var(--accent)' : 'var(--text)',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}
          >
            <Filter size={14} />
            Filtros
            {filtroActivos > 0 && (
              <span style={{ background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{filtroActivos}</span>
            )}
            {filtrosOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {/* Active filter pills summary (when panel is closed) */}
          {!filtrosOpen && filtroActivos > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
              {filtroTipo && <span style={{ background: 'var(--accent-light,#e3f2fd)', color: 'var(--accent)', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{filtroTipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}</span>}
              {filtroMetodo && <span style={{ background: 'var(--green-bg,#e8f5e9)', color: 'var(--green,#43a047)', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{filtroMetodo.charAt(0) + filtroMetodo.slice(1).toLowerCase()}</span>}
              {filtroCliente === 'SOLO_CLIENTES' && <span style={{ background: '#e3f2fd', color: '#1565c0', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>Solo clientes</span>}
              {filtroCliente === 'SOLO_EMPRESAS' && <span style={{ background: '#f3e5f5', color: '#7b1fa2', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>Solo empresas</span>}
              {filtroEmpresaNombre && <span style={{ background: '#f3e5f5', color: '#7b1fa2', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{filtroEmpresaNombre}</span>}
              {filtroDesde && <span style={{ background: '#fff3e0', color: '#e65100', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>Desde {filtroDesde}</span>}
              {filtroHasta && <span style={{ background: '#fff3e0', color: '#e65100', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>Hasta {filtroHasta}</span>}
              {buscarNombre.trim() && <span style={{ background: 'var(--surface-2,#f5f5f5)', color: 'var(--text-2)', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>&#34;{buscarNombre.trim()}&#34;</span>}
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {filtroActivos > 0 && <Btn variant="ghost" onClick={limpiarFiltros}>Limpiar</Btn>}
            <Btn variant="ghost" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px' }}
              icon={sortDir === 'desc' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
              onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}>
              {sortDir === 'desc' ? 'Más reciente' : 'Más antiguo'}
            </Btn>
            <Btn variant="ghost" icon={<Download size={14} />}
              onClick={() => descargarReporteCajaMovimientos(movimientosFiltrados, {
                desde: filtroDesde, hasta: filtroHasta, isAdmin,
                filtroTipo,
                filtroEmpresa: filtroEmpresaNombre || (filtroCliente === 'SOLO_EMPRESAS' ? 'empresas' : ''),
                search: buscarNombre,
                resumen: {
                  totalIngresos: resumenFiltrado.totalIngresos,
                  totalEgresos: resumenFiltrado.totalEgresos,
                  balance: resumenFiltrado.balance,
                  cantidadMovimientos: resumenFiltrado.cantidadMovimientos,
                },
              })}>
              Descargar PDF
            </Btn>
            <Btn variant="ghost" icon={<FileText size={14} />}
              onClick={async () => {
                const hoy = new Date().toISOString().slice(0, 10);
                let movHoy = [];
                try {
                  movHoy = await getResumenHoy();
                  if (!Array.isArray(movHoy)) movHoy = [];
                } catch (error) {
                  const msg = error?.response?.data?.message;
                  addToast(msg || 'Error al cargar movimientos de hoy', 'error');
                  return;
                }
                const movsParaCierre = isAdmin
                  ? movHoy
                  : movHoy.filter(m => !(m.nombreEmpresa && m.nombreEmpresa !== '—'));
                const totalIngresos = movsParaCierre.filter(m => m.tipo === 'INGRESO').reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
                const totalEgresos = movsParaCierre.filter(m => m.tipo === 'EGRESO').reduce((s, m) => s + (parseFloat(m.monto) || 0), 0);
                generarCierreCaja(movsParaCierre, {
                  totalIngresos, totalEgresos,
                  balance: totalIngresos - totalEgresos,
                  cantidadMovimientos: movsParaCierre.length,
                }, `Fecha: ${hoy}`);
              }}>
              Cierre de Caja
            </Btn>
          </div>
        </div>

        {/* Collapsible filter panel */}
        {filtrosOpen && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Período */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text-xmuted)', display: 'block', marginBottom: 8 }}>Período</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Desde</span>
                  <input type="date" style={{ ...inputStyle, width: 150 }} value={filtroDesde} onChange={e => { setFiltroDesde(e.target.value); setPage(1); }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Hasta</span>
                  <input type="date" style={{ ...inputStyle, width: 150 }} value={filtroHasta} onChange={e => { setFiltroHasta(e.target.value); setPage(1); }} />
                </div>
                <button onClick={() => { const h = new Date().toISOString().slice(0, 10); setFiltroDesde(h); setFiltroHasta(h); setPage(1); }} style={quickDateBtn}>Hoy</button>
                <button onClick={() => {
                  const h = new Date(); const y = h.getFullYear(); const m = h.getMonth();
                  setFiltroDesde(`${y}-${String(m + 1).padStart(2, '0')}-01`);
                  setFiltroHasta(new Date(y, m + 1, 0).toISOString().slice(0, 10)); setPage(1);
                }} style={quickDateBtn}>Este mes</button>
                <button onClick={() => {
                  const h = new Date();
                  const dom = new Date(h); dom.setDate(h.getDate() - ((h.getDay() + 6) % 7));
                  const fin = new Date(dom); fin.setDate(dom.getDate() + 6);
                  setFiltroDesde(dom.toISOString().slice(0, 10)); setFiltroHasta(fin.toISOString().slice(0, 10)); setPage(1);
                }} style={quickDateBtn}>Esta semana</button>
                {(filtroDesde || filtroHasta) && <button onClick={() => { setFiltroDesde(''); setFiltroHasta(''); setPage(1); }} style={{ ...quickDateBtn, color: 'var(--red,#e53935)' }}>× Limpiar fechas</button>}
              </div>
            </div>

            {/* Tipo de movimiento */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text-xmuted)', display: 'block', marginBottom: 8 }}>Tipo de movimiento</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[['', 'Todos'], ['INGRESO', 'Ingreso'], ['EGRESO', 'Egreso']].map(([v, l]) => (
                  <button key={v} onClick={() => { setFiltroTipo(v); setPage(1); }} style={chipStyle(filtroTipo === v)}>{l}</button>
                ))}
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text-xmuted)', display: 'block', marginBottom: 8 }}>Método de pago</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[['', 'Todos'], ['EFECTIVO', 'Efectivo'], ['TARJETA', 'Tarjeta'], ['TRANSFERENCIA', 'Transferencia'], ['YAPE', 'Yape'], ['PLIN', 'Plin']].map(([v, l]) => (
                  <button key={v} onClick={() => { setFiltroMetodo(v); setPage(1); }} style={chipStyle(filtroMetodo === v)}>{l}</button>
                ))}
              </div>
            </div>

            {/* Tipo de cliente */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text-xmuted)', display: 'block', marginBottom: 8 }}>Tipo de cliente</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[['', 'Todos'], ['SOLO_CLIENTES', 'Solo clientes'], ['SOLO_EMPRESAS', 'Solo empresas']].map(([v, l]) => (
                  <button key={v} onClick={() => { setFiltroCliente(v); if (v !== 'SOLO_EMPRESAS') setFiltroEmpresaNombre(''); setPage(1); }} style={chipStyle(filtroCliente === v)}>{l}</button>
                ))}
              </div>
              {filtroCliente === 'SOLO_EMPRESAS' && empresas.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text-xmuted)', display: 'block', marginBottom: 6 }}>Empresa específica</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {[['', 'Todas'], ...empresas.map(e => [e.nombre, e.nombre])].map(([v, l]) => (
                      <button key={v} onClick={() => { setFiltroEmpresaNombre(v); setPage(1); }} style={chipStyle(filtroEmpresaNombre === v)}>{l}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Búsqueda por texto */}
            <div style={{ maxWidth: 360 }}>
              <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--text-xmuted)', display: 'block', marginBottom: 4 }}>Buscar</label>
              <SearchInput value={buscarNombre} onChange={v => { setBuscarNombre(v); setPage(1); }} placeholder="Concepto, cliente, usuario, habitación…" />
            </div>

          </div>
        )}
      </Card>

      {/* Movements table */}
      <Card>
      {loading ? (
        <EmptyState message="Cargando movimientos..." icon={<DollarSign size={48} />} />
      ) : paged.length === 0 ? (
        <EmptyState message="No hay movimientos registrados" icon={<DollarSign size={48} />} />
      ) : (
        <>
          <Table headers={isAdmin
            ? ['Fecha', 'Tipo', 'Monto', 'Método', 'Concepto', 'Usuario', 'Cliente', '']
            : ['Fecha', 'Tipo', 'Monto', 'Método', 'Concepto', 'Usuario', 'Cliente']
          }>
            {paged.map(m => {
              const esCorporativo = Boolean(m.nombreEmpresa && m.nombreEmpresa !== '—');
              const ocultarMonto = !isAdmin && esCorporativo;
              return (
              <tr key={m.id}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{ transition: 'background .12s' }}
              >                <td style={tdStyle}>{new Date(m.fecha).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 'var(--r-sm, 4px)', fontSize: 11, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    color: m.tipo === 'EGRESO' ? 'var(--red, #e53935)' : m.tipo === 'PENDIENTE' ? '#e65100' : 'var(--green, #43a047)',
                    background: m.tipo === 'EGRESO' ? 'var(--red-bg, #fbe9e7)' : m.tipo === 'PENDIENTE' ? '#fff3e0' : 'var(--green-bg, #e8f5e9)',
                  }}>
                    {m.tipo === 'EGRESO' ? <TrendingDown size={12} /> : m.tipo === 'PENDIENTE' ? <Clock size={12} /> : <TrendingUp size={12} />}
                    {m.tipo === 'EGRESO' ? 'Egreso' : m.tipo === 'PENDIENTE' ? 'Pendiente' : 'Ingreso'}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 700, fontSize: 14, color: 'var(--accent-dark)' }}
                  title={ocultarMonto ? 'Monto empresa — visible solo para administradores' : undefined}
                >
                  {ocultarMonto ? <span style={{ cursor: 'help' }}>—</span> : `S/ ${parseFloat(m.monto).toFixed(2)}`}
                </td>
                <td style={tdStyle}
                  title={ocultarMonto ? 'Monto empresa — visible solo para administradores' : undefined}
                >
                  {ocultarMonto ? <span style={{ cursor: 'help' }}>—</span> : (m.metodoPago || '—')}
                </td>
                <td style={tdStyle}>{(m.concepto || '').substring(0, 40)}{(m.concepto || '').length > 40 ? '...' : ''}</td>
                <td style={tdStyle}>{m.nombreUsuario || '—'}</td>
                <td style={tdStyle}>
                  {m.nombreCliente || '—'}
                  {m.nombreEmpresa && m.nombreEmpresa !== '—' && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{m.nombreEmpresa}</div>
                  )}
                </td>
                {isAdmin && (
                  <td style={tdStyle}>
                    <Btn variant="ghost" style={{ fontSize: 11, padding: '3px 8px' }}
                      onClick={() => { setEditMontoModal(m); setEditMontoValue(String(parseFloat(m.monto).toFixed(2))); }}
                      icon={<Pencil size={12} />}
                      title="Editar monto">
                      Editar
                    </Btn>
                  </td>
                )}
              </tr>
              );
            })}
          </Table>
          <div style={{ marginTop: 12 }}>
            <Pagination page={page} total={movimientosFiltrados.length} perPage={PER_PAGE} onChange={setPage} />
          </div>
        </>
      )}
      </Card>
      </> /* end movimientos tab */}

      {activeTab === 'cuentas_empresa' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 18 }}>
            <SummaryCard label="Total Pendiente Empresas" value={totalPendienteEmpresas} color="#e65100" bg="#fff3e0" icon={<Clock size={16} />} />
            <SummaryCard label="Empresas con deuda" value={empresasConDeuda} isCount color="var(--text-2)" bg="var(--surface-2, #f5f5f5)" icon={<FileText size={16} />} />
          </div>
          <Card>
            {loading ? (
              <EmptyState message="Cargando..." icon={<DollarSign size={48} />} />
            ) : cuentasEmpresaPendientes.length === 0 ? (
              <EmptyState message="No hay cuentas pendientes de empresas" icon={<Clock size={48} />} />
            ) : (
              <>
              <Table headers={isAdmin
                ? ['Fecha checkout', 'Empresa', 'Cliente', 'Habitación', 'Monto', '']
                : ['Fecha checkout', 'Empresa', 'Cliente', 'Habitación', 'Monto']
              }>
                {cuentasEmpresaPendientes.slice((pageEmpresa - 1) * PER_PAGE, pageEmpresa * PER_PAGE).map(m => (
                  <tr key={m.id}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    style={{ transition: 'background .12s' }}
                  >
                    <td style={tdStyle}>{new Date(m.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{m.nombreEmpresa || '—'}</td>
                    <td style={tdStyle}>{m.nombreCliente || '—'}</td>
                    <td style={tdStyle}>{m.numeroHabitacion || '—'}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#e65100' }}>S/ {parseFloat(m.monto).toFixed(2)}</td>
                    {isAdmin && (
                      <td style={tdStyle}>
                        <Btn style={{ fontSize: 11, padding: '3px 8px' }}
                          onClick={() => { setCobrarModal(m); setCobrarMetodo('EFECTIVO'); }}>
                          Registrar Pago
                        </Btn>
                      </td>
                    )}
                  </tr>
                ))}
              </Table>
              <div style={{ marginTop: 12 }}>
                <Pagination page={pageEmpresa} total={cuentasEmpresaPendientes.length} perPage={PER_PAGE} onChange={setPageEmpresa} />
              </div>
              </>
            )}
          </Card>
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
            {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleSubmit} disabled={submitting}>{modalTipo === 'EGRESO' ? 'Registrar Egreso' : 'Registrar Ingreso'}</Btn>
        </div>
      </Modal>

      {/* Edit monto modal — admin only */}
      <Modal open={!!editMontoModal} onOpenChange={(open) => !open && setEditMontoModal(null)} title="Editar monto" width={380}>
        {editMontoModal && (
          <>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              {editMontoModal.concepto} — {editMontoModal.tipo === 'EGRESO' ? 'Egreso' : 'Ingreso'}
            </div>
            <Field label="Nuevo monto (S/)" required>
              <div style={amountInputWrapStyle}>
                <span style={amountPrefixStyle}>S/</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={editMontoValue}
                  onChange={e => setEditMontoValue(sanitizeDecimal(e.target.value))}
                  placeholder="0.00"
                  style={amountInputStyle}
                />
              </div>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setEditMontoModal(null)}>Cancelar</Btn>
              <Btn onClick={async () => {
                const val = Number(editMontoValue);
                if (!val || val <= 0) { addToast('Monto inválido', 'error'); return; }
                try {
                  await patchMovimientoMonto(editMontoModal.id, val);
                  addToast('Monto actualizado', 'success');
                  setEditMontoModal(null);
                  await fetchResumen();
                } catch (error) {
                  const msg = error?.response?.data?.message;
                  addToast(msg || 'Error al actualizar monto', 'error');
                }
              }}>Guardar</Btn>
            </div>
          </>
        )}
      </Modal>

      {/* Cobrar empresa modal — admin only */}
      <Modal open={!!cobrarModal} onOpenChange={(open) => !open && setCobrarModal(null)} title="Registrar Pago de Empresa" width={380}>
        {cobrarModal && (
          <>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              {cobrarModal.nombreEmpresa} &middot; {cobrarModal.nombreCliente} &middot; S/ {parseFloat(cobrarModal.monto).toFixed(2)}
            </div>
            <Field label="Método de Pago" required>
              <select
                value={cobrarMetodo}
                onChange={e => setCobrarMetodo(e.target.value)}
                style={inputStyle}
              >
                {METODOS_PAGO.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Btn variant="ghost" onClick={() => setCobrarModal(null)}>Cancelar</Btn>
              <Btn onClick={handleCobrar} disabled={cobrarSubmitting}>Confirmar Pago</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

function SummaryCard({ label, value, color, bg, icon, isCount }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 'var(--r-md, 8px)',
      background: bg, border: `1.5px solid ${color}30`,
      borderLeft: `4px solid ${color}`,
      transition: 'transform .12s, box-shadow .12s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>
        {isCount ? value : `S/ ${value.toFixed(2)}`}
      </div>
    </div>
  );
}

