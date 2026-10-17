import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const temporary = mkdtempSync(join(tmpdir(), 'azst-titan7-'));
after(() => rmSync(temporary, { recursive: true, force: true }));
for (const name of ['manifest', 'render', 'studio', 'storage', 'export']) {
  const source = readFileSync(new URL(`../lib/designer/${name}.ts`, import.meta.url), 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText.replaceAll("'./manifest'", "'./manifest.mjs'").replaceAll("'./studio'", "'./studio.mjs'");
  writeFileSync(join(temporary, `${name}.mjs`), code);
}
const { vehicles, views, normalize, availableWheelIds, summary, titan7Packages } = await import(pathToFileURL(join(temporary, 'manifest.mjs')));
const { renderSvg } = await import(pathToFileURL(join(temporary, 'render.mjs')));
const { shareHash, readShare } = await import(pathToFileURL(join(temporary, 'storage.mjs')));
const { embedArtwork } = await import(pathToFileURL(join(temporary, 'export.mjs')));

test('both Titan7 packages are available only on the 1979 F-150', () => {
  for (const vehicle of vehicles) for (const wheelPackage of titan7Packages) {
    const c = normalize({ vehicleId: vehicle.id, wheelId: wheelPackage.id });
    const supported = vehicle.id === 'Ford-F-150-1979';
    assert.equal(availableWheelIds(vehicle, c).includes(wheelPackage.id), supported);
    assert.equal(c.wheelId, supported ? wheelPackage.id : 'street-temp');
    if (!supported) assert.doesNotMatch(summary(c).Tires, /Project|EVO 2\.0/);
  }
});

test('Titan7 package choices, tire descriptions, and paint survive a shared build', () => {
  for (const wheelPackage of titan7Packages) {
    const c = normalize({ vehicleId: 'Ford-F-150-1979', wheelId: wheelPackage.id,
      color: '#1682af', paintMode: 'Two-tone', secondaryColor: '#eeeeee',
      contrastRoof: true, roofColor: '#ffffff', view: 'rear-quarter' });
    assert.deepEqual(readShare(shareHash(c)), c);
    assert.equal(c.tire, wheelPackage.tire);
    assert.equal(summary(c).Wheels, wheelPackage.wheel);
    assert.equal(summary(c).Tires, wheelPackage.tire);
    const stock = normalize({ ...c, wheelId: 'street-temp' });
    assert.equal(summary(stock).Wheels, 'Stock');
    assert.doesNotMatch(summary(stock).Tires, /Project|EVO 2\.0/);
    assert.equal(stock.color, c.color);
  }
});

test('both packages have distinct four-view artwork and self-contained exports', async () => {
  for (const wheelPackage of titan7Packages) for (const view of views) {
    const c = normalize({ vehicleId: 'Ford-F-150-1979', wheelId: wheelPackage.id });
    const svg = renderSvg(c, view, 'titan7-test');
    const asset = `/designer/wheels/${wheelPackage.artwork}/${view}.webp`;
    assert.ok(svg.includes(`href="${asset}"`));
    assert.ok(svg.includes(`/ford-f150-1979-color-v1/${view}/paint-mask.png`));
    const bytes = readFileSync(new URL(`../public${asset}`, import.meta.url));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    const embedded = await embedArtwork(svg, async path => {
      const data = readFileSync(new URL(`../public${path}`, import.meta.url));
      return `data:image/${path.endsWith('.webp') ? 'webp' : 'png'};base64,${data.toString('base64')}`;
    });
    assert.doesNotMatch(embedded, /href="\/designer\//);
    assert.match(embedded, /data:image\/webp;base64,/);
  }
});
