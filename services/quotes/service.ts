import type { D1Database, ExecutionContext } from '@cloudflare/workers-types';
import { normalize, summary, viewLabels, views } from '../../lib/designer/manifest';
import { escapeHtml, renderSvg } from '../../lib/designer/render';
import {
  boundedForm,
  digest,
  sign,
  validSignature,
  validateFields,
  QuoteError,
} from './security';

export type QuoteEnv = {
  QUOTE_DB?: D1Database;
  QUOTE_EMAIL?: unknown;
  QUOTE_ENABLED?: string;
  PUBLIC_ORIGIN: string;
  QUOTE_FROM: string;
  QUOTE_TO: string;
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  QUOTE_ACCESS_SECRET?: string;
};
export type Mail = {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
};
export type SendMail = (mail: Mail) => Promise<void>;
const contactLabels: Record<string, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  ownsTruck: 'Already owns truck',
  budget: 'Target budget',
  timeline: 'Desired timeline',
  description: 'Project description',
};
function contactSummary(contact: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(contactLabels).map(([key, label]) => [
      label,
      contact[key] || '',
    ]),
  );
}
type Row = {
  id: string;
  request_key: string;
  fingerprint: string;
  reference: string;
  created_at: number;
  contact_json: string;
  configuration_json: string;
  assets_json: string;
  status: string;
  upload_owner: string;
  upload_until: number;
  email_status: string;
  email_attempts: number;
};
const responseHeaders = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
};
function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: responseHeaders });
}
export function configured(env: QuoteEnv) {
  return (
    env.QUOTE_ENABLED === 'true' &&
    !!env.QUOTE_DB &&
    !!env.QUOTE_EMAIL &&
    !!env.TURNSTILE_SITE_KEY &&
    !!env.TURNSTILE_SECRET_KEY &&
    (env.QUOTE_ACCESS_SECRET?.length ?? 0) >= 32 &&
    !/^[123]x0{8}/.test(env.TURNSTILE_SITE_KEY) &&
    /^[^\s<>@]+@azsporttrucks\.com$/.test(env.QUOTE_FROM) &&
    env.QUOTE_TO.toLowerCase() === 'aztruckshootout@gmail.com'
  );
}
export async function verifyTurnstile(
  token: string,
  ip: string,
  env: QuoteEnv,
) {
  const result = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      signal: AbortSignal.timeout(8000),
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY!,
        response: token,
        remoteip: ip,
      }),
    },
  );
  if (!result.ok) throw new Error('Challenge validation unavailable');
  const data = (await result.json()) as {
    success?: boolean;
    hostname?: string;
    action?: string;
  };
  return (
    data.success === true &&
    data.hostname === new URL(env.PUBLIC_ORIGIN).hostname &&
    data.action === 'quote'
  );
}
async function rate(
  env: QuoteEnv,
  key: string,
  seconds: number,
  limit: number,
) {
  const now = Math.floor(Date.now() / 1000);
  const window = Math.floor(now / seconds);
  const bucket = await sign(env.QUOTE_ACCESS_SECRET!, `${key}:${window}`);
  const row = await env
    .QUOTE_DB!.prepare(
      'INSERT INTO quote_rate_limits(bucket,hits,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET hits=hits+1 RETURNING hits',
    )
    .bind(bucket, (window + 1) * seconds)
    .first<{ hits: number }>();
  if (!row || row.hits > limit)
    throw new QuoteError(
      429,
      'Too many attempts. Please wait a while before trying again.',
      'RATE_LIMIT',
    );
}
export async function privateLink(
  env: QuoteEnv,
  id: string,
  expires = Math.floor(Date.now() / 1000) + 30 * 86400,
) {
  const token = await sign(env.QUOTE_ACCESS_SECRET!, `${id}:${expires}`);
  return `${env.PUBLIC_ORIGIN}/api/quotes/${id}?expires=${expires}&token=${token}`;
}
export async function notifyQuote(
  env: QuoteEnv,
  id: string,
  sendMail: SendMail,
) {
  const now = Math.floor(Date.now() / 1000);
  const row = await env
    .QUOTE_DB!.prepare(
      "UPDATE quote_requests SET email_status='sending',email_attempts=email_attempts+1,email_lease_until=? WHERE id=? AND status='received' AND email_attempts<8 AND ((email_status='pending' AND email_next_at<=?) OR (email_status='sending' AND email_lease_until<?)) RETURNING *",
    )
    .bind(now + 300, id, now, now)
    .first<Row>();
  if (!row) return;
  try {
    const contact = JSON.parse(row.contact_json);
    const config = normalize(JSON.parse(row.configuration_json));
    const link = await privateLink(env, row.id);
    const text = [
      'A new AZ Sport Trucks build request has been received and saved.',
      `Reference: ${row.reference}`,
      '',
      ...Object.entries(contactSummary(contact)).map(
        ([key, value]) => `${key}: ${value}`,
      ),
      '',
      'BUILD',
      ...Object.entries(summary(config)).map(
        ([key, value]) => `${key}: ${value}`,
      ),
      '',
      'Review the customer details and all four build views:',
      link,
      '',
      'Truck photos may arrive separately by email with this request reference.',
      'This private link expires in 30 days. Keep it private. Reply to this email to contact the customer.',
      'Artwork and fitment are illustrative. Confirm the final build and pricing directly with the customer.',
    ].join('\n');
    await sendMail({
      from: env.QUOTE_FROM,
      to: env.QUOTE_TO,
      replyTo: contact.email,
      subject: `${row.reference} — ${summary(config).Vehicle} quote request`,
      text,
    });
    await env
      .QUOTE_DB!.prepare(
        "UPDATE quote_requests SET email_status='sent',email_lease_until=0 WHERE id=? AND email_attempts=? AND email_status='sending'",
      )
      .bind(id, row.email_attempts)
      .run();
  } catch {
    await env
      .QUOTE_DB!.prepare(
        'UPDATE quote_requests SET email_status=?,email_next_at=?,email_lease_until=0 WHERE id=? AND email_attempts=?',
      )
      .bind(
        row.email_attempts >= 8 ? 'failed' : 'pending',
        now + Math.min(21600, 60 * 2 ** row.email_attempts),
        id,
        row.email_attempts,
      )
      .run();
    // Avoid contact details, tokens, and provider response bodies in logs.
    console.error(
      'Quote notification retry needed',
      row.reference,
      row.email_attempts,
    );
  }
}
export async function retryNotifications(env: QuoteEnv, sendMail: SendMail) {
  if (!configured(env)) return;
  const now = Math.floor(Date.now() / 1000);
  // A worker interrupted during its final attempt must remain visible to operations.
  await env
    .QUOTE_DB!.prepare(
      "UPDATE quote_requests SET email_status='failed',email_lease_until=0 WHERE status='received' AND email_status='sending' AND email_attempts>=8 AND email_lease_until<?",
    )
    .bind(now)
    .run();
  const rows = await env
    .QUOTE_DB!.prepare(
      "SELECT id FROM quote_requests WHERE status='received' AND email_attempts<8 AND ((email_status='pending' AND email_next_at<=?) OR (email_status='sending' AND email_lease_until<?)) ORDER BY created_at LIMIT 20",
    )
    .bind(now, now)
    .all<{ id: string }>();
  for (const row of rows.results) await notifyQuote(env, row.id, sendMail);
  await env
    .QUOTE_DB!.prepare('DELETE FROM quote_rate_limits WHERE expires_at<?')
    .bind(now)
    .run();
}

