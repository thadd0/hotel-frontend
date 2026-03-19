import * as Dialog      from '@radix-ui/react-dialog';
import * as AlertDialog  from '@radix-ui/react-alert-dialog';
import * as Select       from '@radix-ui/react-select';
import * as Switch       from '@radix-ui/react-switch';
import * as Tooltip      from '@radix-ui/react-tooltip';
import * as Separator    from '@radix-ui/react-separator';
import { X, ChevronDown, Check, AlertTriangle } from 'lucide-react';

/* ─── PROVEEDOR DE INFORMACIÓN SOBRE HERRAMIENTAS (envolver App) ─────────────────── */
export function TooltipProvider({ children }) {
  return <Tooltip.Provider delayDuration={400}>{children}</Tooltip.Provider>;
}

/* ─── BOTÓN ───────────────────────────────────────── */
const BTN_VARIANTS = {
  primary: { bg:'var(--accent)',    color:'#fff',               border:'transparent',         hoverBg:'var(--accent-dark)' },
  ghost:   { bg:'transparent',     color:'var(--text-2)',       border:'var(--border)',        hoverBg:'var(--surface-2)'   },
  danger:  { bg:'var(--red)',       color:'#fff',               border:'transparent',         hoverBg:'#b91c1c'            },
  soft:    { bg:'var(--accent-light)', color:'var(--accent)',   border:'var(--accent-mid)',   hoverBg:'var(--accent-mid)'  },
  icon:    { bg:'transparent',     color:'var(--text-muted)',   border:'var(--border)',        hoverBg:'var(--surface-2)'   },
};
const BTN_SIZES = {
  xs: { padding:'4px 10px',  fontSize:'11px', height:'26px', borderRadius:'var(--r-sm)' },
  sm: { padding:'5px 13px',  fontSize:'12.5px', height:'30px', borderRadius:'var(--r-sm)' },
  md: { padding:'7px 16px',  fontSize:'13.5px', height:'36px', borderRadius:'var(--r-md)' },
  lg: { padding:'9px 20px',  fontSize:'14px',  height:'42px', borderRadius:'var(--r-md)' },
};

export function Btn({ children, variant='primary', size='md', icon, onClick, type='button', disabled, full }) {
  const v = BTN_VARIANTS[variant];
  const s = BTN_SIZES[size];
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={e => { if(!disabled) e.currentTarget.style.background = v.hoverBg; }}
      onMouseLeave={e => { e.currentTarget.style.background = v.bg; }}
      style={{
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
        fontFamily:'inherit', fontWeight:600, cursor: disabled?'not-allowed':'pointer',
        border:`1px solid ${v.border}`, background:v.bg, color:v.color,
        opacity: disabled ? .55 : 1, transition:'all .15s ease',
        width: full ? '100%' : undefined,
        ...s,
      }}
    >
      {icon}{children}
    </button>
  );
}

/* ─── INSIGNIA ─────────────────────────────────────────── */
export function Badge({ label, color, bg, border, dot }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'3px 9px', borderRadius:'var(--r-full)',
      background: bg, border:`1px solid ${border}`,
      color, fontSize:'11px', fontWeight:700, letterSpacing:'.3px',
    }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background:dot, flexShrink:0 }} />
      {label}
    </span>
  );
}

/* ─── DIÁLOGO RADIX (Modal) ──────────────────────────── */
export function Modal({ open, onOpenChange, title, children, width=480 }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content" style={{ maxWidth: width }}>
          <div style={{
            background:'var(--surface)', borderRadius:'var(--r-xl)',
            boxShadow:'var(--shadow-lg)', overflow:'hidden',
          }}>
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'18px 22px 16px', borderBottom:'1px solid var(--border)',
            }}>
              <Dialog.Title style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>
                {title}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button style={{
                  width:28, height:28, borderRadius:'var(--r-sm)', border:'1px solid var(--border)',
                  background:'transparent', display:'flex', alignItems:'center', justifyContent:'center',
                  color:'var(--text-muted)', cursor:'pointer',
                }}>
                  <X size={14} />
                </button>
              </Dialog.Close>
            </div>
            <div style={{ padding:'20px 22px 22px' }}>{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ─── DIÁLOGO DE ALERTA RADIX (Confirmar) ─────────────────── */
export function ConfirmDialog({ open, onOpenChange, onConfirm, message='¿Confirmas la eliminación de este registro?' }) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="alert-overlay" />
        <AlertDialog.Content className="alert-content">
          <div style={{
            background:'var(--surface)', borderRadius:'var(--r-xl)',
            boxShadow:'var(--shadow-lg)', padding:'24px 24px 20px',
          }}>
            <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:20 }}>
              <div style={{
                width:40, height:40, borderRadius:'var(--r-md)', background:'var(--red-bg)',
                border:'1px solid var(--red-border)', display:'flex', alignItems:'center',
                justifyContent:'center', flexShrink:0,
              }}>
                <AlertTriangle size={19} color="var(--red)" />
              </div>
              <div>
                <AlertDialog.Title style={{ fontWeight:700, fontSize:15, marginBottom:5 }}>
                  Confirmar eliminación
                </AlertDialog.Title>
                <AlertDialog.Description style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.5 }}>
                  {message}
                </AlertDialog.Description>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <AlertDialog.Cancel asChild>
                <Btn variant="ghost">Cancelar</Btn>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Btn variant="danger" onClick={onConfirm}>Sí, eliminar</Btn>
              </AlertDialog.Action>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/* ─── SELECCIÓN RADIX ──────────────────────────────────── */
