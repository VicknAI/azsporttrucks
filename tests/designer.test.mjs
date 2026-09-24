import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
const temporary = mkdtempSync(join(tmpdir(), 'azst-designer-tests-'));
for (const name of [
  'manifest',
  'render',
  'storage',
  'quote',
  'studio',
  'export',
]) {
  const source = readFileSync(
    new URL(`../lib/designer/${name}.ts`, import.meta.url),
    'utf8',
  );
  const output = ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    })
    .outputText.replaceAll("'./manifest'", "'./manifest.mjs'")
    .replaceAll("'./studio'", "'./studio.mjs'");
  writeFileSync(join(temporary, `${name}.mjs`), output);
}
const {
  vehicles,
  views,
  normalize,
  resolveVehicleId,
  defaultConfiguration,
  allowedStances,
  wheelCatalog,
  summary,
} = await import(pathToFileURL(join(temporary, 'manifest.mjs')).href);
const { renderSvg } = await import(
  pathToFileURL(join(temporary, 'render.mjs')).href
);
test('all C10 and F-100 ride heights survive sharing and select matching color layers in every view', async () => {
  const { embedArtwork } = await import(pathToFileURL(join(temporary, 'export.mjs')).href);
  const { shareHash, readShare } = await import(pathToFileURL(join(temporary, 'storage.mjs')).href);
  const supported = vehicles.filter((v) => v.model === 'C10' || v.model === 'F-100');
  assert.equal(supported.length, 13);
  for (const vehicle of supported)
  for (const [stance, label] of [['stock', 'Stock'], ['drop2', '2″ lower'], ['drop4', '4″ lower'], ['frame', 'Laying frame']]) {
    const c = normalize({ vehicleId: vehicle.id, stance, color: '#3c6254', paintMode: 'Two-tone', secondaryColor: '#eeeeee', contrastRoof: true, roofColor: '#ffffff' });
    assert.equal(c.stance, stance);
    assert.equal(summary(c)['Ride height'], label);
    assert.deepEqual(readShare(shareHash(c)), c);
    for (const view of views) {
      const svg = renderSvg(c, view);
      const pack = vehicle.views[view].studio;
      const root = stance === 'stock' ? pack.root : pack.stanceRoots[stance];
      assert.ok(svg.includes(pack.wheelScenes?.['street-temp']?.[stance] ?? `${root}/studio.png`));
      assert.ok(svg.includes(`${root}/paint-mask.png`));
      assert.ok(svg.includes(`${root}/cab-mask.png`));
      const embedded = await embedArtwork(svg, async (path) => {
        const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
        assert.equal(bytes.readUInt32BE(16), 768);
        assert.equal(bytes.readUInt32BE(20), 512);
        return `data:image/png;base64,${bytes.toString('base64')}`;
      });
      assert.ok(!embedded.includes('/designer/'));
    }
  }
  assert.equal(normalize({ vehicleId: 'Chevrolet-C10-1971', stance: 'lift6' }).stance, 'stock');
  for (const vehicle of vehicles.filter((v) => v.model !== 'C10' && v.model !== 'F-100')) {
    assert.equal(normalize({ vehicleId: vehicle.id, stance: 'frame' }).stance, 'stock');
    assert.ok(views.every((view) => !vehicle.views[view].studio.stanceRoots));
  }
});
test('all C10 and F-100 wheel sizes survive sharing and preserve aligned paint at every stance and angle', async () => {
  const { shareHash, readShare } = await import(pathToFileURL(join(temporary, 'storage.mjs')).href);
  const { embedArtwork } = await import(pathToFileURL(join(temporary, 'export.mjs')).href);
  const supported = vehicles.filter((v) => v.model === 'C10' || v.model === 'F-100');
  assert.equal(supported.length, 13);
  for (const vehicle of supported)
  for (const wheelId of ['street-temp', 'torq-thrust-18', 'torq-thrust-20'])
  for (const stance of ['stock', 'drop2', 'drop4', 'frame']) {
    const c = normalize({ vehicleId: vehicle.id, wheelId, stance, color: '#3c6254', paintMode: 'Two-tone', secondaryColor: '#eeeeee', contrastRoof: true });
    assert.equal(c.wheelId, wheelId);
    assert.deepEqual(readShare(shareHash(c)), c);
    assert.ok(summary(c).Wheels.includes(wheelId === 'street-temp' ? 'Stock' : wheelId.slice(-2)));
    for (const view of views) {
      const pack = vehicle.views[view].studio;
      const root = pack.stanceRoots[stance] ?? pack.root;
      const svg = renderSvg(c, view);
      assert.ok(svg.includes(`${root}/paint-mask.png`));
      assert.ok(svg.includes(`${root}/cab-mask.png`));
      assert.ok(svg.includes(wheelId === 'street-temp'
        ? pack.wheelScenes['street-temp']?.[stance] ?? `${root}/studio.png`
        : pack.wheelScenes[wheelId][stance]));
      const embedded = await embedArtwork(svg, async (path) => {
        const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
        assert.equal(bytes.readUInt32BE(16), 768);
        assert.equal(bytes.readUInt32BE(20), 512);
        return `data:image/png;base64,${bytes.toString('base64')}`;
      });
      assert.ok(!embedded.includes('/designer/'));
    }
  }
  for (const other of vehicles.filter((v) => v.model !== 'C10' && v.model !== 'F-100')) {
    assert.equal(normalize({ vehicleId: other.id, wheelId: 'torq-thrust-20' }).wheelId, 'street-temp');
    assert.ok(views.every((view) => !other.views[view].studio.wheelScenes?.['torq-thrust-20']));
  }
});

test('Rocket Attack 18 and 20 inch C10 wheels retain size, paint, stance and four views in sharing and exports', async () => {
  const { shareHash, readShare } = await import(pathToFileURL(join(temporary, 'storage.mjs')).href);
  const { embedArtwork } = await import(pathToFileURL(join(temporary, 'export.mjs')).href);
  const supported = vehicles.filter((v) => v.model === 'C10');
  assert.equal(supported.length, 11);
  for (const vehicle of supported)
  for (const size of ['18', '20'])
  for (const stance of ['stock', 'drop2', 'drop4', 'frame']) {
    const wheelId = `rocket-attack-${size}`;
    const c = normalize({ vehicleId: vehicle.id, wheelId, stance, color: '#3c6254', paintMode: 'Two-tone', secondaryColor: '#eeeeee', contrastRoof: true });
    assert.equal(c.wheelId, wheelId);
    assert.deepEqual(readShare(shareHash(c)), c);
    assert.equal(summary(c).Wheels, `Rocket Racing Attack · Titanium/Machined · ${size}″`);
    for (const view of views) {
      const pack = vehicle.views[view].studio;
      const root = pack.stanceRoots[stance] ?? pack.root;
      const svg = renderSvg(c, view);
      assert.ok(svg.includes(pack.wheelScenes[wheelId][stance]));
      assert.ok(svg.includes(`${root}/paint-mask.png`));
      assert.ok(svg.includes(`${root}/cab-mask.png`));
      assert.ok(!svg.includes('-torq-v1'));
      const embedded = await embedArtwork(svg, async (path) => {
        const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
        assert.equal(bytes.readUInt32BE(16), 768);
        assert.equal(bytes.readUInt32BE(20), 512);
        return `data:image/png;base64,${bytes.toString('base64')}`;
      });
      assert.ok(!embedded.includes('/designer/'));
    }
  }
  for (const v of vehicles.filter((v) => v.model !== 'C10')) {
    assert.equal(normalize({ vehicleId: v.id, wheelId: 'rocket-attack-20' }).wheelId, 'street-temp');
    assert.ok(!v.views.side.studio.wheelScenes?.['rocket-attack-20']);
  }
});

