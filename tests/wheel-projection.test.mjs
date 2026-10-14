import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

const temporary = mkdtempSync(join(tmpdir(), 'azst-wheel-projection-'));
after(() => {
  assert.ok(resolve(temporary).startsWith(resolve(tmpdir()) + sep));
  rmSync(temporary, { recursive: true, force: true });
});
for (const name of ['manifest', 'studio', 'render', 'export']) {
  const source = readFileSync(new URL(`../lib/designer/${name}.ts`, import.meta.url), 'utf8');
  const output = stripTypeScriptTypes(source)
    .replaceAll("'./manifest'", "'./manifest.mjs'")
    .replaceAll("'./studio'", "'./studio.mjs'");
  writeFileSync(join(temporary, `${name}.mjs`), output);
}
const { vehicles, views, normalize, kmcWheelOptions, availableWheelIds } = await import(pathToFileURL(join(temporary, 'manifest.mjs')));
const { renderSvg } = await import(pathToFileURL(join(temporary, 'render.mjs')));
const { renderStudio } = await import(pathToFileURL(join(temporary, 'studio.mjs')));
const { embedArtwork } = await import(pathToFileURL(join(temporary, 'export.mjs')));
const affected = vehicles.filter(v => v.model === 'K10' && v.year >= 1981);

test('late K10 KMC quarter views use clean faces and retain paint and roof controls', () => {
  assert.equal(affected.length, 3);
  for (const vehicle of affected)
  for (const { id: wheelId } of kmcWheelOptions)
  for (const view of ['front-quarter', 'rear-quarter'])
  for (const paintMode of ['Solid', 'Two-tone'])
  for (const finish of ['Gloss', 'Satin'])
  for (const contrastRoof of [false, true]) {
    const c = normalize({ vehicleId: vehicle.id, wheelId, paintMode, finish, contrastRoof, color: '#205381', secondaryColor: '#eeeeee' });
    const pack = vehicle.views[view].studio;
    const svg = renderSvg(c, view, 'comparison');
    assert.ok(svg.includes(`href="${pack.root}/studio.png"`));
    assert.ok(svg.includes(`href="${vehicle.views.side.studio.wheelScenes[wheelId].stock}"`));
    assert.ok(!svg.includes(`href="${pack.wheelScenes[wheelId].stock}"`), 'Distorted baked scene must not remain behind the new face');
    assert.equal((svg.match(/<clipPath id="comparison-wheel-face-/g) || []).length, 2);
    assert.ok(svg.includes(`${pack.root}/paint-mask.png`));
    assert.equal(svg.includes('comparison-center-band-tint'), paintMode === 'Two-tone');
    assert.equal(/comparison-(?:cab|roof)-tint/.test(svg), contrastRoof);
  }
});

test('stock, Baja, side/front views and other vehicle families keep their existing scene selection', () => {
  for (const vehicle of vehicles) {
    const initial = normalize({ vehicleId: vehicle.id });
    for (const wheelId of availableWheelIds(vehicle, initial))
    for (const view of views) {
      const pack = vehicle.views[view].studio;
      if (!pack?.paintScene || pack.wheelFaceOverlays?.[wheelId]) continue;
      const c = normalize({ ...initial, wheelId });
      const root = pack.stanceRoots?.[c.stance] ?? pack.root;
      const expected = pack.wheelScenes?.[wheelId]?.[c.stance] ?? `${root}/studio.png`;
      const svg = renderSvg(c, view);
      assert.ok(svg.includes(`href="${expected}"`), `${vehicle.id}/${wheelId}/${view}`);
      assert.ok(!svg.includes('data-layer="wheel-faces"'));
    }
  }
});

test('wheel-face exports inline each source once and use unique clip IDs per preview', async () => {
  const vehicle = affected[0];
  const wheelId = kmcWheelOptions[0].id;
  const c = normalize({ vehicleId: vehicle.id, wheelId });
  const calls = new Map();
  const svg = renderSvg(c, 'rear-quarter', 'rear');
  const embedded = await embedArtwork(svg, async path => {
    calls.set(path, (calls.get(path) ?? 0) + 1);
    return 'data:image/png;base64,aGVsbG8=';
  });
  assert.ok(!embedded.includes('href="/designer/'));
  assert.equal(calls.get(vehicle.views.side.studio.wheelScenes[wheelId].stock), 1);
  const other = renderSvg(c, 'front-quarter', 'front');
  const ids = [...(svg + other).matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size);
});

test('a face projection is used only with its registered stance and closed-top scene', () => {
  const vehicle = affected[0];
  const wheelId = kmcWheelOptions[0].id;
  const pack = vehicle.views['rear-quarter'].studio;
  const c = normalize({ vehicleId: vehicle.id, wheelId });
  assert.ok(!renderStudio({ ...c, stance: 'drop2' }, pack, 'stance', 'rear-quarter', 'test').includes('data-layer="wheel-faces"'));
  const openPack = { ...pack, openTopRoot: '/designer/test-open' };
  assert.ok(!renderStudio({ ...c, roof: 'Top off' }, openPack, 'open', 'rear-quarter', 'test').includes('data-layer="wheel-faces"'));
});
