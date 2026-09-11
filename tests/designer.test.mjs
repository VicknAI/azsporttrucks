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
  defaultConfiguration,
  allowedStances,
  wheelCatalog,
} = await import(pathToFileURL(join(temporary, 'manifest.mjs')).href);
const { renderSvg } = await import(
  pathToFileURL(join(temporary, 'render.mjs')).href
);
test('1967 and 1971 have complete, distinct studio packs with valid PNG assets', () => {
  const roots = new Set();
  for (const year of [1967, 1971]) {
    const vehicle = vehicles.find((v) => v.id === `Chevrolet-C10-${year}`);
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
test('all 20 exact model years have separate manifests and four anchor packs', () => {
  assert.equal(vehicles.length, 20);
  assert.equal(new Set(vehicles.map((v) => v.id)).size, 20);
  for (const [model, years] of [
    ['C10', [1967, 1968, 1969, 1970, 1971, 1972]],
    ['K10', [1967, 1968, 1969, 1970, 1971, 1972]],
    ['K5', [1969, 1970, 1971, 1972]],
    ['F-100', [1978, 1979]],
    ['F-150', [1978, 1979]],
  ])
    assert.deepEqual(
      vehicles.filter((v) => v.model === model).map((v) => v.year),
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