test('available Baja and KMC wheels remain selected across 4WD years, paint layouts, roof states and exports', async () => {
  const { shareHash, readShare } = await import(pathToFileURL(join(temporary, 'storage.mjs')).href);
  const { embedArtwork } = await import(pathToFileURL(join(temporary, 'export.mjs')).href);
  const wheelExpectations = {
    'baja-polished': ['American Racing Baja · Polished', '-baja-v1/'],
    'baja-black': ['American Racing Baja - Black', '-baja-black-v1/'],
    'kmc-impact-monoblock-machined': ['KMC Impact Forged Monoblock - Raw Machined', '-kmc-impact-monoblock-v1/'],
    'kmc-impact-beadlock-machined': ['KMC Impact Forged Beadlock - Raw Machined', '-kmc-impact-beadlock-v1/'],
  };
  const supported = vehicles.filter((v) => Object.keys(wheelExpectations).some((id) => v.views.side.studio?.wheelScenes?.[id]));
  assert.equal(supported.filter((v) => v.model !== 'Bronco').length, 17);
  for (const vehicle of supported.filter((v) => v.model !== 'Bronco')) {
    assert.ok(Object.keys(wheelExpectations).every((id) => vehicle.views.side.studio.wheelScenes[id]));
  }
  for (const v of supported)
  for (const [wheelId, [label, folder]] of Object.entries(wheelExpectations).filter(([id]) => v.views.side.studio.wheelScenes[id]))
  for (const roof of v.roofOptions.length ? v.roofOptions : ['Not applicable'])
  for (const paintMode of ['Solid', 'Two-tone']) {
    const c = normalize({ vehicleId: v.id, wheelId, roof, paintMode, color: '#3c6254', secondaryColor: '#eeeeee', stance: 'lift6' });
    assert.equal(c.wheelId, wheelId);
    assert.equal(c.stance, 'stock');
    assert.equal(c.paintMode, paintMode);
    assert.deepEqual(readShare(shareHash(c)), c);
    assert.equal(summary(c).Wheels, label);
    for (const view of views) {
      const pack = v.views[view].studio;
      const root = roof === 'Top off' ? pack.openTopRoot : pack.root;
      const scenes = roof === 'Top off' ? pack.openTopWheelScenes : pack.wheelScenes;
      const version = v.year === 1973 ? 'v4' : [1975, 1977].includes(v.year) ? 'v2' : 'v1';
      const expectedFolder = folder.replace('-v1/', `-${version}/`);
      assert.ok(scenes[wheelId].stock.includes(expectedFolder));
      const svg = renderSvg(c, view);
      assert.ok(svg.includes(scenes[wheelId].stock));
      assert.ok(svg.includes(`${root}/paint-mask.png`));
      const stock = renderSvg(normalize({ ...c, wheelId: 'street-temp' }), view);
      assert.ok(stock.includes(`${root}/studio.png`));
      assert.ok(!stock.includes('-baja-v'));
      assert.ok(!stock.includes('-baja-black-v'));
      assert.ok(!stock.includes('-kmc-impact-'));
      const embedded = await embedArtwork(svg, async (path) => {
        const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
        assert.equal(bytes.readUInt32BE(16), 768);
        assert.equal(bytes.readUInt32BE(20), 512);
        return `data:image/png;base64,${bytes.toString('base64')}`;
      });
      assert.ok(!embedded.includes('/designer/'));
    }
  }
  for (const v of vehicles.filter((v) => !Object.keys(wheelExpectations).some((id) => v.views.side.studio?.wheelScenes?.[id]))) {
    for (const wheelId of Object.keys(wheelExpectations)) {
      assert.equal(normalize({ vehicleId: v.id, wheelId }).wheelId, 'street-temp');
    }
  }
});
test('1967 and 1971–1972 C10 have complete, distinct studio packs with valid PNG assets', () => {
  const roots = new Set();
  for (const id of ['Chevrolet-C10-1967', 'Chevrolet-C10-1971-1972']) {
    const vehicle = vehicles.find((v) => v.id === id);
    assert.ok(vehicle);
    for (const view of views) {
      const pack = vehicle.views[view].studio;
      assert.ok(pack);
      roots.add(pack.root);
      for (const name of pack.paintScene
        ? [
            'studio.png',
            'paint-texture.png',
            'paint-mask.png',
            'center-band-mask.png',
            'cab-mask.png',
            'roof-mask.png',
          ]
        : [
            'body.png',
            ...[
              'paint',
              'secondary',
              'center-band',
              'roof',
              'cab',
              'grille',
              'bumper',
            ].map((n) => `${n}-mask.png`),
            ...pack.wheels.map((w) => w.file),
          ]) {
        const bytes = readFileSync(
          new URL(`../public${pack.root}/${name}`, import.meta.url),
        );
        assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      }
      assert.ok(pack.viewport[2] > 0 && pack.viewport[3] > 0);
    }
  }
  assert.equal(roots.size, 8);
});
const { shareHash, readShare } = await import(
  pathToFileURL(join(temporary, 'storage.mjs')).href
);
const { prepareQuoteEmail, quoteRecipient } = await import(
  pathToFileURL(join(temporary, 'quote.mjs')).href
);
const { embedArtwork } = await import(
  pathToFileURL(join(temporary, 'export.mjs')).href
);
process.on('exit', () => {
  const resolved = resolve(temporary);
  const inside = relative(resolve(tmpdir()), resolved);
  if (
    inside &&
    !inside.startsWith('..') &&
    inside.startsWith('azst-designer-tests-')
  )
    rmSync(resolved, { recursive: true, force: true });
});
test('exact years and pickup year groups have distinct manifests and four anchor packs', () => {
  assert.equal(vehicles.length, 31);
  assert.equal(new Set(vehicles.map((v) => v.id)).size, 31);
  for (const [model, years] of [
    ['C10', [1967, 1968, 1980]],
    ['K10', [1967, 1968, 1980]],
    ['K5', [1969, 1970, 1971, 1972]],
    ['F-100', [1978, 1979]],
    ['F-150', [1978, 1979]],
    ['Bronco', [1979]],
  ])
    assert.deepEqual(
      vehicles.filter((v) => v.model === model && !v.yearEnd).map((v) => v.year),
      years,
    );
  for (const vehicle of vehicles)
    for (const view of views) {
      assert.ok(vehicle.views[view].assetRoot.includes(String(vehicle.year)));
      assert.ok(vehicle.views[view].anchors.length >= 2);
    }
});
test('incompatible ride heights are rejected across every model', () => {
  for (const vehicle of vehicles) {
    for (const direction of vehicle.directions) {
      const c = normalize({
        ...defaultConfiguration(vehicle),
        direction,
        stance: direction === 'Lowered' ? 'lift6' : 'drop6',
      });
      assert.equal(c.stance, 'stock');
      assert.equal(
        allowedStances(direction).length,
        direction === 'Lowered' ? 5 : 3,
      );
    }
  }
});
test('legacy shared customization cannot change fixed reference hardware or stance', () => {
  for (const vehicle of vehicles) {
    const base = normalize(defaultConfiguration(vehicle));
    const legacy = normalize({
      ...base,
      stance: vehicle.directions[0] === 'Lowered' ? 'drop6' : 'lift6',
      wheelId: 'offroad-temp',
      tire: 'Mud-terrain',
      trimMode: 'Customize It',
      trim: {
        ...base.trim,
        grille: 'Black',
        bumper: 'Removed',
        sideMolding: 'Removed',
      },
    });
    assert.deepEqual(legacy, base);
    assert.deepEqual(readShare(shareHash(legacy)), base);
    for (const view of views)
      assert.equal(renderSvg(base, view), renderSvg(legacy, view));
  }
});
test('all configurations retain selections in all four distinct views', () => {
  for (const vehicle of vehicles) {
    const c = normalize({
      ...defaultConfiguration(vehicle),
      paintMode: 'Two-tone',
      color: '#123abc',
      secondaryColor: '#fedcba',
      finish: 'Satin',
      trimMode: 'Customize It',
      trim: {
        grille: 'Black',
        headlights: 'Model-year placeholder',
        sideMolding: 'Removed',
        badges: 'Removed',
        tailgate: 'Removed',
        bumper: 'Black',
      },
    });
    const before = JSON.stringify(c);
    const outputs = views.map((v) => renderSvg(c, v, v));
    assert.equal(new Set(outputs).size, 4);
    assert.equal(JSON.stringify(c), before);
    for (const [index, svg] of outputs.entries()) {
      if (vehicle.views[views[index]].studio?.fixedAppearance) {
        assert.equal(
          svg,
          renderSvg({ ...c, color: '#ffffff' }, views[index], views[index]),
        );
        assert.ok(svg.includes('data-layer="reference-artwork"'));
        continue;
      }
      if (vehicle.views[views[index]].studio) {
        assert.notEqual(
          svg,
          renderSvg({ ...c, color: '#ffffff' }, views[index], views[index]),
        );
        const secondaryChanged = renderSvg(
          { ...c, secondaryColor: '#ffffff' }, views[index], views[index],
        );
        if (vehicle.views[views[index]].studio.solidOnly) assert.equal(svg, secondaryChanged);
        else assert.notEqual(svg, secondaryChanged);
      } else {
        assert.ok(svg.includes('#123abc'));
        assert.ok(svg.includes('#fedcba'));
      }
      assert.ok(svg.includes('data-layer="roof"'));
    }
  }
});
test('shared data is normalized and cannot inject artwork or extra contact fields', () => {
  const c = normalize({
    vehicleId: 'no-such-truck',
    color: '"><script>alert(1)</script>',
    name: 'Private name',
    trimMode: 'Customize It',
    trim: { grille: '<img>' },
  });
  assert.equal(c.color, '#63aba6');
  assert.equal('name' in c, false);
  assert.equal(c.trim.grille, 'Chrome');
  assert.deepEqual(readShare(shareHash(c)), c);
  assert.throws(() => readShare('#build=%broken'));
});
test('factory mode applies package and never invents verified products', () => {
  const c = normalize({
    trimMode: 'Match My Truck',
    trim: { grille: 'Black' },
  });
  assert.equal(c.trim.grille, 'Chrome');
  for (const v of vehicles)
    assert.ok(v.packages.every((p) => p.verified === false));
  for (const w of wheelCatalog) {
    assert.equal(w.sku, null);
    assert.equal(w.diameter, null);
    assert.equal(w.productUrl, null);
  }
});
test('K5 top-off has a distinct interior state and roof color choices', () => {
  const v = vehicles.find((v) => v.model === 'K5');
  const c = defaultConfiguration(v);
  const on = renderSvg({ ...c, roof: 'White top' }, 'side');
  const off = renderSvg({ ...c, roof: 'Top off' }, 'side');
  assert.notEqual(on, off);
  assert.ok(off.includes('/top-off/side/studio.png'));
  assert.ok(on.includes('/top-on/side/studio.png'));
  assert.notEqual(renderSvg({ ...c, roof: 'Black top' }, 'side'), on);
});

