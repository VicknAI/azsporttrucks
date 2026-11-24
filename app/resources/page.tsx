import { ArrowUpRight } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import './resources.css';

export const metadata = pageMetadata({
  path: '/resources',
  title: 'Truck Build Resources | AZ Sport Trucks',
  description: 'Plan your classic truck build with chassis options, a GM and Ford Engine/Tranny Guide, and the AZ Sport Trucks Tire Size Calculator.',
});

export default function ResourcesPage() {
  return (
    <main id="main" className="resources-page">
      <header className="resources-heading">
        <p className="eyebrow"><i aria-hidden="true" /> AZ SPORT TRUCKS / BUILD PLANNING</p>
        <h1>RESOURCES<em>.</em></h1>
        <p>Explore chassis options, plan your powertrain and compare tire sizes for your next truck build.</p>
      </header>
      <div className="resources-grid">
        <a className="resources-card" href="/chassis" aria-labelledby="resource-chassis-title">
          <span className="resources-card-category">THE FOUNDATION</span>
          <h2 id="resource-chassis-title">CHASSIS<br />GUIDE</h2>
          <p>Compare chassis options by how you drive, truck fitment, and what each package includes.</p>
          <span className="resources-card-link">Explore the guide <ArrowUpRight aria-hidden="true" size={21} /></span>
        </a>
        <a className="resources-card" href="/engine-tranny-guide" aria-labelledby="resource-powertrain-title">
          <span className="resources-card-category">THE POWERTRAIN</span>
          <h2 id="resource-powertrain-title">ENGINE / TRANNY<br />GUIDE</h2>
          <p>Explore factory GM and Ford performance engines, transmissions and matched powertrain packages.</p>
          <span className="resources-card-link">Explore the guide <ArrowUpRight aria-hidden="true" size={21} /></span>
        </a>
        <a className="resources-card" href="/tire-calculator" aria-labelledby="resource-tires-title">
          <span className="resources-card-category">THE DETAILS</span>
          <h2 id="resource-tires-title">TIRE SIZE<br />CALCULATOR</h2>
          <p>Compare tire sizes side by side, from overall height and width to estimated speedometer changes.</p>
          <span className="resources-card-link">Compare tire sizes <ArrowUpRight aria-hidden="true" size={21} /></span>
        </a>
      </div>
    </main>
  );
}
