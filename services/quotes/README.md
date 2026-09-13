# AZ Sport Trucks direct quote service

The dedicated `azsporttrucks-quotes` Worker receives `/api/quotes*`, saves the
customer's contact details and normalized truck selections in D1, and emails
Nick a signed private review link. That page renders four views from the saved
selections and the designer's current artwork. Customers email their own truck
photos separately, with their request reference.

## Free-only requirement

Nick explicitly selected a free quote form with photos by email on September
13, 2026. Do not activate R2, purchase Workers Paid, enable usage-based add-ons,
or add another paid provider without new approval. No R2 subscription or bucket
was created. The website form rejects file uploads and limits request bodies to
48 KiB. Private build views are generated from selections, not saved images.

Cloudflare Workers Free and D1 Free stop requests at their included limits;
they do not automatically bill overages. D1 Free currently includes 5 million
rows read and 100,000 rows written daily, with 500 MB per database and 5 GB total.
Sending to Nick's verified destination address is free with Email Routing; the
paid Email Sending upgrade is unnecessary. If a free quota is exhausted, show
an unavailable/error state without falsely confirming receipt. Never solve a
quota error by silently upgrading the account.

## Account and deployment

- Account: `a4d7127a37c46604491a4d8f8d8d5541`.
- D1: `azsporttrucks-quotes`, ID `34c16ddc-8f9e-4574-a14c-fa2ff9b1fdd0`.
  Migration `0001_quotes.sql` is applied; both quote tables were verified remotely.
- Email Routing for `azsporttrucks.com` was activated after confirming there
  were no conflicting MX or TXT records. Sender: `quotes@azsporttrucks.com`.
- `aztruckshootout@gmail.com` is a verified destination, confirmed in the
  dashboard. The email binding restricts delivery to this address.
- Managed Turnstile widget `AZ Sport Trucks Quote Form` is restricted to
  `azsporttrucks.com`; pre-clearance is off. Its public key is in the config.
- `TURNSTILE_SECRET_KEY` and a random 48-byte `QUOTE_ACCESS_SECRET` are stored
  as encrypted Worker secrets. Never print them or put them in source control.
- Wrangler authentication now includes the necessary `workers_scripts:write`
  permission; the initial disabled deployment succeeded.
- `QUOTE_ENABLED` is true. The live website test `AZST-1352118E-A109` was
  saved successfully; D1 confirmed `received`, notification `sent`, one attempt.
  Cloudflare accepted the email; inbox placement is for Nick to confirm.
- Live browser checks confirmed the direct form, automatic Turnstile validation,
  receipt reference, and the photo-email link carrying that reference. No file
  uploads are present. The signed review handler was also checked with a local
  test record under its production security headers; all four images rendered.
- Main frontend commit `343adb7` includes the free form and updated guide. The
  live `designer-BB0G99te.js` asset matched the local production build exactly.

From the repository root, deploy the service with:

```text
pnpm exec wrangler deploy --config services/quotes/wrangler.jsonc
```

The frontend deploys separately through the existing GitHub/Cloudflare build.
Deploy the updated frontend before enabling this service. Verify the disabled
status route first, then a controlled submission, the saved D1 record, private
four-view review, Gmail notification and reply address, and Turnstile. If a
check fails, set `QUOTE_ENABLED` false and redeploy to restore email preparation.
Do not change the existing website Worker or its custom domain; the service
only owns the `/api/quotes*` route.

## Behavior and operations

- Receipt means the request is saved, not that email delivery is confirmed.
  Public responses contain a reference number, never the private review link.
- UUID request keys and fingerprints make identical retries idempotent; a
  changed payload cannot overwrite an earlier request. Durable receipt is
  rechecked if a database acknowledgement is lost.
- Notifications use an outbox with five-minute scheduled retries, leases,
  exponential backoff and a maximum of eight attempts. Inspect only reference
  and status fields when checking failures. Rare uncertain provider outcomes
  may duplicate a notification with the same reference, not the saved request.
- Signed review links expire in 30 days. Pages are private, non-cacheable,
  excluded from indexing and protected against HTML injection. There are no
  public request listings. Treat signed links as confidential.
- Contact fields, request sizes, origin, hostname, challenge action, rate
  limits, honeypot and privacy consent are validated on the server. Rate-limit
  identifiers are hashed. Do not log customer records or private URLs.
- Existing schema asset/lease fields are retained for migration compatibility;
  `assets_json` is always empty. The free service has no file-storage binding.
- No automatic customer-record deletion is configured. Handle individual
  deletion requests deliberately and agree a retention policy with Nick before
  introducing automatic deletion. Expired abuse counters are routinely cleared.
- To retry an identified failed notification after fixing its cause, set that
  record's email_status to pending, email_attempts and email_next_at to zero.

## Verification

`pnpm test` uses real SQLite with mocked email and Turnstile. It covers durable
receipt, missing bindings, retries, quota/storage failure, lost acknowledgements,
private links, all four views, upload rejection, request size and abuse controls.
It sends no real mail. `pnpm exec tsc --noEmit` and `pnpm build` check the client;
Wrangler's `deploy --dry-run` checks the dedicated Worker bundle.

Sources: [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/),
[D1 limits](https://developers.cloudflare.com/d1/platform/limits/),
[email pricing](https://developers.cloudflare.com/email-service/platform/pricing/),
[send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/),
and [Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