test('quote email retains complete selections and long customer messages without adding recipients', () => {
  const configuration = defaultConfiguration(
    vehicles.find((v) => v.model === 'F-150' && v.year === 1979),
  );
  const description =
    'Paint & suspension = priority.\n' + 'Detailed project notes. '.repeat(150);
  const result = prepareQuoteEmail({
    buildNumber: 'AZST-test',
    configuration,
    photoCount: 2,
    contact: { name: 'Test & Example', email: 'test@example.com', description },
  });
  assert.ok(result.subject.includes('1979 Ford F-150'));
  assert.ok(result.body.includes(description));
  assert.ok(result.body.includes('2 truck photos separately'));
  assert.ok(result.body.includes(configuration.color));
  const mail = new URL(result.href);
  assert.equal(mail.pathname, quoteRecipient);
  assert.equal(mail.searchParams.has('bcc'), false);
  assert.equal(mail.searchParams.has('body'), false);
  assert.ok(result.href.length < 1800);
});

test('downloaded artwork is self-contained and rejects invalid image responses', async () => {
  const input =
    '<svg><image href="/designer/study/body.png"/><image href="/designer/study/body.png"/></svg>';
  let calls = 0;
  const output = await embedArtwork(input, async () => {
    calls++;
    return 'data:image/png;base64,AAAA';
  });
  assert.equal(calls, 1);
  assert.equal(output.includes('/designer/'), false);
  assert.equal((output.match(/data:image\/png/g) || []).length, 2);
  await assert.rejects(
    embedArtwork(input, async () => '<html>Not found</html>'),
  );
  await assert.rejects(
    embedArtwork(
      '<image href="/designer/../private.png"/>',
      async () => 'data:image/png;base64,AAAA',
    ),
  );
});

