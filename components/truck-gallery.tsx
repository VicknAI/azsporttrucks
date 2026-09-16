'use client';

import { useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';

type Listing = {
  id: string;
  year: number;
  model: 'C10' | 'K10';
  title: string;
  price: number;
  city: string;
  image: string;
  posted: string;
  sourceUrl?: string;
  demo?: boolean;
};

// Add only seller-authorized content. Never scrape or mirror Craigslist ads.
const listings: Listing[] = [];
const examples: Listing[] = [
  { id: 'example-1', year: 1967, model: 'C10', title: '1967 Chevrolet C10', price: 24500, city: 'Phoenix', image: '/designer/studio/chevrolet-c10-1967-stance-v2/drop2/front-quarter/studio.png', posted: '2026-09-15', demo: true },
  { id: 'example-2', year: 1970, model: 'K10', title: '1970 Chevrolet K10', price: 32000, city: 'Flagstaff', image: '/designer/studio/chevrolet-k10-1970-color-v4/front-quarter/studio.png', posted: '2026-09-14', demo: true },
  { id: 'example-3', year: 1967, model: 'C10', title: '1967 Chevrolet C10', price: 18000, city: 'Tucson', image: '/designer/studio/chevrolet-c10-1967-stance-v2/drop4/front-quarter/studio.png', posted: '2026-09-13', demo: true },
];

export function TruckGallery() {
  const [preview, setPreview] = useState(false);
  const [model, setModel] = useState('All');
  const [city, setCity] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');
  const [year, setYear] = useState('');
  const [sort, setSort] = useState('newest');
  const source = preview ? examples : listings;
  const results = source.filter(item =>
    (model === 'All' || item.model === model) &&
    (city === 'All' || item.city === city) &&
    (!maxPrice || item.price <= Number(maxPrice)) &&
    (!year || item.year === Number(year))
  ).sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : b.posted.localeCompare(a.posted));
  const reset = () => { setModel('All'); setCity('All'); setMaxPrice(''); setYear(''); setSort('newest'); };
  return <>
    <div className="finder-mode">
      <p>{preview ? <><strong>Layout preview</strong> — sample prices and locations, using concept artwork. These trucks are not for sale.</> : <><strong>Arizona listings</strong> — no trucks have been added yet.</>}</p>
      <button type="button" onClick={() => { setPreview(!preview); reset(); }}>{preview ? 'Back to listings' : 'Preview the gallery'}</button>
    </div>
    <form className="finder-filters" aria-label="Filter trucks" onSubmit={event => event.preventDefault()}>
      <label>Model<select value={model} onChange={e => setModel(e.target.value)}><option value="All">C10 + K10</option><option>C10</option><option>K10</option></select></label>
      <label>Location<select value={city} onChange={e => setCity(e.target.value)}><option value="All">All Arizona</option>{Array.from(new Set(source.map(item => item.city))).sort().map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Year<input type="number" min="1960" max="1991" placeholder="Any year" value={year} onChange={e => setYear(e.target.value)} /></label>
      <label>Max price ($)<input type="number" min="0" step="500" placeholder="Any price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} /></label>
      <button type="button" onClick={reset}>Reset filters</button>
    </form>
    <div className="finder-results-bar">
      <p aria-live="polite">{results.length} {preview ? 'example' : 'truck'}{results.length === 1 ? '' : 's'} shown</p>
      <label>Sort by <select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
    </div>
    <div className="truck-gallery">
      {results.map(item => <article className="truck-card" key={item.id}>
        <div className="truck-card-image"><img src={item.image} alt={item.demo ? `Concept artwork for ${item.title}; not a truck for sale` : item.title} width="1536" height="1024" loading="lazy" />{item.demo && <span>EXAMPLE · NOT FOR SALE</span>}</div>
        <div className="truck-card-body">
          <p className="truck-card-price">${item.price.toLocaleString('en-US')}{item.demo && <small>Sample price</small>}</p>
          <h2>{item.title}</h2>
          <p className="truck-card-location"><MapPin size={16} aria-hidden="true" />{item.city}, AZ{item.demo && ' · Example location'}</p>
          <div className="truck-card-bottom"><span>{item.model === 'K10' ? '4-wheel drive' : '2-wheel drive'}</span>{item.demo ? <span>Concept preview</span> : item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">View on Craigslist <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>}</div>
        </div>
      </article>)}
    </div>
    {!results.length && <div className="finder-empty"><h2>{source.length ? 'No matching trucks.' : 'The next find starts here.'}</h2><p>{source.length ? 'Try another model, location, year, or price.' : 'Arizona C10 and K10 listings will appear here once seller-approved photos and details are available.'}</p>{source.length ? <button type="button" onClick={reset}>Clear filters</button> : <button type="button" onClick={() => { setPreview(true); reset(); }}>Preview the gallery layout <ArrowUpRight size={17} aria-hidden="true" /></button>}</div>}
    <p className="finder-note">Independent listings are separate from AZ Sport Trucks inventory. Availability is confirmed with the seller. AZ Sport Trucks is not affiliated with Craigslist.</p>
  </>;
}
