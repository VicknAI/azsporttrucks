import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
export const metadata: Metadata = {
  title: 'AZ Sport Trucks | Old-school soul. Built to perform.',
  description: 'Classic trucks built to be driven hard. AZ Sport Trucks pairs old-school character with modern powertrains, dialed-in suspension, and confident braking for pro-touring and off-road builds.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><SiteHeader />{children}<SiteFooter /></body></html>;
}


