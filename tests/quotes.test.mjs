import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync,
} from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

const temp = mkdtempSync(join(tmpdir(), 'azst-quote-tests-'));
after(() => rmSync(temp, { recursive: true, force: true }));
for (const path of [
  'lib/designer/manifest',
  'lib/designer/render',
  'lib/designer/studio',
  'services/quotes/security',
  'services/quotes/service',
]) {
  const src = readFileSync(new URL(`../${path}.ts`, import.meta.url), 'utf8');
  const output = ts
    .transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    })
    .outputText.replace(/(from\s+['"])(\.[^'"]+)(['"])/g, '$1$2.mjs$3');
  const dest = join(temp, path + '.mjs');
  mkdirSync(join(dest, '..'), { recursive: true });
  writeFileSync(dest, output);
}
const { handleQuoteRequest, privateLink, retryNotifications, verifyTurnstile } =
  await import(pathToFileURL(join(temp, 'services/quotes/service.mjs')));
const { boundedForm, MAX_REQUEST_BYTES } = await import(
  pathToFileURL(join(temp, 'services/quotes/security.mjs'))
);
const origin = 'https://azsporttrucks.com';
function harness(options = {}) {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(
    readFileSync(
      new URL('../services/quotes/migrations/0001_quotes.sql', import.meta.url),
      'utf8',
    ),
  );
  let loseCommit = !!options.loseCommit;
  let failSave = !!options.failSave;
  const db = {
    prepare(sql) {
      let params = [];
      const statement = {
        bind(...p) {
          params = p;
          return statement;
        },
        async first() {
          if (failSave && sql.includes('SET assets_json=?')) {
            failSave = false;
            throw new Error('free database quota reached');
          }
          const value = sqlite.prepare(sql).get(...params) ?? null;
          if (loseCommit && sql.includes('SET assets_json=?')) {
            loseCommit = false;
            throw new Error('response lost after durable commit');
          }
          return value;
        },
        async run() {
          return { success: true, meta: sqlite.prepare(sql).run(...params) };
        },
        async all() {
          return { results: sqlite.prepare(sql).all(...params) };
        },
      };
      return statement;
    },
  };
  const env = {
    QUOTE_ENABLED: 'true',
    QUOTE_DB: db,
    QUOTE_EMAIL: {},
    PUBLIC_ORIGIN: origin,
    QUOTE_FROM: 'quotes@azsporttrucks.com',
    QUOTE_TO: 'Aztruckshootout@gmail.com',
    TURNSTILE_SITE_KEY: 'live-site-key',
    TURNSTILE_SECRET_KEY: 'server-secret',
    QUOTE_ACCESS_SECRET: 'random-test-secret-with-more-than-32-characters',
  };
  const work = [];
  const sent = [];
  let failMail = !!options.failMail;
  const deps = {
    verifyCaptcha: async (token) => token === 'pass',
    sendMail: async (mail) => {
      if (failMail) throw new Error('provider unavailable');
      sent.push(mail);
    },
  };
  const request = (req) =>
    handleQuoteRequest(
      req,
      env,
      {
        waitUntil(p) {
          work.push(p);
        },
      },
      deps,
    );
  return {
    env,
    sqlite,
    sent,
    request,
    async settle() {
      await Promise.all(work);
    },
    setMailHealthy() {
      failMail = false;
    },
    deps,
    async close() {
      await Promise.all(work);
      sqlite.close();
    },
  };
}
function payload(extra = {}) {
  const f = new FormData();
  const fields = {
    name: 'Test Customer',
    email: 'test.customer@example.com',
    phone: '555-0100',
    location: 'Phoenix, AZ',
    ownsTruck: 'Yes',
    budget: 'Undecided',
    timeline: 'Flexible',
    description: 'Test inquiry <script>alert(1)</script>',
    privacyConsent: 'yes',
    companyWebsite: '',
    'cf-turnstile-response': 'pass',
    configuration: JSON.stringify({
      vehicleId: 'Chevrolet-K5-1969',
      color: '#aa6538',
      roof: 'Body-color top',
      wheelId: 'baja-polished',
    }),
    ...extra,
  };
  for (const [key, value] of Object.entries(fields)) f.set(key, value);
  return f;
}
function post(form = payload(), key = crypto.randomUUID(), headers = {}) {
  return new Request(origin + '/api/quotes', {
    method: 'POST',
    headers: {
      Origin: origin,
      'Idempotency-Key': key,
      'CF-Connecting-IP': '192.0.2.1',
      ...headers,
    },
    body: form,
  });
}

