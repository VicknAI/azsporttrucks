# AZ Sport Trucks direct quote service

This dedicated Cloudflare Worker receives `/api/quotes*`, persists records in D1
and image-only uploads in a private R2 bucket, and emails Nick a signed private
review link. The public website retains its existing email preparation flow
until `/api/quotes/status` confirms that the service is enabled and configured.
The service is prepared but **not activated**; Cloudflare sign-in is required.

## Account setup remaining

Use Nick's existing Cloudflare account `a4d7127a37c46604491a4d8f8d8d5541`.
Do not change the existing website Worker or its custom domain.

1. Authenticate Wrangler with `pnpm exec wrangler login`.
2. Create D1 database `azsporttrucks-quotes` and private R2 bucket
   `azsporttrucks-quote-files`. Check account billing requirements before enabling
   any paid service. Do not enable a public bucket domain or `r2.dev` access.
3. Add these real bindings to this directory's `wrangler.jsonc`, keeping
   `QUOTE_ENABLED` false:

```json
{
  "account_id": "a4d7127a37c46604491a4d8f8d8d5541",
  "d1_databases": [{"binding":"QUOTE_DB","database_name":"azsporttrucks-quotes","database_id":"REPLACE_WITH_CREATED_ID","migrations_dir":"migrations"}],
  "r2_buckets": [{"binding":"QUOTE_FILES","bucket_name":"azsporttrucks-quote-files"}],
  "send_email": [{"name":"QUOTE_EMAIL","destination_address":"Aztruckshootout@gmail.com"}],
  "routes": [{"pattern":"azsporttrucks.com/api/quotes*","zone_name":"azsporttrucks.com"}],
  "triggers": {"crons":["*/5 * * * *"]}
}
```

4. Apply `migrations/0001_quotes.sql` with Wrangler D1 migrations. Use the config
   in this directory; never substitute the main site's placeholder database ID.
5. Configure Email Sending for `azsporttrucks.com`; verify
   `Aztruckshootout@gmail.com` as the destination. Review proposed DNS changes
   against existing mail records. Sender: `quotes@azsporttrucks.com`. Replies use
   the customer's validated email. Notifications go only to Nick.
6. Create a managed Turnstile widget restricted to `azsporttrucks.com`. Put its
   public key in `TURNSTILE_SITE_KEY`; save its secret with `wrangler secret put
   TURNSTILE_SECRET_KEY --config services/quotes/wrangler.jsonc` from the repo root.
7. Generate a random secret of at least 32 bytes and save it as
   `QUOTE_ACCESS_SECRET` using Wrangler secret input, without printing it or
   committing it. It signs private links and hashes abuse-limit identifiers.
8. Deploy the service disabled, check routing/status, then enable it for a
   controlled real submission. Confirm D1, all four previews, optional photos,
   email delivery, private link access, and Turnstile on the production domain.
   Obtain authorization before sending that real test notification to Nick.
   If any activation check fails, set `QUOTE_ENABLED` false and redeploy to
   restore the manual email path. Publish enabled only after these checks pass.

## Behavior and operations

- Success means the request and all images are saved, not that an email is
  already delivered. The response contains a reference number only.
- Private review links expire after 30 days. No unauthenticated listings exist.
  Signed links work without a user account; treat them as confidential.
- PNG previews are fixed at 768×512, up to 1.5 MB each. Up to three optional
  JPG/PNG/WebP photos are accepted, at most 5 MB each. Multipart bodies are capped
  at 23 MB while reading. SVG/HTML uploads are not accepted.
- Identical retries reuse the same request key and reference. Changed payloads
  require a new key. Storage failure cannot return a success confirmation.
- Email jobs are retried by the five-minute scheduled handler, with leases and
  backoff, up to eight attempts. Provider acceptance is recorded as `sent`.
  Rare uncertain email outcomes can produce duplicate notifications with the
  same request reference; the saved request is not duplicated.
- Review failed notifications in D1 using only reference/status fields. To retry
  an identified failed notification after correcting email setup, reset its
  email_status to `pending`, email_attempts and email_next_at to zero. This sends
  a fresh private link. Do not print customer records or links in diagnostic logs.
- Records are not automatically deleted. Handle requested deletion by removing
  the row's R2 objects (and any partial attempt prefix) and then the D1 row.
  A retention schedule can be agreed with Nick separately.
- R2 upload failures are cleaned up where possible. An interrupted Worker can
  leave partial uploads; before removing an old prefix, verify its request is
  not received and that no upload lease is active.

## Local verification

`pnpm test` includes real SQLite-backed request tests and mocked private storage,
Turnstile, and email, including failure paths. No email is sent during tests.
`pnpm exec wrangler deploy --dry-run --config services/quotes/wrangler.jsonc`
validates bundling independently of account setup. The main site build validates
the form and its disabled-service fallback.

Sources: Cloudflare [send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/),
[Turnstile validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/),
and [email pricing](https://developers.cloudflare.com/email-service/platform/pricing/).