test('all K5 years retain colors and embed the paired studio artwork offline', async () => {
  for (const year of [1969, 1970, 1971, 1972]) {
  for (const roof of ['White top', 'Black top', 'Body-color top', 'Top off']) {
    const c = normalize({ vehicleId: `Chevrolet-K5-${year}`, roof, color: '#386c47', secondaryColor: '#e8dfca', paintMode: 'Two-tone' });
    assert.equal(c.roof, roof);
    assert.equal(c.twoToneStyle, 'Center band');
    assert.deepEqual(readShare(shareHash(c)), c);
    for (const view of views) {
      const svg = renderSvg(c, view);
      assert.ok(svg.includes(`chevrolet-k5-${year <= 1970 ? 1970 : 1972}-color-v`));
      assert.ok(svg.includes(`/${roof === 'Top off' ? 'top-off' : 'top-on'}/${view}/studio.png`));
      assert.notEqual(svg, renderSvg({ ...c, color: '#000000' }, view));
      assert.notEqual(svg, renderSvg({ ...c, roof: roof === 'Top off' ? 'White top' : 'Top off' }, view));
      const embedded = await embedArtwork(svg, async (path) => {
        const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
        assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
        assert.equal(bytes.readUInt32BE(16), 768);
        assert.equal(bytes.readUInt32BE(20), 512);
        return `data:image/png;base64,${bytes.toString('base64')}`;
      });
      assert.ok(!embedded.includes('/designer/'));
    }
  }
  }
});

test('1979 Bronco rear hardtops retain paint and roof state in drafts, shares and every exported view', async () => {
  const { readDraft, draftKey } = await import(pathToFileURL(join(temporary, 'storage.mjs')).href);
  const bronco = vehicles.find((vehicle) => vehicle.id === 'Ford-Bronco-1979');
  assert.ok(bronco);
  assert.equal(vehicles.filter((vehicle) => vehicle.manufacturer === 'Ford').length, 5);
  assert.equal(vehicles.filter((vehicle) => vehicle.model === 'C10').length, 11);
  assert.deepEqual(vehicles.filter((vehicle) => vehicle.model === 'Bronco').map((vehicle) => vehicle.year), [1979]);
  assert.deepEqual(bronco.directions, ['Lifted']);
  assert.deepEqual(bronco.roofOptions, ['White top', 'Black top', 'Body-color top', 'Top off']);
  assert.equal(bronco.contrastingRoof, false);
  const initial = defaultConfiguration(bronco);
  assert.equal(initial.paintMode, 'Two-tone');
  assert.equal(initial.color, '#1f4e73');
  assert.equal(initial.secondaryColor, '#e5e7e7');
  assert.equal(initial.roof, 'White top');
  assert.equal(initial.contrastRoof, false);
  assert.equal(summary(initial)['Ride height'], 'As pictured (lifted)');
  assert.equal(summary(initial).Interior, 'Black vinyl upholstery');
  assert.equal(normalize({ ...initial, roof: 'Unsupported top' }).roof, 'White top');
  const invalid = normalize({ ...initial, direction: 'Lowered', stance: 'frame', wheelId: 'torq-thrust-20', contrastRoof: true, cabPaint: 'Roof and pillars' });
  assert.equal(invalid.direction, 'Lifted');
  assert.equal(invalid.stance, 'stock');
  assert.equal(invalid.wheelId, 'street-temp');
  assert.equal(invalid.contrastRoof, false);
  assert.equal(invalid.cabPaint, 'Roof only');
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let savedDraft;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem(key) { assert.equal(key, draftKey); return savedDraft; },
  } });
  try {
    for (const roof of bronco.roofOptions)
    for (const paintMode of ['Solid', 'Two-tone'])
    for (const finish of ['Gloss', 'Satin']) {
      const c = normalize({ ...initial, roof, paintMode, finish, color: '#386c47', secondaryColor: '#e8dfca' });
      assert.equal(c.roof, roof);
      assert.equal(c.paintMode, paintMode);
      assert.equal(c.finish, finish);
      assert.deepEqual(readShare(shareHash(c)), c);
      savedDraft = JSON.stringify(c);
      assert.deepEqual(readDraft(), c);
      assert.equal(summary(c).Vehicle, '1979 Ford Bronco');
      assert.equal(summary(c)['Rear hardtop'], roof);
      assert.equal(summary(c)['Front cab roof'], 'Body color (fixed steel roof)');
      assert.equal(summary(c)['Cab paint coverage'], 'Body color');
      assert.ok(!Object.hasOwn(summary(c), 'K5 roof'));
      for (const view of views) {
        const pack = bronco.views[view].studio;
        assert.equal(pack.stanceRoots, undefined);
        assert.equal(pack.root, `/designer/studio/ford-bronco-1979-color-v${view === 'front' ? 2 : 3}/top-on/${view}`);
        assert.equal(pack.openTopRoot, `/designer/studio/ford-bronco-1979-color-v2/top-off/${view}`);
        const root = roof === 'Top off' ? pack.openTopRoot : pack.root;
        const svg = renderSvg(c, view);
        assert.ok(svg.includes(`${root}/studio.png`));
        assert.ok(svg.includes(`${root}/roof-mask.png`));
        assert.equal(Boolean(pack.detailOverlay), view !== 'front');
        if (pack.detailOverlay) {
          assert.equal(pack.detailOverlay.file, '/designer/studio/ford-bronco-1979-color-v2/wheel-details.png');
          assert.ok(svg.includes(`href="${pack.detailOverlay.file}"`));
          assert.ok(svg.indexOf('data-layer="detail-overlay"') > svg.indexOf('data-layer="roof"'));
          const wheelDetails = (image) => image.slice(image.indexOf('<g data-layer="detail-overlay">'));
          assert.equal(wheelDetails(svg), wheelDetails(renderSvg({ ...c, color: '#dd5500', secondaryColor: '#111111', finish: finish === 'Gloss' ? 'Satin' : 'Gloss' }, view)));
          assert.equal(wheelDetails(svg), wheelDetails(renderSvg({ ...c, roof: roof === 'Top off' ? 'White top' : 'Top off' }, view)));
        } else assert.ok(!svg.includes('data-layer="detail-overlay"'));
        assert.ok(!svg.includes('ford-f150-') && !svg.includes('ford-f100-') && !svg.includes('chevrolet-k5-'));
        assert.notEqual(svg, renderSvg({ ...c, roof: roof === 'Top off' ? 'White top' : 'Top off' }, view));
        assert.equal(svg, renderSvg({ ...c, contrastRoof: true, roofColor: '#ff00ff', cabPaint: 'Roof and pillars' }, view));
        assert.notEqual(svg, renderSvg({ ...c, color: '#dd5500' }, view));
        if (paintMode === 'Two-tone') assert.notEqual(svg, renderSvg({ ...c, secondaryColor: '#111111' }, view));
        else assert.equal(svg, renderSvg({ ...c, secondaryColor: '#111111' }, view));
        const loaded = [];
        const embedded = await embedArtwork(svg, async (path) => {
          loaded.push(path);
          const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
          assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
          const overlay = path === pack.detailOverlay?.file;
          assert.equal(bytes.readUInt32BE(16), overlay ? 1536 : 768);
          assert.equal(bytes.readUInt32BE(20), overlay ? 1024 : 512);
          return `data:image/png;base64,${bytes.toString('base64')}`;
        });
        assert.ok(!embedded.includes('/designer/'));
        if (pack.detailOverlay) assert.ok(loaded.includes(pack.detailOverlay.file));
      }
    }
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else delete globalThis.localStorage;
  }
});