test('unconfigured quote service stays off without collecting data', async () => {
  const h = harness();
  h.env.QUOTE_ENABLED = 'false';
  assert.deepEqual(
    await (await h.request(new Request(origin + '/api/quotes/status'))).json(),
    { available: false },
  );
  assert.equal((await h.request(post())).status, 503);
  assert.equal(
    h.sqlite.prepare('SELECT count(*) AS n FROM quote_requests').get().n,
    0,
  );
  await h.close();
});
test('free requests save selections without an object bucket and render all four private build views', async () => {
  const h = harness();
  const f = payload();
  const response = await h.request(post(f));
  assert.equal(response.status, 201);
  const data = await response.json();
  assert.equal(data.received, true);
  assert.match(data.reference, /^AZST-/);
  await h.settle();
  const row = h.sqlite.prepare('SELECT * FROM quote_requests').get();
  assert.equal(row.status, 'received');
  assert.equal(row.email_status, 'sent');
  assert.equal(h.sent.length, 1);
  assert.equal(h.sent[0].to, 'Aztruckshootout@gmail.com');
  assert.equal(h.sent[0].replyTo, 'test.customer@example.com');
  assert.match(
    h.sent[0].text,
    /Review the customer details and all four build views/,
  );
  assert.ok(!JSON.stringify(data).includes('token='));
  const link = await privateLink(h.env, row.id);
  const review = await h.request(new Request(link));
  assert.equal(review.status, 200);
  const html = await review.text();
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.equal((html.match(/<figure>/g) || []).length, 4);
  assert.ok(html.includes('Side profile'));
  assert.ok(html.includes('Front three-quarter'));
  assert.match(h.sent[0].text, /photos may arrive separately/);
  assert.match(
    review.headers.get('Content-Security-Policy'),
    /default-src 'none'/,
  );
  const assetUrl = new URL(link);
  assetUrl.pathname += '/assets/0';
  assert.equal((await h.request(new Request(assetUrl))).status, 404);
  assert.equal(
    (await h.request(new Request(origin + '/api/quotes/' + row.id))).status,
    404,
  );
  const tampered = new URL(link);
  tampered.searchParams.set('token', 'a'.repeat(64));
  assert.equal((await h.request(new Request(tampered))).status, 404);
  const expired = await privateLink(h.env, row.id, 1);
  assert.equal((await h.request(new Request(expired))).status, 404);
  await h.close();
});
test('identical retries keep one request and one notification; changed payload cannot replace it', async () => {
  const h = harness();
  const key = crypto.randomUUID();
  const first = await (await h.request(post(payload(), key))).json();
  await h.settle();
  const again = await (await h.request(post(payload(), key))).json();
  assert.deepEqual(again, first);
  assert.equal(
    (await h.request(post(payload({ name: 'Changed customer' }), key))).status,
    409,
  );
  assert.equal(
    h.sqlite.prepare('SELECT count(*) AS n FROM quote_requests').get().n,
    1,
  );
  assert.equal(h.sent.length, 1);
  await h.close();
});
test('square-body quotes preserve the year group, paint and wheel artwork', async () => {
  for (const [years, color, contrastRoof] of [
    ['1977-1979', '#c4a574', true],
    ['1980', '#1678ba', false],
    ['1981-1982', '#e5e7e7', false],
    ['1985-1987', '#17191c', false],
  ]) {
    const version = years === '1977-1979' ? 'v2' : 'v1';
    const h = harness();
    const configuration = {
      vehicleId: `Chevrolet-K10-${years}`,
      color,
      secondaryColor: '#b8bec5',
      paintMode: 'Two-tone',
      contrastRoof,
      wheelId: 'kmc-impact-beadlock-machined',
    };
    const response = await h.request(post(payload({ configuration: JSON.stringify(configuration) })));
    assert.equal(response.status, 201);
    await h.settle();
    const row = h.sqlite.prepare('SELECT * FROM quote_requests').get();
    const saved = JSON.parse(row.configuration_json);
    for (const [key, value] of Object.entries(configuration)) assert.equal(saved[key], value);
    assert.ok(h.sent[0].text.includes(`${years.replace('-', '–')} Chevrolet K10`));
    const review = await h.request(new Request(await privateLink(h.env, row.id)));
    const html = await review.text();
    for (const view of ['side', 'front-quarter', 'rear-quarter', 'front']) {
      assert.ok(html.includes(`/chevrolet-k10-${years}-color-${version}/${view}/paint-mask.png`));
      assert.ok(html.includes(`/chevrolet-k10-${years}-kmc-impact-beadlock-${version}/${view}.png`));
    }
    await h.close();
  }
});
test('paired C10 quotes accept old IDs and retain historical private reviews and notifications', async () => {
  for (const firstYear of [1969, 1971]) {
    const groupId = `Chevrolet-C10-${firstYear}-${firstYear + 1}`;
    for (const inputId of [`Chevrolet-C10-${firstYear}`, `Chevrolet-C10-${firstYear + 1}`, groupId]) {
      const h = harness();
      try {
        const sourceYear = firstYear === 1969 ? 1970 : 1971;
        const configuration = {
          vehicleId: inputId, direction: 'Lowered', color: '#38694b', secondaryColor: '#f2eee3',
          roofColor: '#ddbb88', contrastRoof: true, cabPaint: 'Roof and pillars',
          paintMode: 'Two-tone', twoToneStyle: 'Center band', finish: 'Satin',
          wheelId: 'rocket-attack-20', stance: 'frame', view: 'rear-quarter',
        };
        const response = await h.request(post(payload({ configuration: JSON.stringify(configuration) })));
        assert.equal(response.status, 201);
        await h.settle();
        const row = h.sqlite.prepare('SELECT * FROM quote_requests').get();
        const saved = JSON.parse(row.configuration_json);
        assert.equal(saved.vehicleId, groupId);
        for (const [key, value] of Object.entries(configuration)) if (key !== 'vehicleId') assert.equal(saved[key], value);
        assert.ok(h.sent[0].text.includes(`${firstYear}–${firstYear + 1} Chevrolet C10`));
        // Emulate an existing pre-grouping record without migrating stored data.
        if (inputId !== groupId) h.sqlite.prepare('UPDATE quote_requests SET configuration_json=? WHERE id=?')
          .run(JSON.stringify({ ...saved, vehicleId: inputId }), row.id);
        const review = await h.request(new Request(await privateLink(h.env, row.id)));
        assert.equal(review.status, 200);
        const html = await review.text();
        assert.ok(html.includes(`${firstYear}–${firstYear + 1} Chevrolet C10`));
        assert.ok(html.includes('#38694b') && html.includes('#f2eee3'));
        assert.equal((html.match(/<figure>/g) || []).length, 4);
        for (const view of ['side', 'front-quarter', 'rear-quarter', 'front']) {
          assert.ok(html.includes(`/chevrolet-c10-${sourceYear}-stance-v1/frame/${view}/paint-mask.png`));
          assert.ok(html.includes(`/chevrolet-c10-${sourceYear}-rocket-attack-v1/20/frame/${view}.png`));
        }
        if (inputId !== groupId) {
          h.sqlite.prepare("UPDATE quote_requests SET email_status='pending',email_next_at=0 WHERE id=?").run(row.id);
          await retryNotifications(h.env, h.deps.sendMail);
          assert.equal(h.sent.length, 2);
          assert.ok(h.sent[1].text.includes(`${firstYear}–${firstYear + 1} Chevrolet C10`));
          assert.equal(JSON.parse(h.sqlite.prepare('SELECT configuration_json FROM quote_requests WHERE id=?').get(row.id).configuration_json).vehicleId, inputId);
        }
      } finally {
        await h.close();
      }
    }
  }
});

