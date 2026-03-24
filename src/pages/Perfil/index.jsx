import { useState, useCallback, useEffect } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Card, Field, Btn, Modal } from '../../components/UI/index.jsx';
import { User, KeyRound, Pencil } from 'lucide-react';
import { getMe, updateMe, changePassword } from '../../api/usuarios';

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--r-md, 8px)',
  border: '1px solid var(--border)', fontSize: 14,
  color: 'var(--text)', background: 'var(--surface)', fontFamily: 'inherit',
};

export default function Perfil() {
  const { userName, userRole, tiposDocumento } = useHotel();

  // Mock profile data aligned to UsuarioDTO
  const [perfil, setPerfil] = useState({
    id: 1,
    nombre: userName || 'Admin',
    numDocumento: '72345678',
    telefono: '+51 987 654 321',
    tipoDocumento: { id: 1, nombre: 'DNI' },
    rol: { id: 1, nombre: userRole === 'admin' ? 'ROLE_ADMINISTRADOR' : 'ROLE_RECEPCIONISTA' },
  });

  // Load real profile from backend (/api/me)
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const me = await getMe();
        if (!alive) return;
        if (me?.id) {
          setPerfil(me);
        }
      } catch {
        // Keep fallback mock profile when backend is unavailable
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // Edit profile modal
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Change password modal
  const [passOpen, setPassOpen] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [passErrors, setPassErrors] = useState({});

  const openEditProfile = () => {
    setEditForm({
      nombre: perfil.nombre,
      telefono: perfil.telefono || '',
      numDocumento: perfil.numDocumento,
      tipoDocumento: perfil.tipoDocumento?.nombre || '',
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEditSubmit = useCallback(async () => {
    const e = {};
    if (!editForm.nombre?.trim()) e.nombre = 'Nombre requerido';
    setEditErrors(e);
    if (Object.keys(e).length) return;

    // ActualizarPerfilRequestDTO: {nombre, telefono, numDocumento, tipoDocumento}
    const payload = {
      nombre: editForm.nombre,
      telefono: editForm.telefono || null,
      numDocumento: editForm.numDocumento,
      tipoDocumento: editForm.tipoDocumento || null,
    };
    try {
      const updated = await updateMe(payload);
      setPerfil(updated);
    } catch {
      const tid = tiposDocumento.find(t => t.nombre === editForm.tipoDocumento);
      setPerfil(p => ({
        ...p,
        nombre: editForm.nombre,
        telefono: editForm.telefono,
        numDocumento: editForm.numDocumento,
        tipoDocumento: tid || p.tipoDocumento,
      }));
    }
    setEditOpen(false);
  }, [editForm, tiposDocumento]);

  const handleChangePassword = useCallback(async () => {
    const e = {};
    if (!passForm.currentPassword?.trim()) e.currentPassword = 'Requerido';
    if (!passForm.newPassword?.trim()) e.newPassword = 'Requerido';
    setPassErrors(e);
    if (Object.keys(e).length) return;

    // CambiarPasswordRequestDTO: {currentPassword, newPassword}
    try {
      await changePassword(passForm);
    } catch { /* mock fallback */ }
    setPassOpen(false);
    setPassForm({ currentPassword: '', newPassword: '' });
  }, [passForm]);

  return (
    <div className="page-anim">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Mi Perfil</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: '4px 0 0' }}>Datos de tu cuenta</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn icon={<Pencil size={14} />} onClick={openEditProfile}>Editar Perfil</Btn>
          <Btn icon={<KeyRound size={14} />} variant="ghost" onClick={() => { setPassOpen(true); setPassForm({ currentPassword: '', newPassword: '' }); setPassErrors({}); }}>Cambiar Contraseña</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Profile Card */}
        <Card padding="28px">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-light)',
              border: '2px solid var(--accent-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={24} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{perfil.nombre}</div>
              <span style={{
                padding: '2px 10px', borderRadius: 'var(--r-sm, 4px)', fontSize: 11, fontWeight: 600,
                background: perfil.rol?.nombre === 'ROLE_ADMINISTRADOR' ? 'var(--accent-light, #e3f2fd)' : 'var(--green-bg, #e8f5e9)',
                color: perfil.rol?.nombre === 'ROLE_ADMINISTRADOR' ? 'var(--accent)' : 'var(--green, #43a047)',
              }}>
                {perfil.rol?.nombre === 'ROLE_ADMINISTRADOR' ? 'Administrador' : 'Recepcionista'}
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 16 }}>
            <InfoRow label="N° Documento" value={`${perfil.tipoDocumento?.nombre || ''} ${perfil.numDocumento}`} />
            <InfoRow label="Teléfono" value={perfil.telefono || '—'} />
          </div>
        </Card>
      </div>

      {/* Edit Profile Modal — ActualizarPerfilRequestDTO */}
      <Modal open={editOpen} onOpenChange={setEditOpen} title="Editar Perfil" width={420}>
        <Field label="Nombre" error={editErrors.nombre} required>
          <input style={inputStyle} value={editForm.nombre || ''} onChange={e => setEditForm(p => ({ ...p, nombre: e.target.value }))} />
        </Field>
        <Field label="N° Documento">
          <input style={inputStyle} value={editForm.numDocumento || ''} onChange={e => setEditForm(p => ({ ...p, numDocumento: e.target.value }))} />
        </Field>
        <Field label="Tipo Documento">
          <select style={inputStyle} value={editForm.tipoDocumento || ''} onChange={e => setEditForm(p => ({ ...p, tipoDocumento: e.target.value }))}>
            <option value="">Seleccionar...</option>
            {tiposDocumento.map(td => (
              <option key={td.id} value={td.nombre}>{td.nombre}</option>
            ))}
          </select>
        </Field>
        <Field label="Teléfono">
          <input style={inputStyle} value={editForm.telefono || ''} onChange={e => setEditForm(p => ({ ...p, telefono: e.target.value }))} placeholder="+51 ..." />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleEditSubmit}>Guardar cambios</Btn>
        </div>
      </Modal>

      {/* Change Password Modal — CambiarPasswordRequestDTO */}
      <Modal open={passOpen} onOpenChange={setPassOpen} title="Cambiar Contraseña" width={380}>
        <Field label="Contraseña actual" error={passErrors.currentPassword} required>
          <input style={inputStyle} type="password" value={passForm.currentPassword} onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} />
        </Field>
        <Field label="Nueva contraseña" error={passErrors.newPassword} required>
          <input style={inputStyle} type="password" value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} />
        </Field>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setPassOpen(false)}>Cancelar</Btn>
          <Btn onClick={handleChangePassword}>Cambiar</Btn>
        </div>
      </Modal>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
    </div>
  );
}
