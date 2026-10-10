/** Возвращает номер из 11–12 цифр (РФ: 7…, РБ: 375…) или null. */
export function normalizePhone(input: string): string | null {
  let d = input.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("8")) d = "7" + d.slice(1);
  if (d.length === 10) d = "7" + d;
  if (/^7\d{10}$/.test(d) || /^375\d{9}$/.test(d)) return d;
  return null;
}