test('square-body C10 quotes retain the selected 2WD group, street wheels, stance and cab paint', async () => {
  for (const years of ['1973-1974', '1975-1976', '1977-1979', '1980', '1981-1982', '1983-1984', '1985-1987']) {
    for (const [wheelId, stance, wheelPack] of [
      ...['stock', 'drop2', 'drop4', 'frame'].map((stance) => ['street-temp', stance, `stock-rally-v1/${stance}`]),
      ['torq-thrust-18', 'drop2', 'torq-v1/18/drop2'],
      ['rocket-attack-20', 'frame', 'rocket-attack-v1/20/frame'],
    ]) {
      const h = harness();
      const configuration = {
        vehicleId: `Chevrolet-C10-${years}`,
        direction: 'Lowered',
        color: '#325577',
        secondaryColor: '#e8ddc7',
        roofColor: '#f1eee5',
        paintMode: 'Two-tone',
        contrastRoof: true,
        finish: 'Satin',
        wheelId,
        stance,
      };
      const response = await h.request(post(payload({ configuration: JSON.stringify(configuration) })));
      assert.equal(response.status, 201);
      await h.settle();
      const row = h.sqlite.prepare('SELECT * FROM quote_requests').get();
      const saved = JSON.parse(row.configuration_json);
      for (const [key, value] of Object.entries(configuration)) assert.equal(saved[key], value);
      assert.ok(h.sent[0].text.includes(`${years.replace('-', '–')} Chevrolet C10`));
      assert.ok(h.sent[0].text.includes('Street tires; size to be discussed'));
      assert.ok(h.sent[0].text.includes('Roof and cab back; door window frames stay body color'));
      const review = await h.request(new Request(await privateLink(h.env, row.id)));
      assert.equal(review.status, 200);
      const html = await review.text();
      const root = stance === 'stock' ? `color-v1` : `stance-v1/${stance}`;
      for (const view of ['side', 'front-quarter', 'rear-quarter', 'front']) {
        assert.ok(html.includes(`/chevrolet-c10-${years}-${root}/${view}/paint-mask.png`));
        assert.ok(html.includes(`/chevrolet-c10-${years}-${wheelPack}/${view}.png`));
        assert.ok(!html.includes(`/chevrolet-c10-${years}-${root}/${view}/studio.png`));
      }
      assert.ok(!html.includes('/chevrolet-k10-'));
      assert.ok(!html.includes('/chevrolet-c10-1971-'));
      await h.close();
    }
  }
});

