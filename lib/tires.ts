/** Nominal, unloaded tire dimensions derived from the size marking. */
export type Tire = {
  label: string;
  format: 'metric' | 'inch';
  widthMm: number;
  aspectRatio: number;
  wheelIn: number;
  diameterMm: number;
  sidewallMm: number;
  circumferenceMm: number;
  theoreticalRevsPerMile: number;
};
export type TireResult = { ok: true; tire: Tire } | { ok: false; error: string };
export const MM_PER_INCH = 25.4;
const inRange = (n: number, min: number, max: number) => Number.isFinite(n) && n >= min && n <= max;

export function parseTireSize(input: string): TireResult {
  if (!input.trim()) return { ok: false, error: 'Enter a tire size to see its dimensions.' };
  const text = input.toUpperCase().replace(/\s/g, '').replace(/×/g, 'X');
  const metric = /^(?:P|LT)?(\d{3}(?:\.\d{1,2})?)\/(\d{2,3}(?:\.\d{1,2})?)(?:\/?(?:ZR|R)|\/)(\d{2}(?:\.\d{1,2})?)(?:LT)?$/.exec(text);
  const inch = /^(?:LT)?(\d{2}(?:\.\d{1,2})?)X(\d{1,2}(?:\.\d{1,2})?)(?:R|X|-)(\d{2}(?:\.\d{1,2})?)(?:LT)?$/.exec(text);
  if (!metric && !inch) return { ok: false, error: 'Use a size like 265/70R17 or 33x12.50R15. Leave off load and speed ratings.' };
  const values = (metric || inch)!.slice(1).map(Number);
  const wheelIn = values[2];
  if (!inRange(wheelIn, 12, 30)) return { ok: false, error: 'Enter a wheel diameter from 12 to 30 inches.' };
  let widthMm: number, sidewallMm: number, diameterMm: number, aspectRatio: number, label: string;
  if (metric) {
    const [width, ratio] = values;
    if (!inRange(width, 100, 500)) return { ok: false, error: 'Enter a section width from 100 to 500 mm.' };
    if (!inRange(ratio, 15, 100)) return { ok: false, error: 'Enter an aspect ratio from 15 to 100.' };
    widthMm = width;
    aspectRatio = ratio;
    sidewallMm = width * ratio / 100;
    diameterMm = wheelIn * MM_PER_INCH + 2 * sidewallMm;
    label = `${width}/${ratio}R${wheelIn}`;
  } else {
    const [diameter, width] = values;
    if (!inRange(diameter, 20, 60)) return { ok: false, error: 'Enter an overall tire diameter from 20 to 60 inches.' };
    if (!inRange(width, 4, 20)) return { ok: false, error: 'Enter a section width from 4 to 20 inches.' };
    if (diameter <= wheelIn) return { ok: false, error: 'The overall tire diameter must be larger than the wheel.' };
    widthMm = width * MM_PER_INCH;
    diameterMm = diameter * MM_PER_INCH;
    sidewallMm = (diameterMm - wheelIn * MM_PER_INCH) / 2;
    aspectRatio = sidewallMm / widthMm * 100;
    label = `${diameter}×${width}R${wheelIn}`;
  }
  const circumferenceMm = Math.PI * diameterMm;
  return { ok: true, tire: { label, format: metric ? 'metric' : 'inch', widthMm, aspectRatio, wheelIn,
    diameterMm, sidewallMm, circumferenceMm, theoreticalRevsPerMile: 1609344 / circumferenceMm } };
}

export function compareTires(current: Tire, next: Tire) {
  const ratio = next.diameterMm / current.diameterMm;
  return {
    diameterMm: next.diameterMm - current.diameterMm,
    widthMm: next.widthMm - current.widthMm,
    sidewallMm: next.sidewallMm - current.sidewallMm,
    clearanceMm: (next.diameterMm - current.diameterMm) / 2,
    diameterPercent: (ratio - 1) * 100,
    speedRatio: ratio,
  };
}

export function speedAfterTireChange(indicatedMph: number, current: Tire, next: Tire): number | null {
  if (!inRange(indicatedMph, 0, 200)) return null;
  return indicatedMph * next.diameterMm / current.diameterMm;
}
