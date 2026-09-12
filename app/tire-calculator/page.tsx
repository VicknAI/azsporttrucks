import { TireCalculator } from '@/components/tire-calculator';
import { pageMetadata, siteUrl } from '@/lib/seo';
import './tire-calculator.css';

export const metadata = pageMetadata({
  path: '/tire-calculator',
  title: 'Tire Size Calculator & Comparison | AZ Sport Trucks',
  description: 'Compare metric and inch tire sizes with a scale diagram. Calculate tire diameter, width, sidewall height, clearance changes and estimated speedometer differences.',
});

export default function TireCalculatorPage() {
  return <main id="main" className="tire-page">
    <header className="tire-page-heading">
      <div><p className="eyebrow"><i /> AZ SPORT TRUCKS / TOOLS</p><h1>TIRE SIZE <em>CALCULATOR.</em></h1>
        <p>See what changes before you change tires.</p></div>
      <a className="tire-back-link" href="/design">Back to the truck designer ↗</a>
    </header>
    <TireCalculator />
    <section className="tire-explainer" aria-labelledby="tire-explainer-title">
      <div><p className="eyebrow">READ THE SIDEWALL</p><h2 id="tire-explainer-title">A FEW NUMBERS.<br />THE WHOLE PICTURE.</h2></div>
      <div><h3>Metric · 265/70R17</h3><p><strong>265</strong> is the section width in millimeters. <strong>70</strong> means the sidewall is 70% of that width. <strong>R17</strong> means radial construction on a 17-inch wheel.</p>
        <h3>Inches · 33×12.50R15</h3><p><strong>33</strong> is the nominal tire diameter, <strong>12.50</strong> is the section width, and <strong>15</strong> is the wheel diameter—all in inches.</p></div>
      <div><h3>What the numbers tell you</h3><p>Diameter is wheel diameter plus two sidewalls. A 2-inch increase in tire diameter raises the axle by roughly 1 inch. The speed estimate assumes your speedometer is calibrated to the current tire size.</p>
        <p>These are nominal, unloaded dimensions. Actual size and rolling revolutions vary with tire model, wheel width, inflation, load, and wear. Dimensions alone do not confirm clearance or fitment.</p>
        <a href="https://www.michelinman.com/auto/auto-tips-and-advice/tires-101/tire-markings-explained" target="_blank" rel="noreferrer">Michelin’s guide to tire markings ↗</a></div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'WebApplication', name: 'AZ Sport Trucks Tire Size Calculator & Comparison',
      url: `${siteUrl}/tire-calculator`, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any',
      isAccessibleForFree: true, description: 'Calculate nominal tire dimensions and compare metric or inch tire sizes.',
      publisher: { '@type': 'Organization', name: 'AZ Sport Trucks', url: siteUrl },
    }) }} />
  </main>;
}
