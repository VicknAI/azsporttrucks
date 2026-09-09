import { summary, type Configuration } from './manifest';

export const quoteRecipient = 'Aztruckshootout@gmail.com';

export type QuoteEmail = { subject: string; body: string; href: string };

/** Build a draft only. Opening a mail link cannot confirm delivery. */
export function prepareQuoteEmail(input: {
  buildNumber: string;
  contact: Record<string, string>;
  configuration: Configuration;
  photoCount: number;
}): QuoteEmail {
  const details = summary(input.configuration);
  const subject = `AZ Sport Trucks quote — ${details.Vehicle} — ${input.buildNumber}`;
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
  const body = [
    'Hi Nick,',
    '',
    'I would like to discuss this truck build.',
    `Build number: ${input.buildNumber}`,
    '',
    ...Object.entries(contactLabels).map(
      ([key, label]) => `${label}: ${input.contact[key] || ''}`,
    ),
    '',
    'BUILD CONFIGURATION',
    ...Object.entries(details).map(([key, value]) => `${key}: ${value}`),
    '',
    'The designer artwork is a concept. Please confirm final parts and fitment.',
    '',
    'Before sending: attach the downloaded build sheet for the four concept views.',
    ...(input.photoCount
      ? [
          `Also attach my ${input.photoCount} truck photo${input.photoCount === 1 ? '' : 's'} separately.`,
        ]
      : []),
  ].join('\n');
  const full = `mailto:${quoteRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  // Mail clients differ in their URI limits. Keep long requests intact in the
  // copyable message instead of silently truncating the customer's description.
  const href =
    full.length <= 1800
      ? full
      : `mailto:${quoteRecipient}?subject=${encodeURIComponent(subject)}`;
  return { subject, body, href };
}