test('1979 F-100 finishes preserve two-tone and cab colors across shares and exports', async () => {
  const vehicle = vehicles.find((v) => v.id === 'Ford-F-100-1979');
  assert.equal(defaultConfiguration(vehicle).paintMode, 'Solid');
  const c = normalize({ vehicleId: vehicle.id, color: '#226644', secondaryColor: '#ddeeff', roofColor: '#eeddaa', finish: 'Satin', paintMode: 'Two-tone', contrastRoof: true });
  assert.equal(c.paintMode, 'Two-tone');
  assert.equal(c.contrastRoof, true);
  assert.equal(c.cabPaint, 'Roof and pillars');
  assert.equal(c.twoToneStyle, 'Center band');
  assert.equal(c.color, '#226644');
  assert.deepEqual(readShare(shareHash(c)), c);
  for (const view of views) {
    const svg = renderSvg(c, view);
    assert.ok(svg.includes('/ford-f100-1979-color-v1/'));
    assert.notEqual(svg, renderSvg({ ...c, color: '#ff0000' }, view));
    assert.notEqual(svg, renderSvg({ ...c, secondaryColor: '#000000' }, view));
    assert.notEqual(svg, renderSvg({ ...c, roofColor: '#000000' }, view));
    const solid = normalize({ ...c, paintMode: 'Solid', contrastRoof: false });
    assert.equal(solid.paintMode, 'Solid');
    assert.equal(solid.contrastRoof, false);
    assert.equal(renderSvg(solid, view), renderSvg({ ...solid, secondaryColor: '#000000', roofColor: '#000000' }, view));
    for (const file of ['studio.png', 'paint-texture.png', 'paint-mask.png']) {
      const previous = readFileSync(new URL(`../public/designer/studio/ford-f100-1979-solid-v2/${view}/${file}`, import.meta.url));
      const current = readFileSync(new URL(`../public/designer/studio/ford-f100-1979-color-v1/${view}/${file}`, import.meta.url));
      assert.deepEqual(current, previous, `Existing solid appearance must be preserved: ${view}/${file}`);
    }
    const embedded = await embedArtwork(svg, async (path) => {
      const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
      assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      assert.equal(bytes.readUInt32BE(16), 768);
      assert.equal(bytes.readUInt32BE(20), 512);
      return `data:image/png;base64,${bytes.toString('base64')}`;
    });
    assert.ok(!embedded.includes('/designer/'));
  }
});

test('1979 F-150 finishes preserve two-tone and cab colors without changing approved solid artwork', async () => {
  const vehicle = vehicles.find((v) => v.id === 'Ford-F-150-1979');
  const initial = defaultConfiguration(vehicle);
  assert.equal(initial.paintMode, 'Solid');
  assert.equal(initial.contrastRoof, false);
  assert.equal(initial.color, '#1678ba');
  const c = normalize({ vehicleId: vehicle.id, color: '#226644', secondaryColor: '#ddeeff', roofColor: '#eeddaa', finish: 'Satin', paintMode: 'Two-tone', contrastRoof: true });
  assert.equal(c.paintMode, 'Two-tone');
  assert.equal(c.contrastRoof, true);
  assert.equal(c.cabPaint, 'Roof and pillars');
  assert.equal(c.twoToneStyle, 'Center band');
  assert.equal(c.color, '#226644');
  assert.equal(c.finish, 'Satin');
  assert.equal(c.secondaryColor, '#ddeeff');
  assert.equal(c.roofColor, '#eeddaa');
  assert.deepEqual(readShare(shareHash(c)), c);
  const sources = new Set();
  for (const view of views) {
    const svg = renderSvg(c, view);
    assert.ok(svg.includes('/ford-f150-1979-color-v1/'));
    assert.notEqual(svg, renderSvg({ ...c, color: '#ff0000' }, view));
    assert.notEqual(svg, renderSvg({ ...c, finish: 'Gloss' }, view));
    assert.notEqual(svg, renderSvg({ ...c, secondaryColor: '#ff00ff' }, view));
    assert.notEqual(svg, renderSvg({ ...c, roofColor: '#ffff00' }, view));
    const solid = normalize({ ...c, paintMode: 'Solid', contrastRoof: false });
    assert.equal(solid.paintMode, 'Solid');
    assert.equal(solid.contrastRoof, false);
    assert.equal(renderSvg(solid, view), renderSvg({ ...solid, secondaryColor: '#ff00ff', roofColor: '#ffff00' }, view));
    for (const file of ['studio.png', 'paint-texture.png', 'paint-mask.png']) {
      const previous = readFileSync(new URL(`../public/designer/studio/ford-f150-1979-solid-v1/${view}/${file}`, import.meta.url));
      const current = readFileSync(new URL(`../public/designer/studio/ford-f150-1979-color-v1/${view}/${file}`, import.meta.url));
      assert.deepEqual(current, previous, `Existing solid appearance must be preserved: ${view}/${file}`);
    }
    const embedded = await embedArtwork(svg, async (path) => {
      const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
      assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
      assert.equal(bytes.readUInt32BE(16), 768);
      assert.equal(bytes.readUInt32BE(20), 512);
      if (path.endsWith('/studio.png')) sources.add(bytes.toString('base64'));
      return `data:image/png;base64,${bytes.toString('base64')}`;
    });
    assert.ok(!embedded.includes('/designer/'));
  }
  assert.equal(sources.size, 4);
});

test('square-body K10 groups retain their own paint, artwork and summaries', () => {
  for (const [first, last, version, color, contrastRoof] of [
    [1973, 1974, 'v4', '#237cae', true],
    [1975, 1976, 'v2', '#d34b20', false],
    [1977, 1979, 'v2', '#c4a574', true],
    [1980, undefined, 'v1', '#1678ba', false],
    [1981, 1982, 'v1', '#e5e7e7', false],
    [1983, 1984, 'v1', '#263d58', false],
    [1985, 1987, 'v1', '#17191c', false],
  ]) {
    const years = last ? `${first}-${last}` : `${first}`;
    const label = last ? `${first}–${last}` : `${first}`;
    const group = vehicles.find((v) => v.id === `Chevrolet-K10-${years}`);
    assert.equal(group.label, `${label} K10`);
    assert.equal(group.yearEnd, last);
    if (last) assert.ok(!vehicles.some((v) => [`Chevrolet-K10-${first}`, `Chevrolet-K10-${last}`].includes(v.id)));
    const initial = defaultConfiguration(group);
    assert.equal(initial.paintMode, [1980, 1981, 1985].includes(first) ? 'Solid' : 'Two-tone');
    assert.equal(initial.color, color);
    assert.equal(initial.contrastRoof, contrastRoof);
    if (first === 1977) {
      assert.equal(initial.secondaryColor, '#f1eee5');
      assert.equal(initial.roofColor, initial.secondaryColor);
      assert.equal(group.referencePaint.label, 'Tan / white reference look');
    }
    if (first === 1983) {
      assert.equal(initial.secondaryColor, '#b8bec5');
      assert.equal(group.referencePaint.label, 'Navy / silver reference look');
    }
    if (first === 1985) {
      assert.equal(group.referencePaint.label, 'Black reference look');
      assert.equal(group.referencePaint.paintMode, 'Solid');
      assert.equal(initial.secondaryColor, '#b8bec5');
    }
    for (const paintMode of ['Solid', 'Two-tone']) {
      const c = normalize({ ...initial, paintMode, contrastRoof: paintMode === 'Two-tone', color: '#3c6254', secondaryColor: '#f1eee5' });
      assert.deepEqual(readShare(shareHash(c)), c);
      assert.equal(summary(c).Vehicle, `${label} Chevrolet K10`);
      if (c.contrastRoof) assert.equal(summary(c)['Cab paint coverage'], 'Roof and cab back; door window frames stay body color');
      for (const view of views) {
        const svg = renderSvg(c, view);
        assert.ok(svg.includes(`/chevrolet-k10-${years}-color-${version}/`));
        if (paintMode === 'Solid') assert.equal(svg, renderSvg({ ...c, secondaryColor: '#ff00ff', roofColor: '#ff00ff' }, view));
        else assert.notEqual(svg, renderSvg({ ...c, secondaryColor: '#ff00ff' }, view));
      }
    }
  }
});