async function receive(
  request: Request,
  env: QuoteEnv,
  ctx: Pick<ExecutionContext, 'waitUntil'>,
  deps: Dependencies,
) {
  if (
    request.headers.get('origin') !== env.PUBLIC_ORIGIN ||
    request.headers.get('sec-fetch-site') === 'cross-site'
  )
    throw new QuoteError(
      403,
      'Submit your request from the AZ Sport Trucks website.',
    );
  const requestKey = request.headers.get('idempotency-key') || '';
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
      requestKey,
    )
  )
    throw new QuoteError(400, 'Refresh the form and try again.');
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  await rate(env, `ip:${ip}`, 600, 10);
  const form = await boundedForm(request);
  const token = form.get('cf-turnstile-response');
  if (
    typeof token !== 'string' ||
    !token ||
    token.length > 2048 ||
    !(await deps.verifyCaptcha(token, ip, env))
  )
    throw new QuoteError(
      400,
      'Please complete the security check again.',
      'CHALLENGE',
    );
  const { contact, configuration } = validateFields(form);
  for (const value of form.values()) {
    if (typeof value !== 'string')
      throw new QuoteError(
        400,
        'Send truck photos by email after submitting your request.',
      );
  }
  const fingerprint = await digest(
    JSON.stringify({
      contact,
      configuration,
    }),
  );
  const db = env.QUOTE_DB!;
  const now = Math.floor(Date.now() / 1000);
  const owner = crypto.randomUUID();
  let row = await db
    .prepare('SELECT * FROM quote_requests WHERE request_key=?')
    .bind(requestKey)
    .first<Row>();
  if (!row) {
    await rate(env, `email:${contact.email.toLowerCase()}`, 86400, 8);
    const id = crypto.randomUUID();
    const reference = `AZST-${id.slice(0, 8).toUpperCase()}-${id.slice(9, 13).toUpperCase()}`;
    await db
      .prepare(
        "INSERT OR IGNORE INTO quote_requests(id,request_key,fingerprint,reference,created_at,contact_json,configuration_json,status) VALUES (?,?,?,?,?,?,?,'uploading')",
      )
      .bind(
        id,
        requestKey,
        fingerprint,
        reference,
        now,
        JSON.stringify(contact),
        JSON.stringify(configuration),
      )
      .run();
    row = await db
      .prepare('SELECT * FROM quote_requests WHERE request_key=?')
      .bind(requestKey)
      .first<Row>();
  }
  if (!row) throw new Error('Quote reservation failed');
  if (row.fingerprint !== fingerprint)
    throw new QuoteError(
      409,
      'The request changed. Reopen the form before sending it again.',
      'CHANGED',
    );
  if (row.status === 'received')
    return json({ received: true, reference: row.reference }, 200);
  const claimed = await db
    .prepare(
      "UPDATE quote_requests SET upload_owner=?,upload_until=? WHERE id=? AND status='uploading' AND upload_until<=? RETURNING id",
    )
    .bind(owner, now + 120, row.id, now)
    .first();
  if (!claimed)
    throw new QuoteError(
      409,
      'This request is still being saved. Please wait a moment and try again.',
      'IN_PROGRESS',
    );
  let committed = false;
  try {
    const saved = await db
      .prepare(
        "UPDATE quote_requests SET assets_json=?,status='received',upload_until=0,upload_owner=NULL WHERE id=? AND status='uploading' AND upload_owner=? RETURNING reference",
      )
      .bind('[]', row.id, owner)
      .first<{ reference: string }>();
    if (!saved) throw new Error('Upload lease expired');
    committed = true;
    ctx.waitUntil(notifyQuote(env, row.id, deps.sendMail));
    return json({ received: true, reference: saved.reference }, 201);
  } catch (error) {
    // A lost database response can happen after the commit. Confirm durable
    // receipt before reporting a failure or retrying the same request.
    const confirmed = await db
      .prepare(
        'SELECT status,assets_json,reference FROM quote_requests WHERE id=?',
      )
      .bind(row.id)
      .first<Row>();
    if (committed || confirmed?.status === 'received') {
      ctx.waitUntil(notifyQuote(env, row.id, deps.sendMail));
      return json({ received: true, reference: row.reference }, 200);
    }
    await db
      .prepare(
        "UPDATE quote_requests SET upload_until=0,upload_owner=NULL WHERE id=? AND upload_owner=? AND status='uploading'",
      )
      .bind(row.id, owner)
      .run();
    throw error;
  }
}

