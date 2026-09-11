import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { pageMetadata, siteUrl } from '@/lib/seo';

export const metadata = pageMetadata({
  path: '/',
  title: 'Classic Truck Builds & Color Visualizer | AZ Sport Trucks',
  description: 'Classic trucks with modern powertrains, suspension, and braking. Explore pro-touring and off-road builds, or try the AZ Sport Trucks color visualizer.',
});

export default function Home() {
  return <>
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'AZ Sport Trucks', url: `${siteUrl}/`, logo: `${siteUrl}/az-sport-trucks-logo.png`, email: 'Aztruckshootout@gmail.com' },
          { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'AZ Sport Trucks', url: `${siteUrl}/`, publisher: { '@id': `${siteUrl}/#organization` } },
        ],
      }) }} />
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-top"><span className="eyebrow"><i /> AZ SPORT TRUCKS</span><span className="hero-location">TRACK / STREET / OFF-ROAD</span></div>
        <div className="hero-copy"><h1 id="hero-title">CLASSIC TRUCKS.<br />BUILT TO BE<br /><em>DRIVEN HARD.</em></h1><div className="hero-aside"><p>Old-school soul.<br />Built to perform.</p><a className="action" href="#builds">Explore the builds <ArrowDown size={19} aria-hidden="true" /></a></div></div>
        <figure className="hero-image"><img src="/truck-concept.png" alt="Concept illustration of a charcoal pro-touring classic pickup beside a red off-road classic pickup in the Arizona desert" width="1536" height="1024" /><figcaption>BUILD DIRECTION / CONCEPT IMAGE</figcaption></figure>
        <div className="hero-caption"><span>POWER. SUSPENSION. BRAKING.</span><span>BUILT WITH PURPOSE.</span></div>
      </section>
      <section className="visualizer-intro section" aria-labelledby="visualizer-title">
        <div>
          <span className="eyebrow">YOUR TRUCK. YOUR COLORS.</span>
          <h2 id="visualizer-title">PICTURE YOUR<br /><span>NEXT BUILD.</span></h2>
        </div>
        <div>
          <p>Explore paint colors for classic Chevrolet C10 and K10 pickups, K5 Blazers, and Ford trucks. Try solid and two-tone finishes, compare four angles, and share your vision with Nick.</p>
          {/* Native navigation keeps this entry point reliable on the Worker runtime. */}
          <a className="action" href="/design">Design your build <ArrowUpRight size={19} aria-hidden="true" /></a>
        </div>
      </section>
      <section className="builds section" id="builds" aria-labelledby="builds-title">
        <div className="section-heading"><span className="eyebrow">01 / WHAT WE BUILD</span><h2 id="builds-title">TWO DIRECTIONS.<br /><span>ONE OBSESSION.</span></h2><p>Push the limits of what an old truck can do.</p></div>
        <div className="build-grid">
          <article className="build-card"><div className="card-top"><span>01 / THE PAVEMENT</span><ArrowUpRight aria-hidden="true" /></div><h3>PRO-TOURING</h3><p>Classic truck character. Corner-carving capability. Power, suspension, and braking working together for a truck that feels as good as it looks.</p><div className="tags"><span>HANDLING</span><span>POWER</span><span>CONTROL</span></div></article>
          <article className="build-card"><div className="card-top"><span>02 / BEYOND THE PAVEMENT</span><ArrowUpRight aria-hidden="true" /></div><h3>OFF-ROAD</h3><p>Old-school steel with the capability to go further. Purposeful suspension, usable power, and confident braking for the terrain ahead.</p><div className="tags"><span>TRAVEL</span><span>TRACTION</span><span>CAPABILITY</span></div></article>
        </div>
      </section>
      <section className="approach section" id="approach" aria-labelledby="approach-title"><span className="eyebrow">02 / THE APPROACH</span><div><h2 id="approach-title">KEEP THE SOUL.<br /><span>RAISE THE LIMIT.</span></h2><p>We build classic trucks to be driven hard. From corner-carving pro-touring builds to off-road machines, we pair old-school character with modern powertrains, dialed-in suspension, and confident braking. Every build has one purpose: push the limits of what an old truck can do.</p><div className="principles"><span>01 <b>Modern powertrain</b></span><span>02 <b>Dialed-in suspension</b></span><span>03 <b>Braking to match</b></span></div></div></section>
      <section className="contact section" id="contact" aria-labelledby="contact-title">
        <span className="eyebrow">03 / LET’S TALK TRUCKS</span>
        <div><h2 id="contact-title">CONTACT NICK.</h2><p>Tell me about your truck and what you want it to do.</p><a className="action" href="mailto:Aztruckshootout@gmail.com">Aztruckshootout@gmail.com <ArrowUpRight size={19} aria-hidden="true" /></a></div>
      </section>
    </main>
  </>;
}


