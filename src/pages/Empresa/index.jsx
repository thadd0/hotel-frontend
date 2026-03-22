import { useHotel } from '../../context/HotelContext';
import { Card, Field, Badge, Sep } from '../../components/UI/index.jsx';
import { Building2 } from 'lucide-react';
import GenericCRUD from '../../components/GenericCRUD.jsx';

export default function Empresa() {
  const { empresa, updateEmpresa, userRole } = useHotel();

  const isAdmin = userRole === 'admin';

  if (!empresa) {
    return <div>No hay datos de empresa</div>;
  }

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'ruc', label: 'RUC' },
    { key: 'direccion', label: 'Dirección' },
    { key: 'visible', label: 'Visible', render: i => (
      <Badge label={i.visible ? 'Activa' : 'Inactiva'} color={i.visible ? 'var(--green)' : 'var(--red)'} />
    )},
  ];

  const formFields = [
    { key: 'nombre', label: 'Nombre de la empresa', required: true },
    { key: 'ruc', label: 'RUC', required: true },
    { key: 'direccion', label: 'Dirección completa', required: true },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Correo electrónico' },
  ];

  return (
    <div className="page-anim">
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {/* Info Card */}
        <Card padding="20px" style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <Building2 size={22} color="var(--accent)" />
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Información de Empresa</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Datos principales del hotel
              </p>
            </div>
          </div>
          
          <div style={{ display: 'grid', gap: 12 }}>
            <Field label="Nombre">
              <span style={{ fontSize: 15, fontWeight: 600 }}>{empresa.nombre}</span>
            </Field>
            <Field label="RUC">
              <span style={{ fontSize: 15, fontWeight: 600 }}>{empresa.ruc}</span>
            </Field>
            <Field label="Dirección">
              <span style={{ fontSize: 14 }}>{empresa.direccion}</span>
            </Field>
            <div style={{ display: 'flex', gap: 12 }}>
              <Field label="Teléfono">
                <span style={{ fontSize: 14 }}>{empresa.telefono}</span>
              </Field>
              <Field label="Email">
                <span style={{ fontSize: 14 }}>{empresa.email}</span>
              </Field>
            </div>
            <Field label="Estado">
              <Badge 
                label={empresa.visible ? 'Activa' : 'Inactiva'} 
                color={empresa.visible ? 'var(--green)' : 'var(--red)'} 
              />
            </Field>
          </div>
        </Card>

        {/* Edit para admin */}
        {isAdmin && (
          <Card padding="24px" style={{ flex: 1, minWidth: 320 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Editar Empresa</h3>
            <GenericCRUD
              items={[empresa]}
              onUpdate={updateEmpresa}
              columns={columns}
              formFields={formFields}
              emptyMsg="Sin datos"
              emptyIcon={<Building2 size={42} />}
              modalTitle="Empresa"
              readOnly={false}
            />
          </Card>
        )}
      </div>
    </div>
  );
}