test('1979 Bronco quotes preserve rear hardtop choices and render the corresponding four views', async () => {
  for (const roof of ['White top', 'Black top', 'Body-color top', 'Top off'])
  for (const paintMode of ['Solid', 'Two-tone']) {
    const h = harness();
    const configuration = {
      vehicleId: 'Ford-Bronco-1979',
      direction: 'Lifted',
      color: '#386c47',
      secondaryColor: '#e8dfca',
      paintMode,
      finish: 'Satin',
      contrastRoof: false,
      cabPaint: 'Roof only',
      roof,
      wheelId: 'street-temp',
      stance: 'stock',
    };
    const response = await h.request(post(payload({ configuration: JSON.stringify(configuration) })));
    assert.equal(response.status, 201);
    await h.settle();
    const row = h.sqlite.prepare('SELECT * FROM quote_requests').get();
    const saved = JSON.parse(row.configuration_json);
    for (const [key, value] of Object.entries(configuration)) assert.equal(saved[key], value);
    assert.ok(h.sent[0].text.includes('1979 Ford Bronco'));
    assert.ok(h.sent[0].text.includes(`Rear hardtop: ${roof}`));
    assert.ok(h.sent[0].text.includes('Front cab roof: Body color (fixed steel roof)'));
    assert.ok(h.sent[0].text.includes('Black vinyl upholstery'));
    assert.ok(h.sent[0].text.includes('As pictured (lifted)'));
    const review = await h.request(new Request(await privateLink(h.env, row.id)));
    assert.equal(review.status, 200);
    const html = await review.text();
    assert.equal((html.match(/<figure>/g) || []).length, 4);
    const top = roof === 'Top off' ? 'top-off' : 'top-on';
    for (const view of ['side', 'front-quarter', 'rear-quarter', 'front']) {
      assert.ok(html.includes(`/ford-bronco-1979-color-v2/${top}/${view}/studio.png`));
      assert.ok(html.includes(`/ford-bronco-1979-color-v2/${top}/${view}/paint-mask.png`));
      assert.ok(html.includes(`/ford-bronco-1979-color-v2/${top}/${view}/roof-mask.png`));
    }
    assert.equal((html.match(/data-layer="detail-overlay"/g) || []).length, 3);
    assert.ok(html.includes('/ford-bronco-1979-color-v2/wheel-details.png'));
    assert.ok(!html.includes('/ford-f150-') && !html.includes('/chevrolet-k5-'));
    await h.close();
  }
});

