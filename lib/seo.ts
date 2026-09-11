import type { Metadata } from 'next';

export const siteUrl = 'https://azsporttrucks.com';

export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `${siteUrl}${path}`;
  const image = {
    url: `${siteUrl}/truck-concept.png`,
    width: 1536,
    height: 1024,
    alt: 'AZ Sport Trucks classic street and off-road pickup concepts',
  };
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: 'AZ Sport Trucks',
      locale: 'en_US',
      url,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
