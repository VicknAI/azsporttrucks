import { pageMetadata } from '@/lib/seo';
import { TruckGallery } from '@/components/truck-gallery';
import './truck-finder.css';

export const metadata = pageMetadata({
  path: '/for-sale/truck-finder',
  title: 'Arizona C10 & K10 Truck Finder | AZ Sport Trucks',
  description: 'Browse the Arizona C10 and K10 truck finder. Filter trucks by model, year, location, and price.',
});

export default function TruckFinder() {
  return <main id="main" className="section truck-finder">
    <span className="eyebrow">AZ SPORT TRUCKS / ARIZONA</span>
    <h1>TRUCK <em>FINDER.</em></h1>
    <p className="finder-intro">C10s. K10s. Your next Arizona truck.</p>
    <nav className="sale-categories" aria-label="For sale categories">
      <a href="/for-sale/trucks">Trucks For Sale</a>
      <a href="/for-sale/parts">Parts</a>
      <a href="/for-sale/truck-finder" aria-current="page">Arizona Truck Finder</a>
    </nav>
    <TruckGallery />
  </main>;
}