test('square-body C10 groups use independent 2WD art and keep their defaults, paint and cab coverage', () => {
  const groups = [
    ['1973-1974', 1973, 1974, '#237cae', 'Two-tone', true],
    ['1975-1976', 1975, 1976, '#d34b20', 'Two-tone', false],
    ['1977-1979', 1977, 1979, '#c4a574', 'Two-tone', true],
    ['1980', 1980, undefined, '#1678ba', 'Solid', false],
    ['1981-1982', 1981, 1982, '#e5e7e7', 'Solid', false],
    ['1983-1984', 1983, 1984, '#263d58', 'Two-tone', false],
    ['1985-1987', 1985, 1987, '#17191c', 'Solid', false],
  ];
  assert.deepEqual(vehicles.filter((v) => v.model === 'C10' && v.year >= 1973).map((v) => v.id),
    groups.map(([years]) => `Chevrolet-C10-${years}`));
  for (const [years, first, last, color, paintMode, contrastRoof] of groups) {
    const vehicle = vehicles.find((v) => v.id === `Chevrolet-C10-${years}`);
    const source = vehicles.find((v) => v.id === `Chevrolet-K10-${years}`);
    assert.equal(vehicle.year, first);
    assert.equal(vehicle.yearEnd, last);
    assert.equal(vehicle.label, `${years.replace('-', '–')} C10`);
    assert.deepEqual(vehicle.directions, ['Lowered']);
    if (last) assert.ok(!vehicles.some((v) => [`Chevrolet-C10-${first}`, `Chevrolet-C10-${last}`].includes(v.id)));
    const initial = defaultConfiguration(vehicle);
    assert.equal(initial.color, color);
    assert.equal(initial.paintMode, paintMode);
    assert.equal(initial.contrastRoof, contrastRoof);
    assert.equal(initial.stance, 'stock');
    assert.equal(initial.wheelId, 'street-temp');
    assert.equal(summary(initial)['Ride height'], 'Stock');
    assert.equal(summary(initial).Tires, 'Street tires; size to be discussed');
    assert.equal(normalize({ ...initial, direction: 'Lifted', stance: 'lift6', wheelId: 'baja-polished' }).direction, 'Lowered');
    assert.equal(normalize({ ...initial, stance: 'lift6', wheelId: 'baja-polished' }).stance, 'stock');
    assert.equal(normalize({ ...initial, wheelId: 'baja-polished' }).wheelId, 'street-temp');
    for (const view of views) {
      const pack = vehicle.views[view].studio;
      assert.notEqual(vehicle.views[view], source.views[view]);
      assert.notEqual(pack, source.views[view].studio);
      assert.equal(pack.root, `/designer/studio/chevrolet-c10-${years}-color-v1/${view}`);
      assert.equal(pack.cabMaskExtension, undefined, 'C10 cab corrections are baked into its stance-specific masks');
      for (const [stance, root] of Object.entries(pack.stanceRoots)) {
        assert.equal(root, `/designer/studio/chevrolet-c10-${years}-stance-v1/${stance}/${view}`);
      }
      for (const stance of ['stock', 'drop2', 'drop4', 'frame']) {
        const scene = `/designer/wheels/chevrolet-c10-${years}-stock-rally-v1/${stance}/${view}.png`;
        assert.equal(pack.wheelScenes['street-temp'][stance], scene);
        const stock = normalize({ ...initial, stance });
        assert.deepEqual(readShare(shareHash(stock)), stock);
        const svg = renderSvg(stock, view);
        assert.ok(svg.includes(scene));
        assert.ok(svg.includes(`${pack.stanceRoots[stance] ?? pack.root}/paint-mask.png`));
        assert.ok(!svg.includes('/studio.png'));
        for (const [wheelId, folder] of [['torq-thrust', 'torq'], ['rocket-attack', 'rocket-attack']])
        for (const size of ['18', '20'])
          assert.equal(pack.wheelScenes[`${wheelId}-${size}`][stance],
            `/designer/wheels/chevrolet-c10-${years}-${folder}-v1/${size}/${stance}/${view}.png`);
      }
      const solid = normalize({ ...initial, paintMode: 'Solid', contrastRoof: false });
      assert.equal(renderSvg(solid, view), renderSvg({ ...solid, secondaryColor: '#aabbcc', roofColor: '#123456' }, view));
      const contrast = normalize({ ...initial, color: '#325577', paintMode: 'Two-tone', secondaryColor: '#f1eee5', contrastRoof: true, roofColor: '#eeeeee' });
      assert.deepEqual(readShare(shareHash(contrast)), contrast);
      assert.equal(summary(contrast)['Cab paint coverage'], 'Roof and cab back; door window frames stay body color');
      const svg = renderSvg(contrast, view);
      assert.ok(svg.includes(`${pack.root}/paint-mask.png`));
      assert.ok(!svg.includes('chevrolet-k10-'));
      assert.ok(!svg.includes('c10-1971-'));
      assert.notEqual(svg, renderSvg({ ...contrast, color: '#aa6600' }, view));
      assert.notEqual(svg, renderSvg({ ...contrast, secondaryColor: '#222222' }, view));
      assert.notEqual(svg, renderSvg({ ...contrast, roofColor: '#222222' }, view));
    }
  }
  for (const vehicle of vehicles.filter((v) => v.model !== 'C10' || v.year < 1973))
    for (const view of views) assert.equal(vehicle.views[view].studio.wheelScenes?.['street-temp'], undefined);
});