test('1971–1972 K10 quote reviews preserve Center band and Rocker paint with the refined rear pack', async () => {
  for (const twoToneStyle of ['Center band', 'Rocker'])
  for (const wheelId of ['street-temp', 'baja-black']) {
  const h = harness();
  const configuration = {
    vehicleId: 'Chevrolet-K10-1971-1972', paintMode: 'Two-tone', twoToneStyle,
    color: '#497385', secondaryColor: '#f2eee3', wheelId,
    contrastRoof: true, roofColor: '#f2eee3', finish: 'Satin',
  };
  try {
    const response = await h.request(post(payload({ configuration: JSON.stringify(configuration) })));
    assert.equal(response.status, 201);
    await h.settle();
    const row = h.sqlite.prepare('SELECT * FROM quote_requests').get();
    const saved = JSON.parse(row.configuration_json);
    assert.equal(saved.vehicleId, 'Chevrolet-K10-1971-1972');
    for (const [key, value] of Object.entries(configuration)) if (key !== 'vehicleId') assert.equal(saved[key], value);
    assert.ok(h.sent[0].text.includes(`Two-tone pattern: ${twoToneStyle}`));
    const review = await h.request(new Request(await privateLink(h.env, row.id)));
    assert.equal(review.status, 200);
    const html = await review.text();
    assert.equal((html.match(/<figure>/g) || []).length, 4);
    for (const view of ['side', 'front-quarter', 'rear-quarter', 'front']) {
      const root = `/designer/studio/chevrolet-k10-1972-color-v${view === 'rear-quarter' ? 5 : 4}/${view}`;
      for (const file of ['paint-texture.png', 'paint-mask.png', 'center-band-mask.png', 'cab-mask.png', 'roof-mask.png'])
        assert.ok(html.includes(`${root}/${file}`));
      assert.equal(html.includes(`${root}/rocker-mask.png`), twoToneStyle === 'Rocker');
      assert.ok(html.includes(wheelId === 'street-temp' ? `${root}/studio.png` : `/designer/wheels/chevrolet-k10-1972-baja-black-v1/${view}.png`));
    }
    assert.equal(/<filter id="[^"]+-center-band-tint"/.test(html), twoToneStyle === 'Center band');
  } finally {
    await h.close();
  }
  }
});