const CLEAR_VALUE = '__clear__';

export function RSelect({ value, onValueChange, placeholder, options=[], triggerStyle }) {
  const handleChange = (v) => {
    onValueChange(v === CLEAR_VALUE ? '' : v);
  };

  // Radix needs a non-empty string as value; use CLEAR_VALUE sentinel when nothing selected
  const radixValue = value || CLEAR_VALUE;

  return (
    <Select.Root value={radixValue} onValueChange={handleChange}>
      <Select.Trigger
        style={{
          display:'inline-flex', alignItems:'center', justifyContent:'space-between',
          gap:6, padding:'7px 12px', borderRadius:'var(--r-md)', cursor:'pointer',
          border:'1px solid var(--border)', background:'var(--surface)',
          fontSize:'13px', color: value ? 'var(--text)' : 'var(--text-muted)',
          fontFamily:'inherit', fontWeight:500, outline:'none', minWidth:150,
          ...triggerStyle,
        }}
        aria-label={placeholder}
      >
        <Select.Value placeholder={placeholder} />
        <Select.Icon><ChevronDown size={13} color="var(--text-muted)" /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content data-radix-select-content position="popper" sideOffset={5}>
          <Select.Viewport style={{ padding:4 }}>
            {placeholder && (
              <>
                <Select.Item value={CLEAR_VALUE} data-radix-select-item>
                  <Select.ItemText>
                    <span style={{ color:'var(--text-muted)', fontSize:13 }}>{placeholder}</span>
                  </Select.ItemText>
                </Select.Item>
                <Select.Separator data-radix-select-separator />
              </>
            )}
            {options.map(o => (
              <Select.Item key={o.value} value={o.value} data-radix-select-item>
                <Select.ItemIndicator style={{ marginLeft:'auto', paddingLeft:8 }}>
                  <Check size={12} />
                </Select.ItemIndicator>
                <Select.ItemText>{o.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

/* ─── INTERRUPTOR RADIX ──────────────────────────────────── */
export function SwitchField({ checked, onCheckedChange, label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <Switch.Root
        className="switch-root"
        checked={checked}
        onCheckedChange={onCheckedChange}
      >
        <Switch.Thumb className="switch-thumb" />
      </Switch.Root>
      {label && <span style={{ fontSize:13, color:'var(--text-2)', fontWeight:500 }}>{label}</span>}
    </div>
  );
}

/* ─── INFORMACIÓN SOBRE HERRAMIENTAS ────────────────────────────────────────── */
export function Tip({ children, label }) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content className="tooltip-content" sideOffset={4}>
          {label}
          <Tooltip.Arrow style={{ fill:'var(--text)' }} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

/* ─── SEPARADOR ─────────────────────────────────────── */
export function Sep({ style: s }) {
  return (
    <Separator.Root
      style={{ height:1, background:'var(--border)', margin:'16px 0', ...s }}
    />
  );
}

/* ─── CAMPO DE FORMULARIO ─────────────────────────────────────── */
export function Field({ label, children, error, required, hint }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && (
        <label style={{ display:'block', fontSize:12.5, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>
          {label}
          {required && <span style={{ color:'var(--red)', marginLeft:2 }}>*</span>}
          {hint && <span style={{ color:'var(--text-xmuted)', fontWeight:400, marginLeft:4 }}>{hint}</span>}
        </label>
      )}
      {children}
      {error && <p style={{ color:'var(--red)', fontSize:11.5, marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
        <AlertTriangle size={11} /> {error}
      </p>}
    </div>
  );
}

export const inputStyle = {
  width:'100%', padding:'8px 12px', borderRadius:'var(--r-md)',
  border:'1px solid var(--border)', fontSize:'13.5px',
  color:'var(--text)', background:'var(--surface)', outline:'none',
  transition:'border-color .15s ease, box-shadow .15s ease',
  fontFamily:'inherit',
};

export const inputFocus = (e) => {
  e.target.style.borderColor = 'var(--accent)';
  e.target.style.boxShadow   = '0 0 0 3px rgba(13,148,136,.12)';
};
export const inputBlur = (e) => {
  e.target.style.borderColor = 'var(--border)';
  e.target.style.boxShadow   = 'none';
};

/* ─── TARJETA ───────────────────────────────────────────── */
export function Card({ children, style: extra, padding }) {
  return (
    <div style={{
      background:'var(--surface)', borderRadius:'var(--r-lg)',
      border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)',
      overflow: padding ? undefined : 'hidden',
      padding: padding || undefined,
      ...extra,
    }}>
      {children}
    </div>
  );
}

/* ─── TABLA ──────────────────────────────────────────── */
export function Table({ headers, children }) {
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={thStyle}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

const thStyle = {
  padding:'9px 16px', textAlign:'left',
  fontSize:'11px', fontWeight:700, letterSpacing:'.7px',
  color:'var(--text-xmuted)', background:'var(--bg)',
  borderBottom:'1px solid var(--border)', textTransform:'uppercase',
};

export const tdStyle = {
  padding:'11px 16px', fontSize:'13.5px', color:'var(--text)',
  borderBottom:'1px solid var(--border)', verticalAlign:'middle',
};

/* ─── BOTONES DE ACCIÓN ─────────────────────────────────── */
export function EditBtn({ onClick }) {
  return (
    <Tip label="Editar">
      <button onClick={onClick} style={{
        width:30, height:30, borderRadius:'var(--r-sm)',
        border:'1px solid var(--border)', background:'var(--surface)',
        color:'var(--accent)', cursor:'pointer', display:'inline-flex',
        alignItems:'center', justifyContent:'center', fontSize:14,
        transition:'all .15s',
      }}
      onMouseEnter={e=>{ e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='var(--accent)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.borderColor='var(--border)'; }}
      >✎</button>
    </Tip>
  );
}

export function DeleteBtn({ onClick }) {
  return (
    <Tip label="Eliminar">
      <button onClick={onClick} style={{
        width:30, height:30, borderRadius:'var(--r-sm)',
        border:'1px solid var(--border)', background:'var(--surface)',
        color:'var(--red)', cursor:'pointer', display:'inline-flex',
        alignItems:'center', justifyContent:'center', fontSize:14,
        transition:'all .15s',
      }}
      onMouseEnter={e=>{ e.currentTarget.style.background='var(--red)'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='var(--red)'; }}
      onMouseLeave={e=>{ e.currentTarget.style.background='var(--surface)'; e.currentTarget.style.color='var(--red)'; e.currentTarget.style.borderColor='var(--border)'; }}
      >🗑</button>
    </Tip>
  );
}

/* ─── PAGINACIÓN ─────────────────────────────────────── */
export function Pagination({ page, total, perPage=10, onChange }) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'14px 0 4px' }}>
      <button onClick={()=>onChange(page-1)} disabled={page===1} style={{ ...pgBtn, opacity:page===1?.4:1 }}>‹</button>
      {Array.from({length:pages},(_,i)=>i+1).map(p=>(
        <button key={p} onClick={()=>onChange(p)} style={{ ...pgBtn, ...(p===page?pgActive:{}) }}>{p}</button>
      ))}
      <button onClick={()=>onChange(page+1)} disabled={page===pages} style={{ ...pgBtn, opacity:page===pages?.4:1 }}>›</button>
    </div>
  );
}
const pgBtn = {
  width:28, height:28, borderRadius:'var(--r-sm)',
  border:'1px solid var(--border)', background:'var(--surface)',
  fontSize:13, cursor:'pointer', display:'inline-flex',
  alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontWeight:600,
};
const pgActive = { background:'var(--accent)', color:'#fff', border:'1px solid var(--accent)' };

/* ─── ESTADO VACÍO ────────────────────────────────────── */
export function EmptyState({ message='No hay registros', icon }) {
  return (
    <div style={{
      padding:'56px 20px', textAlign:'center',
      color:'var(--text-muted)', fontSize:14,
    }}>
      {icon && <div style={{ marginBottom:10, opacity:.35 }}>{icon}</div>}
      <div style={{ fontWeight:500 }}>{message}</div>
    </div>
  );
}

/* ─── ENTRADA DE BÚSQUEDA ───────────────────────────────────── */
export function SearchInput({ value, onChange, placeholder='Buscar...' }) {
  return (
    <div style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
      <span style={{ position:'absolute', left:10, color:'var(--text-xmuted)', fontSize:13, pointerEvents:'none' }}>⌕</span>
      <input
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={inputFocus}
        onBlur={inputBlur}
        style={{ ...inputStyle, paddingLeft:30, width:200 }}
      />
    </div>
  );
}