test('paired C10 years migrate legacy builds without changing paint, wheels, heights or exported artwork', async () => {
  const { readDraft, draftKey } = await import(pathToFileURL(join(temporary, 'storage.mjs')).href);
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let savedDraft;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem(key) { assert.equal(key, draftKey); return savedDraft; },
  } });
  try {
    for (const firstYear of [1969, 1971]) {
      const groupId = `Chevrolet-C10-${firstYear}-${firstYear + 1}`;
      const vehicle = vehicles.find((v) => v.id === groupId);
      assert.ok(vehicle);
      assert.equal(vehicle.yearEnd, firstYear + 1);
      const sourceYear = firstYear === 1969 ? 1970 : 1971;
      const colorVersion = firstYear === 1969 ? 4 : 6;
      for (const inputId of [`Chevrolet-C10-${firstYear}`, `Chevrolet-C10-${firstYear + 1}`, groupId]) {
        assert.equal(resolveVehicleId(inputId), groupId);
        if (inputId !== groupId) assert.ok(!vehicles.some((v) => v.id === inputId));
        for (const wheelId of ['street-temp', ...Object.keys(vehicle.views.side.studio.wheelScenes)])
        for (const stance of ['stock', 'drop2', 'drop4', 'frame'])
        for (const paintMode of ['Solid', 'Two-tone']) {
          const selection = {
            vehicleId: inputId, color: '#38694b', secondaryColor: '#f2eee3',
            roofColor: '#ddbb88', contrastRoof: true, cabPaint: 'Roof and pillars',
            finish: 'Satin', paintMode, twoToneStyle: 'Center band', wheelId, stance,
            view: 'rear-quarter',
          };
          const c = readShare('#build=' + encodeURIComponent(JSON.stringify(selection)));
          assert.equal(c.vehicleId, groupId);
          for (const [key, value] of Object.entries(selection)) if (key !== 'vehicleId') assert.equal(c[key], value);
          savedDraft = JSON.stringify(selection);
          assert.deepEqual(readDraft(), c);
          assert.deepEqual(readShare(shareHash(c)), c);
          assert.equal(summary(c).Vehicle, `${firstYear}–${firstYear + 1} Chevrolet C10`);
          for (const view of views) {
            const svg = renderSvg(c, view);
            const root = `/designer/studio/chevrolet-c10-${sourceYear}-${stance === 'stock' ? `color-v${colorVersion}` : `stance-v1/${stance}`}/${view}`;
            assert.ok(svg.includes(`${root}/paint-mask.png`));
            assert.ok(svg.includes(wheelId === 'street-temp' ? `${root}/studio.png` : vehicle.views[view].studio.wheelScenes[wheelId][stance]));
            if (wheelId === 'rocket-attack-20' && stance === 'frame' && paintMode === 'Two-tone') {
              const embedded = await embedArtwork(svg, async (path) => {
                const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
                assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
                return `data:image/png;base64,${bytes.toString('base64')}`;
              });
              assert.ok(!embedded.includes('/designer/'));
            }
          }
        }
      }
    }
    for (const id of ['Chevrolet-C10-1969-1971', 'Chevrolet-C10-1970-1972', 'unknown', '', null, 1971])
      assert.equal(resolveVehicleId(id), undefined);
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else delete globalThis.localStorage;
  }
});

test('paired K10 years load legacy shared links and saved drafts without losing customization', async () => {
  const { readDraft, draftKey } = await import(pathToFileURL(join(temporary, 'storage.mjs')).href);
  assert.deepEqual(vehicles.filter((v) => v.model === 'K10').map((v) => v.label), [
    '1967 K10', '1968 K10', '1969–1970 K10', '1971–1972 K10', '1973–1974 K10', '1975–1976 K10', '1977–1979 K10', '1980 K10', '1981–1982 K10', '1983–1984 K10', '1985–1987 K10',
  ]);
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let savedDraft;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem(key) { assert.equal(key, draftKey); return savedDraft; },
  } });
  try {
    for (const year of [1969, 1970, 1971, 1972])
    for (const wheelId of ['street-temp', 'baja-polished', 'baja-black', 'kmc-impact-monoblock-machined', 'kmc-impact-beadlock-machined'])
    for (const paintMode of ['Solid', 'Two-tone']) {
      const pair = year <= 1970 ? '1969-1970' : '1971-1972';
      const oldId = `Chevrolet-K10-${year}`;
      const selection = {
        vehicleId: oldId, color: '#224466', secondaryColor: '#e8dcc9',
        roofColor: '#ffeecc', contrastRoof: true, cabPaint: 'Roof and pillars',
        finish: 'Satin', paintMode, wheelId, view: 'rear-quarter',
      };
      assert.ok(!vehicles.some((v) => v.id === oldId));
      const c = readShare('#build=' + encodeURIComponent(JSON.stringify(selection)));
      assert.equal(c.vehicleId, `Chevrolet-K10-${pair}`);
      for (const [key, value] of Object.entries(selection)) {
        if (key !== 'vehicleId') assert.equal(c[key], value);
      }
      savedDraft = JSON.stringify(selection);
      assert.deepEqual(readDraft(), c);
      assert.deepEqual(readShare(shareHash(c)), c);
      assert.equal(summary(c).Vehicle, `${pair.replace('-', '–')} Chevrolet K10`);
      assert.equal(summary(c)['Cab paint coverage'], 'Roof and pillars');
      for (const view of views) {
        const svg = renderSvg(c, view);
        const source = year <= 1970 ? '1970-color-v5' : view === 'rear-quarter' ? '1972-color-v5' : '1972-color-v4';
        assert.ok(svg.includes(`/chevrolet-k10-${source}/${view}/paint-mask.png`));
      }
    }
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else delete globalThis.localStorage;
  }
});