test('a free database limit never confirms receipt or sends mail; retry recovers the same reservation', async () => {
  const h = harness({ failSave: true });
  const key = crypto.randomUUID();
  const failed = await h.request(post(payload(), key));
  assert.equal(failed.status, 503);
  assert.equal(h.sent.length, 0);
  assert.equal(
    h.sqlite.prepare('SELECT status FROM quote_requests').get().status,
    'uploading',
  );
  const retry = await h.request(post(payload(), key));
  assert.equal(retry.status, 201);
  await h.close();
});
test('lost database acknowledgement does not delete a successfully saved request', async () => {
  const h = harness({ loseCommit: true });
  const r = await h.request(post());
  assert.equal(r.status, 200);
  assert.equal((await r.json()).received, true);
  await h.close();
});
test('email failure retains the request and scheduled retry sends it later', async () => {
  const h = harness({ failMail: true });
  assert.equal((await h.request(post())).status, 201);
  await h.settle();
  const row = h.sqlite.prepare('SELECT * FROM quote_requests').get();
  assert.equal(row.status, 'received');
  assert.equal(row.email_status, 'pending');
  h.sqlite.prepare('UPDATE quote_requests SET email_next_at=0').run();
  h.setMailHealthy();
  await retryNotifications(h.env, h.deps.sendMail);
  assert.equal(h.sent.length, 1);
  assert.equal(
    h.sqlite.prepare('SELECT email_status FROM quote_requests').get()
      .email_status,
    'sent',
  );
  await h.close();
});

test('an interrupted final notification attempt becomes visibly failed without sending again', async () => {
  const h = harness();
  assert.equal((await h.request(post())).status, 201);
  await h.settle();
  h.sqlite
    .prepare(
      "UPDATE quote_requests SET email_status='sending',email_attempts=8,email_lease_until=0",
    )
    .run();
  await retryNotifications(h.env, h.deps.sendMail);
  assert.equal(h.sent.length, 1);
  assert.equal(
    h.sqlite.prepare('SELECT email_status FROM quote_requests').get()
      .email_status,
    'failed',
  );
  await h.close();
});
test('forged origins, challenges, fields, consent, and all file uploads are rejected', async () => {
  const cases = [
    [payload(), { Origin: 'https://other.example' }, 403],
    [payload({ 'cf-turnstile-response': 'forged' }), {}, 400],
    [payload({ privacyConsent: 'no' }), {}, 400],
    [payload({ email: 'x@example.com\r\nBcc:other@example.com' }), {}, 400],
    [payload({ configuration: '{"vehicleId":"unknown"}' }), {}, 400],
    [payload({ configuration: '{"vehicleId":"Chevrolet-C10-1969-1971"}' }), {}, 400],
    [payload({ companyWebsite: 'spam.example' }), {}, 400],
  ];
  const forged = payload();
  forged.set(
    'preview-side',
    new File(['<svg onload="alert(1)"/>'], 'view.png', { type: 'image/png' }),
  );
  cases.push([forged, {}, 400]);
  for (const [form, headers, status] of cases) {
    const h = harness();
    assert.equal(
      (await h.request(post(form, crypto.randomUUID(), headers))).status,
      status,
    );
    assert.equal(h.sent.length, 0);
    await h.close();
  }
});
test('stream size limits work even when Content-Length is absent', async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(MAX_REQUEST_BYTES + 1));
      controller.close();
    },
  });
  await assert.rejects(
    () =>
      boundedForm(
        new Request(origin + '/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data; boundary=x' },
          body,
          duplex: 'half',
        }),
      ),
    (e) => e.status === 413,
  );
});
test('IP abuse limits use hashed identifiers and block excess requests', async () => {
  const h = harness();
  for (let i = 0; i < 10; i++)
    assert.equal(
      (await h.request(post(payload({ 'cf-turnstile-response': 'bad' }))))
        .status,
      400,
    );
  assert.equal((await h.request(post())).status, 429);
  const row = h.sqlite.prepare('SELECT bucket FROM quote_rate_limits').get();
  assert.match(row.bucket, /^[a-f0-9]{64}$/);
  await h.close();
});
test('Turnstile validation checks both hostname and action', async () => {
  const original = globalThis.fetch;
  const h = harness();
  try {
    for (const [data, expected] of [
      [{ success: true, hostname: 'azsporttrucks.com', action: 'quote' }, true],
      [{ success: true, hostname: 'attacker.example', action: 'quote' }, false],
      [
        { success: true, hostname: 'azsporttrucks.com', action: 'other' },
        false,
      ],
    ]) {
      globalThis.fetch = async () => Response.json(data);
      assert.equal(
        await verifyTurnstile('token', '192.0.2.1', h.env),
        expected,
      );
    }
  } finally {
    globalThis.fetch = original;
    await h.close();
  }
});
