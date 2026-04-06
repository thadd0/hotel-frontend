export const chipStyle = (active) => ({
  border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
  background: active ? 'var(--accent-light,#e3f2fd)' : 'var(--surface)',
  color: active ? 'var(--accent)' : 'var(--text-2)',
  borderRadius: 999, padding: '5px 14px', fontSize: 13, cursor: 'pointer',
  fontWeight: active ? 600 : 400, transition: 'background .12s, color .12s',
});

export const quickDateBtn = {
  border: '1px solid var(--border)', background: 'var(--surface)',
  color: 'var(--text-2)', borderRadius: 6, padding: '5px 12px',
  fontSize: 12, cursor: 'pointer', fontWeight: 500,
};
