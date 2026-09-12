import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const dir = mkdtempSync(join(tmpdir(), 'azst-tire-tests-'));
const source = readFileSync(new URL('../lib/tires.ts', import.meta.url), 'utf8');
writeFileSync(join(dir, 'tires.mjs'), ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
const { parseTireSize, compareTires, speedAfterTireChange } = await import(pathToFileURL(join(dir, 'tires.mjs')).href);
assert.equal(dirname(resolve(dir)), resolve(tmpdir()));
assert.ok(basename(dir).startsWith('azst-tire-tests-'));
rmSync(dir, { recursive: true, force: true });
const tire = (size) => { const result = parseTireSize(size); assert.equal(result.ok, true, JSON.stringify(result)); return result.tire; };
const near = (actual, expected, tolerance = .000001) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} should equal ${expected}`);

test('metric markings produce correct nominal width, sidewalls and overall diameter', () => {
  const t = tire('265/70R17');
  assert.equal(t.format, 'metric');
  near(t.widthMm, 265); near(t.sidewallMm, 185.5); near(t.wheelIn, 17); near(t.diameterMm, 802.8);
  near(t.circumferenceMm, 2522.0705823, .00001);
  near(t.theoreticalRevsPerMile, 638.1042693, .001);
  near(tire('275/40ZR20').diameterMm, 728);
});

test('inch flotation sizes, prefixes, spaces, decimal rims and separators are supported', () => {
  for (const size of ['33x12.50R15', 'LT33X12.5R15', '33 × 12.50 r 15 LT', '33x12.5-15', '33x12.5x15']) {
    const t = tire(size);
    near(t.widthMm, 317.5); near(t.diameterMm, 838.2); near(t.sidewallMm, 228.6); near(t.aspectRatio, 72);
  }
  for (const size of ['p265/70r17', 'LT265/70/R17', '265/70/17']) assert.equal(tire(size).label, '265/70R17');
  near(tire('235/85R16.5').wheelIn, 16.5);
});

test('mixed-format comparisons distinguish full diameter from axle-height change', () => {
  const result = compareTires(tire('33x12.5R15'), tire('35x12.5R17'));
  near(result.diameterMm, 50.8); near(result.clearanceMm, 25.4); near(result.widthMm, 0); near(result.sidewallMm, 0);
  near(result.diameterPercent, 6.06060606); near(result.speedRatio, 35 / 33);
  const mixed = compareTires(tire('265/70R17'), tire('33x12.5R15'));
  near(mixed.diameterMm, 35.4); near(mixed.widthMm, 52.5); near(mixed.clearanceMm, 17.7);
});

test('speedometer estimate has the correct direction, identity and zero-speed behavior', () => {
  const a = tire('33x12.5R15'), b = tire('35x12.5R17');
  near(speedAfterTireChange(60, a, b), 63.636363636);
  near(speedAfterTireChange(60, b, a), 56.571428571);
  near(speedAfterTireChange(60, a, a), 60);
  near(speedAfterTireChange(0, a, b), 0);
  for (const invalid of [-1, 201, NaN, Infinity]) assert.equal(speedAfterTireChange(invalid, a, b), null);
  const same = compareTires(a, a);
  near(same.diameterPercent, 0); near(same.clearanceMm, 0); near(same.widthMm, 0);
});

test('incomplete, nonphysical and out-of-range inputs cannot produce misleading calculations', () => {
  for (const invalid of ['', ' ', '265/70', '265/70R', 'abc', '-265/70R17', '999/70R17', '265/00R17',
    '265/101R17', '265/70R99', '20x12.5R20', '20x12.5R24', '33x0R15', '99x12.5R15', '33x21R15',
    '265/70R17 115T', '<script>alert(1)</script>', '33xInfinityR15', '265.123/70R17']) {
    const result = parseTireSize(invalid);
    assert.equal(result.ok, false, invalid);
    assert.ok(result.error.length > 0);
    assert.equal(result.tire, undefined);
  }
});

test('tire tools have an internal footer link, canonical page and sitemap entry', () => {
  const footer = readFileSync(new URL('../components/site-footer.tsx', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../app/tire-calculator/page.tsx', import.meta.url), 'utf8');
  const sitemap = readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  assert.ok(footer.includes('href="/tire-calculator"'));
  assert.ok(page.includes("path: '/tire-calculator'"));
  assert.ok(sitemap.includes('<loc>https://azsporttrucks.com/tire-calculator</loc>'));
});
