import { ArrowUpRight, MapPin } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import './truck-finder.css';

export const metadata = pageMetadata({
  path: '/for-sale/truck-finder',
  title: 'Arizona C10, K10 & K5 Truck Finder | AZ Sport Trucks',
  description: 'Search Craigslist for C10 and K10 trucks and Chevy K5 Blazers across eight Arizona regions. Browse photo galleries, prices, and seller details.',
});

const regions = [
  { name: 'Phoenix', host: 'phoenix', area: 'Phoenix metro & the Valley' },
  { name: 'Tucson', host: 'tucson', area: 'Tucson & surrounding communities' },
  { name: 'Flagstaff / Sedona', host: 'flagstaff', area: 'Northern Arizona' },
  { name: 'Prescott', host: 'prescott', area: 'Prescott & the Quad Cities' },
  { name: 'Mohave County', host: 'mohave', area: 'Kingman, Lake Havasu & Bullhead City' },
  { name: 'Show Low', host: 'showlow', area: 'White Mountains' },
  { name: 'Sierra Vista', host: 'sierravista', area: 'Southeastern Arizona' },
  { name: 'Yuma', host: 'yuma', area: 'Southwestern Arizona' },
];

function searchUrl(host: string, model: 'C10' | 'K10' | 'K5') {
  const letter = model[0].toLowerCase();
  const params = new URLSearchParams({
    query: model === 'K5'
      ? '(k5 | "k-5" | "k 5") (chevy | chevrolet | blazer)'
      : `${letter}10 | "${letter}-10" | "${letter} 10"`,
    sort: 'date',
    hasPic: '1',
  });
  return `https://${host}.craigslist.org/search/cta?${params}#search=1~gallery~0~0`;
}

export default function TruckFinder() {
  return <main id="main" className="section truck-finder">
    <span className="eyebrow">AZ SPORT TRUCKS / ARIZONA</span>
    <h1>TRUCK <em>FINDER.</em></h1>
    <p className="finder-intro">Find your next C10, K10, or Chevy K5 Blazer. Choose an Arizona region to browse photos, prices, and seller details on Craigslist.</p>
    <nav className="sale-categories" aria-label="For sale categories">
      <a href="/for-sale/trucks">Trucks For Sale</a>
      <a href="/for-sale/parts">Parts</a>
      <a href="/for-sale/truck-finder" aria-current="page">Arizona Truck Finder</a>
    </nav>
    <div className="finder-heading"><h2>Where are you looking?</h2><span>8 Arizona regions · Craigslist</span></div>
    <p className="finder-help">Searches open in a new tab, with photos and newest posts first. Set your price and year range on Craigslist.</p>
    <div className="finder-grid">
      {regions.map(region => <section className="finder-region" key={region.host} aria-labelledby={`region-${region.host}`}>
        <MapPin size={22} aria-hidden="true" />
        <h3 id={`region-${region.host}`}>{region.name}</h3>
        <p>{region.area}</p>
        <div className="finder-links">
          {(['C10', 'K10', 'K5'] as const).map(model => <a key={model} href={searchUrl(region.host, model)} target="_blank" rel="noopener noreferrer" aria-label={`Browse ${model === 'K5' ? 'Chevy K5 Blazers' : `${model} trucks`} in ${region.name} on Craigslist (opens in a new tab)`}>
            Browse {model}s <ArrowUpRight size={17} aria-hidden="true" />
          </a>)}
        </div>
      </section>)}
    </div>
    <p className="finder-note">These are regional search shortcuts, not AZ Sport Trucks inventory. Listings and availability are managed by their sellers. Craigslist may also show nearby out-of-state results; check each truck’s location. AZ Sport Trucks is not affiliated with Craigslist.</p>
  </main>;
}
