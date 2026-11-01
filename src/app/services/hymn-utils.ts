// src/app/services/hymn-utils.ts
export function padHymnNumber(num: string | number | null | undefined): string {
  if (num == null) return '';
  const str = String(num).trim();
  return /^\d+$/.test(str) ? str.padStart(3, '0') : str;
}