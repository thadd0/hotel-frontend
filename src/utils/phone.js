import { getCountries, getCountryCallingCode } from 'libphonenumber-js/min';

/**
 * Country dial code options for <select> menus.
 * Each entry: { code: 'PE', dialCode: '+51', label: 'Perú (PE) +51' }
 */
export const COUNTRY_DIAL_OPTIONS = (() => {
  const regionNames =
    typeof Intl !== 'undefined' && Intl.DisplayNames
      ? new Intl.DisplayNames(['es'], { type: 'region' })
      : null;

  return getCountries()
    .map((code) => {
      const dialCode = `+${getCountryCallingCode(code)}`;
      const countryName = regionNames?.of(code) || code;
      return { code, dialCode, label: `${countryName} (${code}) ${dialCode}` };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
})();

/** Parse "+51 987654321" → { countryCode, dialCode, number } */
export function parseIntlPhone(rawPhone) {
  const raw = String(rawPhone || '').trim();
  const match = raw.match(/^(\+\d{1,4})\s*(.*)$/);
  if (!match) return { countryCode: 'PE', dialCode: '+51', number: raw };

  const dialCode = match[1];
  const number = match[2] || '';
  const found = COUNTRY_DIAL_OPTIONS.find((c) => c.dialCode === dialCode);
  return { countryCode: found?.code || 'PE', dialCode, number };
}

/** Build "+51 987654321" from country code + number */
export function buildIntlPhone(countryCode, number) {
  const clean = String(number || '').trim();
  if (!clean) return '';
  const dialCode = COUNTRY_DIAL_OPTIONS.find((c) => c.code === countryCode)?.dialCode || '+51';
  return `${dialCode} ${clean}`;
}

/** Find country code by dial prefix, e.g. '+51' → 'PE' */
export function findCountryByDial(dialCode) {
  return COUNTRY_DIAL_OPTIONS.find((c) => c.dialCode === dialCode)?.code || 'PE';
}

/** Get dial code from country code, e.g. 'PE' → '+51' */
export function getDialCode(countryCode) {
  return COUNTRY_DIAL_OPTIONS.find((c) => c.code === countryCode)?.dialCode || '+51';
}
