import {
  normalize,
  vehicles,
  type Configuration,
} from '../../lib/designer/manifest';

export const MAX_REQUEST_BYTES = 48 * 1024;
export class QuoteError extends Error {
  constructor(
    public status: number,
    message: string,
    public code = 'INVALID_REQUEST',
  ) {
    super(message);
  }
}
export const encoder = new TextEncoder();
export async function digest(value: string | ArrayBuffer) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    typeof value === 'string' ? encoder.encode(value) : value,
  );
  return [...new Uint8Array(bytes)]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
}
export async function sign(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return [
    ...new Uint8Array(
      await crypto.subtle.sign('HMAC', key, encoder.encode(message)),
    ),
  ]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
}
export async function validSignature(
  secret: string,
  message: string,
  signature: string,
) {
  if (!/^[a-f0-9]{64}$/.test(signature)) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify(
    'HMAC',
    key,
    Uint8Array.from(signature.match(/../g)!, (n) => parseInt(n, 16)),
    encoder.encode(message),
  );
}
export function text(
  form: FormData,
  name: string,
  limit: number,
  required = true,
) {
  const value = form.get(name);
  if (
    typeof value !== 'string' ||
    value.length > limit ||
    (required && !value.trim()) ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
  ) {
    throw new QuoteError(400, `Check the ${name} field and try again.`);
  }
  return value.trim();
}
export function validateFields(form: FormData) {
  if (form.get('companyWebsite'))
    throw new QuoteError(400, 'Unable to submit this request.');
  if (form.get('privacyConsent') !== 'yes')
    throw new QuoteError(
      400,
      'Please acknowledge how your request details will be used.',
    );
  const contact = Object.fromEntries(
    [
      'name',
      'email',
      'phone',
      'location',
      'ownsTruck',
      'budget',
      'timeline',
      'description',
    ].map((name) => [
      name,
      text(
        form,
        name,
        name === 'description'
          ? 3000
          : ['budget', 'timeline'].includes(name)
            ? 120
            : 160,
      ),
    ]),
  );
  if (
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(contact.email) ||
    /[\r\n]/.test(contact.email)
  )
    throw new QuoteError(400, 'Enter a valid email address.');
  if (!['Yes', 'No', 'Currently shopping'].includes(contact.ownsTruck))
    throw new QuoteError(400, 'Choose whether you already own the truck.');
  let raw: unknown;
  try {
    raw = JSON.parse(text(form, 'configuration', 12000));
  } catch {
    throw new QuoteError(
      400,
      'Your build could not be read. Please try again.',
    );
  }
  if (
    !raw ||
    typeof raw !== 'object' ||
    !vehicles.some((v) => v.id === (raw as Configuration).vehicleId)
  )
    throw new QuoteError(400, 'Choose a supported truck.');
  return { contact, configuration: normalize(raw as Partial<Configuration>) };
}
export async function boundedForm(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data;'))
    throw new QuoteError(415, 'Use the quote form to submit your build.');
  if (Number(request.headers.get('content-length')) > MAX_REQUEST_BYTES)
    throw new QuoteError(
      413,
      'The request is too large. Shorten the project details and send photos by email.',
    );
  const reader = request.body?.getReader();
  if (!reader) throw new QuoteError(400, 'The request is empty.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > MAX_REQUEST_BYTES) {
      await reader.cancel();
      throw new QuoteError(
        413,
        'The request is too large. Shorten the project details and send photos by email.',
      );
    }
    chunks.push(value);
  }
  try {
    return await new Response(new Blob(chunks as BlobPart[]), {
      headers: { 'content-type': contentType },
    }).formData();
  } catch {
    throw new QuoteError(
      400,
      'The request could not be read. Please try again.',
    );
  }
}