async function review(request: Request, env: QuoteEnv, id: string) {
  const url = new URL(request.url);
  const expires = Number(url.searchParams.get('expires'));
  const token = url.searchParams.get('token') || '';
  if (
    !env.QUOTE_ACCESS_SECRET ||
    !Number.isSafeInteger(expires) ||
    expires < Math.floor(Date.now() / 1000) ||
    !(await validSignature(env.QUOTE_ACCESS_SECRET, `${id}:${expires}`, token))
  )
    return json({ error: 'This private link is invalid or has expired.' }, 404);
  const row = await env.QUOTE_DB?.prepare(
    "SELECT * FROM quote_requests WHERE id=? AND status='received'",
  )
    .bind(id)
    .first<Row>();
  if (!row) return json({ error: 'Request not found.' }, 404);
  const contact = JSON.parse(row.contact_json);
  const config = normalize(JSON.parse(row.configuration_json));
  const pairs = (data: Record<string, unknown>) =>
    Object.entries(data)
      .map(
        ([key, value]) =>
          `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(String(value))}</dd>`,
      )
      .join('');
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${row.reference} | AZ Sport Trucks</title><style>body{background:#111;color:#eee;font:16px/1.6 Arial,sans-serif;margin:0}main{max-width:1100px;margin:auto;padding:32px 20px}h1{color:#f34b52}dl{display:grid;grid-template-columns:minmax(130px,1fr) 3fr;gap:8px 20px}dt{font-weight:bold}dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}.images{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}figure{margin:0}img,svg{width:100%;height:auto}a{color:#ff969a}.note{color:#bbb}@media(max-width:640px){.images{grid-template-columns:1fr}dl{grid-template-columns:1fr;gap:4px}dd{margin-bottom:12px}}</style></head><body><main><h1>AZ SPORT TRUCKS</h1><h2>${row.reference}</h2><p class="note">Private request received ${new Date(row.created_at * 1000).toISOString().slice(0, 10)}. Keep this link private.</p><h2>Customer</h2><dl>${pairs(contactSummary(contact))}</dl><h2>Build selections</h2><dl>${pairs(summary(config))}</dl><h2>Build views</h2><div class="images">${views.map((view) => `<figure>${renderSvg(config, view, `quote-${view}`)}<figcaption>${escapeHtml(viewLabels[view])}</figcaption></figure>`).join('')}</div><p class="note">Views use the saved selections and current designer artwork. Truck photos arrive separately by email. Confirm actual parts, fitment, and pricing with the customer.</p></main></body></html>`;
  return new Response(html, {
    headers: {
      ...responseHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy':
        "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; sandbox allow-same-origin",
    },
  });
}
export type Dependencies = {
  sendMail: SendMail;
  verifyCaptcha: typeof verifyTurnstile;
};
export async function handleQuoteRequest(
  request: Request,
  env: QuoteEnv,
  ctx: Pick<ExecutionContext, 'waitUntil'>,
  deps: Dependencies,
) {
  try {
    const path = new URL(request.url).pathname.replace(/\/$/, '');
    if (path === '/api/quotes/status' && request.method === 'GET') {
      let available = configured(env);
      if (available) {
        try {
          await env
            .QUOTE_DB!.prepare('SELECT id FROM quote_requests LIMIT 1')
            .first();
        } catch {
          available = false;
        }
      }
      return json({
        available,
        ...(available ? { siteKey: env.TURNSTILE_SITE_KEY } : {}),
      });
    }
    const match = path.match(/^\/api\/quotes\/([a-f0-9-]{36})$/);
    if (match && request.method === 'GET')
      return await review(request, env, match[1]);
    if (path !== '/api/quotes') return json({ error: 'Not found.' }, 404);
    if (request.method !== 'POST')
      return json({ error: 'Method not allowed.' }, 405);
    if (!configured(env))
      return json(
        {
          error:
            'Online requests are temporarily unavailable. Your information has not been submitted.',
        },
        503,
      );
    return await receive(request, env, ctx, deps);
  } catch (error) {
    if (error instanceof QuoteError)
      return json({ error: error.message, code: error.code }, error.status);
    console.error('Quote request operation failed');
    return json(
      {
        error:
          'We could not confirm that your request was saved. Please retry; repeated attempts will not create another request.',
      },
      503,
    );
  }
}
