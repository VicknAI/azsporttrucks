import { pageMetadata } from '@/lib/seo';
import TruckFinder from './truck-finder';
import './truck-finder.css';

export const metadata = pageMetadata({
  path: '/for-sale/truck-finder',
  title: 'Craigslist Truck Finder | AZ Sport Trucks',
  description: 'Search Craigslist for C10 and K10 trucks and Chevy K5 Blazers across 28 states, including the western U.S., Great Lakes, and Florida. Choose a state and browse regional photos, prices, and seller details.',
});

export default function TruckFinderPage() {
  return <TruckFinder />;
}
