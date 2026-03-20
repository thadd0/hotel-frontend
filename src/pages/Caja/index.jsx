import { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import GenericCRUD from '../../components/GenericCRUD.jsx';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function Caja() {
  const { movimientos = [], addMovimiento, updateMovimiento, deleteMovimiento } = useHotel();

  const columns = [
    { key: 'fecha', label: 'Fecha', render: i => new Date(i.fecha).toLocaleDateString('es-PE') },
    { key: 'tipo', label: 'Tipo', render: i => (
      <span style={{
        padding: '2px 8px',
        borderRadius: 'var(--r-full)',
        fontSize: 11,
        fontWeight: 600,
        color: i.tipo === 'ingreso' ? 'var(--green)' : 'var(--red)',
        background: i.tipo === 'ingreso' ? 'var(--green-bg)' : 'var(--red-bg)',
      }}>
        {i.tipo === 'ingreso' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {i.tipo.toUpperCase()}
      </span>
    )},
    { key: 'monto', label: 'Monto', render: i => (
      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--accent-dark)' }}>
        S/ {parseFloat(i.monto).toFixed(2)}
      </span>
    )},
    { key: 'concepto', label: 'Concepto', render: i => i.concepto.substring(0, 40) + '...' },
    { key: 'saldo', label: 'Saldo', render: i => (
      <span style={{ fontWeight: 600, color: parseFloat(i.saldo) >= 0 ? 'var(--green)' : 'var(--red)' }}>
        S/ {parseFloat(i.saldo).toFixed(2)}
      </span>
    )},
  ];

  const formFields = [
    { key: 'fecha', label: 'Fecha', type: 'date', required: true },
    { key: 'tipo', label: 'Tipo', type: 'select', options: [
      { value: 'ingreso', label: 'Ingreso' },
      { value: 'egreso', label: 'Egreso' }
    ], required: true },
    { key: 'monto', label: 'Monto (S/)', type: 'number', required: true },
    { key: 'concepto', label: 'Concepto', required: true },
  ];

  return (
    <div className="page-anim">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Caja / Movimientos</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Registra ingresos, egresos y controla saldo</p>
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>
          S/ {movimientos.reduce((sum, m) => sum + (m.tipo === 'ingreso' ? parseFloat(m.monto) : -parseFloat(m.monto)), 0).toFixed(2)}
        </div>
      </div>

      <GenericCRUD
        items={movimientos}
        onAdd={addMovimiento}
        onUpdate={updateMovimiento}
        onDelete={deleteMovimiento}
        columns={columns}
        formFields={formFields}
        emptyMsg="No hay movimientos registrados"
        emptyIcon={<DollarSign size={48} />}
        modalTitle="Movimiento de Caja"
      />
    </div>
  );
}

