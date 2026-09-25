import { Designer } from '@/components/designer/designer';
import { pageMetadata, siteUrl } from '@/lib/seo';
import './designer.css';

export const metadata = pageMetadata({
  path: '/design',
  title: 'Classic Truck Color Visualizer & Build Designer | AZ Sport Trucks',
  description: 'Visualize classic Chevy C10, K10, K5 Blazer, Ford pickup and 1979 Bronco paint colors. Try solid and two-tone finishes, compare four views, and share your build with AZ Sport Trucks.',
});

export default function DesignPage() {
  return (
    <Designer>
      <section className="designer-guide" aria-labelledby="designer-guide-title">
        <div className="designer-guide-intro">
          <p className="eyebrow">FROM AN IDEA TO YOUR NEXT BUILD</p>
          <h2 id="designer-guide-title">Classic truck color visualizer</h2>
          <p>See how a new paint scheme could look before planning your build. The AZ Sport Trucks designer lets you compare body colors, solid and two-tone paint layouts, and contrasting roofs on classic pickups, Blazers, and Broncos. Try a factory-inspired combination or make it your own.</p>
        </div>
        <div className="designer-guide-columns">
          <div>
            <h3>Choose your classic truck</h3>
            <p>Explore studio previews for 1967–1987 Chevrolet C10 two-wheel-drive and K10 four-wheel-drive pickups, 1969–1972 Chevrolet K5 Blazers, 1978–1979 Ford F-100 and F-150 pickups, and the 1979 Ford Bronco. Both Ford pickup models support solid and two-tone paint in gloss or satin, plus a contrasting cab roof and pillars. The 1978 pickup previews show the Custom-style round-headlight front end; the 1979 pickup previews use rectangular headlights.</p>
            <p>Choose an earlier C10 or K10 as 1967, 1968, 1969–1970, or 1971–1972. The paired years share the same preview artwork. Square-body C10 and K10 choices each cover seven groups: 1973–1974, 1975–1976, 1977–1979, 1980, 1981–1982, 1983–1984, and 1985–1987. The 1977–1979 Custom Deluxe-style truck pairs round headlights and a dark grille with tan/white paint. The 1980 Silverado-style truck has single rectangular headlights and a silver grille. Later groups show the angular hood and fenders and stacked rectangular headlights, including bumper-mounted front signals on the 1981–1982 preview. Try the white 1981–1982, navy/silver 1983–1984, or black 1985–1987 reference looks.</p>
            <p>Both square-body ranges offer four views, solid and two-tone paint, chrome molding, and wheel options. C10 previews start at a factory-style two-wheel-drive height with street tires. Their contrasting cab treatment colors the roof and cab back while the door window frames retain the body color. In 1987, two-wheel-drive trucks were designated R10 and four-wheel-drive trucks V10; they are included in the 1985–1987 C10 and K10 groups here. On 1967–1972 C10 and K10 pickups, contrasting cab color covers the roof and pillars. K5 options include different hardtop colors and a top-off view. Compare the pictured stance with 2-inch lower, 4-inch lower, or laying frame; lowered K5 previews use street tires with Street, Torq Thrust II, and Rocket Racing Attack wheel choices.</p>
            <p>The 1979 Bronco offers a white, black, or body-color rear hardtop and a Top off option. The fixed steel front cab stays body color. Try its blue/white reference paint or your own colors, with black vinyl upholstery and the pictured lifted stance.</p>
          </div>
          <div>
            <h3>Design, compare, and share</h3>
            <ol>
              <li>Choose a manufacturer, model, and year or year group under Vehicle.</li>
              <li>Open Paint &amp; finish to try a body color, gloss or satin finish, and a solid or two-tone layout.</li>
              <li>Compare side, front three-quarter, rear three-quarter, and straight-front views.</li>
              <li>Share your configuration, save a build on this device, or download a build sheet. Use Request a Quote to start your build inquiry with Nick.</li>
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
