/**
 * Phone + name normalization for patient identity.
 *
 * Phone is normalized to E.164. Name is normalized for matching only
 * (lowercased, whitespace-collapsed) — original casing is preserved for display.
 */

const DEFAULT_COUNTRY_CODE = '+91';

export function normalizePhone(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/[^\d+]/g, '');

  if (digits.startsWith('+')) {
    const rest = digits.slice(1).replace(/\D/g, '');
    if (rest.length < 8 || rest.length > 15) return null;
    return '+' + rest;
  }

  digits = digits.replace(/\D/g, '');

  if (digits.startsWith('00')) {
    const rest = digits.slice(2);
    if (rest.length < 8 || rest.length > 15) return null;
    return '+' + rest;
  }

  if (digits.length === 10) {
    return DEFAULT_COUNTRY_CODE + digits;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return '+' + digits;
  }

  if (digits.length >= 8 && digits.length <= 15) {
    return '+' + digits;
  }

  return null;
}

export function normalizeNameKey(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[.,]/g, '');
}

export function isValidPhone(input: string | null | undefined): boolean {
  return normalizePhone(input) !== null;
}
