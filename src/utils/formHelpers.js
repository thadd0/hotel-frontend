/** Payment method options used across the entire app */
export const METODOS_PAGO = [
  { value: 'EFECTIVO', label: 'Efectivo' },
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'YAPE', label: 'Yape' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
];

/**
 * Sanitize decimal input (allow only digits + one dot, max 2 decimals).
 * Returns the cleaned string — caller decides where to store it.
 */
export function sanitizeDecimal(rawValue) {
  const normalized = String(rawValue || '').replace(',', '.');
  const cleaned = normalized.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  const safe = parts.length > 2
    ? `${parts[0]}.${parts.slice(1).join('')}`
    : cleaned;
  const [intPart = '', decPart = ''] = safe.split('.');
  return safe.includes('.')
    ? `${intPart}.${decPart.slice(0, 2)}`
    : intPart;
}

/**
 * Build tiposDocumentoPermitidos from the context's tiposDocumento array.
 * Filters to only ['DNI', 'CE', 'PASAPORTE'] with a static fallback.
 */
export function buildTiposDocPermitidos(tiposDocumento) {
  const ALLOWED = ['DNI', 'CE', 'PASAPORTE'];
  const source =
    Array.isArray(tiposDocumento) && tiposDocumento.length
      ? tiposDocumento
      : [
          { id: 1, nombre: 'DNI' },
          { id: 2, nombre: 'CE' },
          { id: 3, nombre: 'PASAPORTE' },
        ];
  return source.filter((td) => ALLOWED.includes(td?.nombre));
}

/** Check if an alquiler belongs to an empresa (consistent pattern) */
export function esAlquilerEmpresa(a) {
  return Boolean(a?.empresaNombre && a.empresaNombre !== '—');
}

/** Check if the current role can see empresa monetary data */
export function puedeVerMontos(isAdmin, esEmpresa) {
  return isAdmin || !esEmpresa;
}
