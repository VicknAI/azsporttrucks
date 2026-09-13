import {
  normalize,
  vehicles,
  type Configuration,
} from '../../lib/designer/manifest';

export const MAX_REQUEST_BYTES = 23 * 1024 * 1024;
export const PREVIEW_VIEWS = [
  'side',
  'front-quarter',
  'rear-quarter',
  'front',
] as const;
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
      'Please acknowledge how your request and photos will be used.',
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
export type Upload = {
  file: File;
  name: string;
  type: string;
  hash: string;
  kind: 'preview' | 'photo';
  label: string;
};
export async function validateUploads(form: FormData): Promise<Upload[]> {
  const specs = [
    ...PREVIEW_VIEWS.map((view) => ({
      field: `preview-${view}`,
      kind: 'preview' as const,
      label: view,
    })),
    ...form
      .getAll('photos')
      .map((_, i) => ({
        field: 'photos',
        index: i,
        kind: 'photo' as const,
        label: `Truck photo ${i + 1}`,
      })),
  ];
  if (form.getAll('photos').length > 3)
    throw new QuoteError(400, 'Choose up to 3 truck photos.');
  const result: Upload[] = [];
  for (const spec of specs) {
    const file =
      'index' in spec
        ? form.getAll(spec.field)[spec.index]
        : form.get(spec.field);
    const max = (spec.kind === 'preview' ? 1.5 : 5) * 1024 * 1024;
    if (!(file instanceof File) || !file.size || file.size > max)
      throw new QuoteError(
        400,
        spec.kind === 'preview'
          ? 'One of the four build views could not be prepared.'
          : 'Each truck photo must be 5 MB or smaller.',
      );
    const data = await file.arrayBuffer();
    const bytes = new Uint8Array(data);
    const png =
      bytes.length > 24 &&
      [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n) &&
      String.fromCharCode(...bytes.slice(12, 16)) === 'IHDR';
    const jpeg =
      bytes.length > 4 &&
      bytes[0] === 255 &&
      bytes[1] === 216 &&
      bytes[2] === 255;
    const webp =
      bytes.length > 16 &&
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    const type = png
      ? 'image/png'
      : jpeg
        ? 'image/jpeg'
        : webp
          ? 'image/webp'
          : '';
    if (!type || type !== file.type || (spec.kind === 'preview' && !png))
      throw new QuoteError(400, 'Upload JPG, PNG, or WebP image files only.');
    if (png) {
      const header = new DataView(data);
      const w = header.getUint32(16);
      const h = header.getUint32(20);
      if (
        !w ||
        !h ||
        w * h > 40000000 ||
        (spec.kind === 'preview' && (w !== 768 || h !== 512))
      )
        throw new QuoteError(400, 'This image has unsupported dimensions.');
    }
    result.push({
      file,
      type,
      hash: await digest(data),
      kind: spec.kind,
      label: spec.label,
      name:
        spec.kind === 'preview'
          ? `${spec.label}.png`
          : `truck-photo-${'index' in spec ? spec.index + 1 : 1}.${png ? 'png' : jpeg ? 'jpg' : 'webp'}`,
    });
  }
  return result;
}
export async function boundedForm(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data;'))
    throw new QuoteError(415, 'Use the quote form to submit your build.');
  if (Number(request.headers.get('content-length')) > MAX_REQUEST_BYTES)
    throw new QuoteError(413, 'The request is too large. Use smaller photos.');
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
        'The request is too large. Use smaller photos.',
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
