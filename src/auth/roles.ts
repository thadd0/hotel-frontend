function decodeJwtPayload(token?: string | null): Record<string, any> | null {
  try {
    const payloadBase64 = token?.split('.')?.[1];
    if (!payloadBase64) return null;

    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function mapBackendRoleToAppRole(rawRole?: string | null): 'admin' | 'recepcion' {
  if (typeof rawRole !== 'string') return 'recepcion';
  return rawRole.includes('ADMINISTRADOR') ? 'admin' : 'recepcion';
}

export function deriveAppRole(accessToken?: string | null, fallbackRole?: string | null): 'admin' | 'recepcion' {
  const payload = decodeJwtPayload(accessToken);
  const candidates: string[] = [
    payload?.rol,
    payload?.role,
    ...(Array.isArray(payload?.roles) ? payload.roles : []),
    ...(Array.isArray(payload?.authorities) ? payload.authorities : []),
    fallbackRole,
  ].filter(Boolean);

  const rawRole = String(candidates[0] ?? 'ROLE_RECEPCIONISTA');
  return mapBackendRoleToAppRole(rawRole);
}
