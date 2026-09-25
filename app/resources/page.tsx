import { ArrowUpRight } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import './resources.css';

export const metadata = pageMetadata({
  path: '/resources',
  title: 'Truck Build Resources | AZ Sport Trucks',
  description: 'Plan your classic truck build with the AZ Sport Trucks Chassis Guide and Tire Size Calculator. Explore chassis options and compare tire sizes.',
});

export default function ResourcesPage() {
  return (
    <main id="main" className="resources-page">
      <header className="resources-heading">
        <p className="eyebrow"><i aria-hidden="true" /> AZ SPORT TRUCKS / BUILD PLANNING</p>
        <h1>RESOURCES<em>.</em></h1>
        <p>Explore chassis options and compare tire sizes for your next truck build.</p>
      </header>
      <div className="resources-grid">
        <a className="resources-card" href="/chassis" aria-labelledby="resource-chassis-title">
          <span className="resources-card-category">01 / THE FOUNDATION</span>
          <h2 id="resource-chassis-title">CHASSIS<br />GUIDE</h2>
          <p>Compare chassis options by how you drive, truck fitment, and what each package includes.</p>
          <span className="resources-card-link">Explore the guide <ArrowUpRight aria-hidden="true" size={21} /></span>
        </a>
        <a className="resources-card" href="/tire-calculator" aria-labelledby="resource-tires-title">
          <span className="resources-card-category">02 / THE DETAILS</span>
          <h2 id="resource-tires-title">TIRE SIZE<br />CALCULATOR</h2>
          <p>Compare tire sizes side by side, from overall height and width to estimated speedometer changes.</p>
          <span className="resources-card-link">Compare tire sizes <ArrowUpRight aria-hidden="true" size={21} /></span>
        </a>
      </div>
    </main>
  );
}