test('1971–1972 K10 Center band and Rocker paint retain the refined rear pack in saved builds and exports', async () => {
  const { readDraft, draftKey } = await import(pathToFileURL(join(temporary, 'storage.mjs')).href);
  const { embedArtwork } = await import(pathToFileURL(join(temporary, 'export.mjs')).href);
  const target = vehicles.find((vehicle) => vehicle.id === 'Chevrolet-K10-1971-1972');
  assert.equal(defaultConfiguration(target).twoToneStyle, 'Center band');
  for (const view of views)
    assert.equal(target.views[view].studio.root, `/designer/studio/chevrolet-k10-1972-color-v${view === 'rear-quarter' ? 5 : 4}/${view}`);
  for (const vehicle of vehicles) {
    const supported = vehicle.id === target.id;
    assert.equal(normalize({ vehicleId: vehicle.id, twoToneStyle: 'Rocker' }).twoToneStyle, supported ? 'Rocker' : 'Center band');
    for (const view of views) assert.equal(!!vehicle.views[view].studio.rockerPaint, supported);
  }
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  let savedDraft;
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem(key) { assert.equal(key, draftKey); return savedDraft; },
  } });
  try {
    for (const vehicleId of [target.id, 'Chevrolet-K10-1971', 'Chevrolet-K10-1972']) {
      const selection = { vehicleId, paintMode: 'Two-tone', twoToneStyle: 'Rocker', color: '#497385', secondaryColor: '#f2eee3', roofColor: '#f2eee3', contrastRoof: true, finish: 'Satin' };
      const c = normalize(selection);
      assert.equal(c.vehicleId, target.id);
      assert.equal(c.twoToneStyle, 'Rocker');
      assert.equal(summary(c)['Two-tone pattern'], 'Rocker');
      assert.deepEqual(readShare(shareHash(c)), c);
      savedDraft = JSON.stringify(selection);
      assert.deepEqual(readDraft(), c);
    }
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, 'localStorage', previousStorage);
    else delete globalThis.localStorage;
  }
  const rearAssets = new Set();
  for (const wheelId of ['street-temp', ...Object.keys(target.views.side.studio.wheelScenes)])
  for (const twoToneStyle of ['Center band', 'Rocker']) {
    const c = normalize({ vehicleId: target.id, paintMode: 'Two-tone', twoToneStyle, color: '#497385', secondaryColor: '#f2eee3', wheelId });
    for (const view of views) {
      const svg = renderSvg(c, view);
      const root = target.views[view].studio.root;
      const rocker = twoToneStyle === 'Rocker';
      assert.equal(svg.includes(`${root}/rocker-mask.png`), rocker);
      assert.equal(/<filter id="[^"]+-rocker-tint"/.test(svg), rocker);
      assert.equal(/<filter id="[^"]+-center-band-tint"/.test(svg), !rocker);
      assert.notEqual(svg, renderSvg({ ...c, secondaryColor: '#d5253a' }, view));
      assert.ok(svg.includes(wheelId === 'street-temp' ? `${root}/studio.png` : target.views[view].studio.wheelScenes[wheelId].stock));
      const embedded = await embedArtwork(svg, async (path) => {
        if (view === 'rear-quarter' && path.startsWith(`${root}/`)) rearAssets.add(path.slice(root.length + 1));
        const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
        assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
        assert.equal(bytes.readUInt32BE(16), 768);
        assert.equal(bytes.readUInt32BE(20), 512);
        return `data:image/png;base64,${bytes.toString('base64')}`;
      });
      assert.ok(!embedded.includes('/designer/'));
      assert.ok(!renderSvg(normalize({ ...c, twoToneStyle: 'Center band' }), view).includes('rocker-mask'));
      const solid = normalize({ ...c, paintMode: 'Solid' });
      assert.ok(!renderSvg(solid, view).includes('rocker-mask'));
      assert.equal(renderSvg(solid, view), renderSvg({ ...solid, secondaryColor: '#ff00ff' }, view));
    }
  }
  assert.deepEqual(rearAssets, new Set(['studio.png', 'paint-texture.png', 'paint-mask.png', 'center-band-mask.png', 'cab-mask.png', 'roof-mask.png', 'rocker-mask.png']));
});

test('1978 Ford studio variants preserve finishes, shares and offline artwork', async () => {
  for (const [model, asset] of [['F-100', 'f100'], ['F-150', 'f150']]) {
    const vehicle = vehicles.find((v) => v.id === `Ford-${model}-1978`);
    const initial = defaultConfiguration(vehicle);
    assert.equal(initial.color, '#1678ba');
    assert.equal(initial.paintMode, 'Solid');
    assert.equal(initial.contrastRoof, false);
    const c = normalize({ vehicleId: vehicle.id, color: '#2c6648', secondaryColor: '#eee3d1', roofColor: '#dfbe28', finish: 'Satin', paintMode: 'Two-tone', contrastRoof: true, cabPaint: 'Roof only' });
    assert.equal(c.cabPaint, 'Roof and pillars');
    assert.equal(c.twoToneStyle, 'Center band');
    assert.deepEqual(readShare(shareHash(c)), c);
    const scenes = new Set();
    for (const view of views) {
      const svg = renderSvg(c, view);
      assert.ok(svg.includes(`/ford-${asset}-1978-color-v1/`));
      for (const change of [{ color: '#ff0000' }, { secondaryColor: '#0000ff' }, { roofColor: '#ffffff' }, { finish: 'Gloss' }])
        assert.notEqual(svg, renderSvg({ ...c, ...change }, view));
      const solid = normalize({ ...c, paintMode: 'Solid', contrastRoof: false });
      assert.equal(renderSvg(solid, view), renderSvg({ ...solid, secondaryColor: '#ff00ff', roofColor: '#000000' }, view));
      for (const file of ['studio.png', 'paint-texture.png', 'paint-mask.png', 'center-band-mask.png', 'cab-mask.png', 'roof-mask.png']) {
        const bytes = readFileSync(new URL(`../public/designer/studio/ford-${asset}-1978-color-v1/${view}/${file}`, import.meta.url));
        const previous = readFileSync(new URL(`../public/designer/studio/ford-${asset}-1979-color-v1/${view}/${file}`, import.meta.url));
        if (view === 'side' || view === 'rear-quarter' || file === 'paint-texture.png') assert.deepEqual(bytes, previous);
        if ((view === 'front' || view === 'front-quarter') && file === 'studio.png') assert.notDeepEqual(bytes, previous);
      }
      const embedded = await embedArtwork(svg, async (path) => {
        const bytes = readFileSync(new URL(`../public${path}`, import.meta.url));
        assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
        assert.equal(bytes.readUInt32BE(16), 768);
        assert.equal(bytes.readUInt32BE(20), 512);
        if (path.endsWith('/studio.png')) scenes.add(bytes.toString('base64'));
        return `data:image/png;base64,${bytes.toString('base64')}`;
      });
      assert.ok(!embedded.includes('/designer/'));
    }
    assert.equal(scenes.size, 4);
  }
  assert.ok(vehicles.every((vehicle) => views.every((view) => vehicle.views[view].studio?.paintScene)));
});

test('approved pickup scenes preserve editable paints across shares and offline exports', async () => {
  for (const model of ['C10', 'K10'])
    for (const year of model === 'C10' ? [1967, 1968, 1969, 1970, 1971, 1972] : [1967, 1968, 1969, 1970, 1971, 1972]) {
      const c = normalize({
        vehicleId: `Chevrolet-${model}-${year}`,
        color: '#00ff00',
        paintMode: 'Two-tone',
        contrastRoof: true,
      });
      assert.equal(c.color, '#00ff00');
      assert.equal(c.contrastRoof, true);
      assert.equal(c.paintMode, 'Two-tone');
      assert.deepEqual(readShare(shareHash(c)), c);
      const images = [];
      for (const view of views) {
        const svg = renderSvg(c, view);
        const embedded = await embedArtwork(svg, async (path) => {
          const bytes = readFileSync(
            new URL(`../public${path}`, import.meta.url),
          );
          assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
          assert.equal(bytes.readUInt32BE(16), 768);
          assert.equal(bytes.readUInt32BE(20), 512);
          images.push(bytes.toString('base64'));
          return `data:image/png;base64,${bytes.toString('base64')}`;
        });
        assert.ok(!embedded.includes('/designer/'));
      }
      assert.ok(new Set(images).size >= 4);
      for (const view of views) {
        const base = renderSvg(c, view);
        assert.notEqual(base, renderSvg({ ...c, color: '#000000' }, view));
        assert.notEqual(
          base,
          renderSvg({ ...c, secondaryColor: '#0000ff' }, view),
        );
        assert.notEqual(base, renderSvg({ ...c, roofColor: '#ff00ff' }, view));
        assert.notEqual(base, renderSvg({ ...c, contrastRoof: false }, view));
      }
    }
});
