import { Designer } from '@/components/designer/designer';
import { pageMetadata, siteUrl } from '@/lib/seo';
import './designer.css';

export const metadata = pageMetadata({
  path: '/design',
  title: 'Classic Truck Color Visualizer & Build Designer | AZ Sport Trucks',
  description: 'Visualize classic Chevy C10, K10, K5 Blazer and Ford truck paint colors. Try solid and two-tone finishes, compare four views, and share your build with AZ Sport Trucks.',
});

export default function DesignPage() {
  return (
    <Designer>
      <section className="designer-guide" aria-labelledby="designer-guide-title">
        <div className="designer-guide-intro">
          <p className="eyebrow">FROM AN IDEA TO YOUR NEXT BUILD</p>
          <h2 id="designer-guide-title">Classic truck color visualizer</h2>
          <p>See how a new paint scheme could look before planning your build. The AZ Sport Trucks designer lets you compare body colors, solid and two-tone paint layouts, and contrasting roofs on classic pickups and Blazers. Try a factory-inspired combination or make it your own.</p>
        </div>
        <div className="designer-guide-columns">
          <div>
            <h3>Choose your classic truck</h3>
            <p>Explore studio previews for 1967–1972 Chevrolet C10 two-wheel-drive and K10 four-wheel-drive pickups, 1969–1972 Chevrolet K5 Blazers, and 1978–1979 Ford F-100 and F-150 pickups. Both Ford models support solid and two-tone paint in gloss or satin, plus a contrasting cab roof and pillars. The 1978 previews show the Custom-style round-headlight front end; the 1979 previews use rectangular headlights.</p>
            <p>On C10 and K10 pickups, a contrasting cab color covers the roof and pillars. K5 options include different hardtop colors and a top-off view. Available paint and exterior options follow the selected vehicle.</p>
          </div>
          <div>
            <h3>Design, compare, and share</h3>
            <ol>
              <li>Choose a manufacturer, model, and year under Vehicle.</li>
              <li>Open Paint &amp; finish to try a body color, gloss or satin finish, and a solid or two-tone layout.</li>
              <li>Compare side, front three-quarter, rear three-quarter, and straight-front views.</li>
              <li>Share your configuration, save a build on this device, or download a build sheet. Request a Quote prepares an email for you to send to Nick.</li>
            </ol>
          </div>
        </div>
        <p className="designer-guide-note">Use these previews to explore your direction. Screen colors and artwork are illustrative; final paint, details, and fitment need to be confirmed for your truck. Ready to talk power, suspension, and braking? <a href="/#contact">Contact Nick about your build.</a></p>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'AZ Sport Trucks Classic Truck Color Visualizer',
        url: `${siteUrl}/design`,
        description: 'Compare paint colors, solid and two-tone layouts, and four views of classic Chevrolet and Ford trucks.',
        applicationCategory: 'DesignApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript and a modern web browser.',
        isAccessibleForFree: true,
        publisher: { '@type': 'Organization', name: 'AZ Sport Trucks', url: `${siteUrl}/` },
      }) }} />
    </Designer>
  );
}
