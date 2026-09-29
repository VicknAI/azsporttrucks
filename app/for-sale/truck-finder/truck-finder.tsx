'use client';

import { useState } from 'react';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { ArrowUpRight, MapPin } from 'lucide-react';


const arizonaRegions = [
  { name: 'Phoenix', host: 'phoenix', area: 'Phoenix metro & the Valley' },
  { name: 'Tucson', host: 'tucson', area: 'Tucson & surrounding communities' },
  { name: 'Flagstaff / Sedona', host: 'flagstaff', area: 'Northern Arizona' },
  { name: 'Prescott', host: 'prescott', area: 'Prescott & the Quad Cities' },
  { name: 'Mohave County', host: 'mohave', area: 'Kingman, Lake Havasu & Bullhead City' },
  { name: 'Show Low', host: 'showlow', area: 'White Mountains' },
  { name: 'Sierra Vista', host: 'sierravista', area: 'Southeastern Arizona' },
  { name: 'Yuma', host: 'yuma', area: 'Southwestern Arizona' },
];

const states = {
  AZ: { name: "Arizona", regions: arizonaRegions },
  CA: { name: "California", regions: [
  {
    "name": "Bakersfield",
    "host": "bakersfield",
    "area": "Bakersfield & Kern County"
  },
  {
    "name": "Chico",
    "host": "chico",
    "area": "Chico & surrounding communities"
  },
  {
    "name": "Fresno / Madera",
    "host": "fresno",
    "area": "Fresno & Madera counties"
  },
  {
    "name": "Gold Country",
    "host": "goldcountry",
    "area": "Sierra Nevada foothills"
  },
  {
    "name": "Hanford / Corcoran",
    "host": "hanford",
    "area": "Kings County"
  },
  {
    "name": "Humboldt County",
    "host": "humboldt",
    "area": "Eureka, Arcata & the North Coast"
  },
  {
    "name": "Imperial County",
    "host": "imperial",
    "area": "El Centro & the Imperial Valley"
  },
  {
    "name": "Inland Empire",
    "host": "inlandempire",
    "area": "Riverside & San Bernardino"
  },
  {
    "name": "Los Angeles",
    "host": "losangeles",
    "area": "Los Angeles County"
  },
  {
    "name": "Mendocino County",
    "host": "mendocino",
    "area": "Ukiah, Fort Bragg & surrounding communities"
  },
  {
    "name": "Merced",
    "host": "merced",
    "area": "Merced County"
  },
  {
    "name": "Modesto",
    "host": "modesto",
    "area": "Modesto & Stanislaus County"
  },
  {
    "name": "Monterey Bay",
    "host": "monterey",
    "area": "Monterey, Salinas & surrounding communities"
  },
  {
    "name": "Orange County",
    "host": "orangecounty",
    "area": "Orange County communities"
  },
  {
    "name": "Palm Springs",
    "host": "palmsprings",
    "area": "Coachella Valley"
  },
  {
    "name": "Redding",
    "host": "redding",
    "area": "Redding & surrounding communities"
  },
  {
    "name": "Sacramento",
    "host": "sacramento",
    "area": "Sacramento metro area"
  },
  {
    "name": "San Diego",
    "host": "sandiego",
    "area": "San Diego County"
  },
  {
    "name": "San Francisco Bay Area",
    "host": "sfbay",
    "area": "San Francisco, East Bay & South Bay"
  },
  {
    "name": "San Luis Obispo",
    "host": "slo",
    "area": "San Luis Obispo County"
  },
  {
    "name": "Santa Barbara",
    "host": "santabarbara",
    "area": "Santa Barbara & surrounding communities"
  },
  {
    "name": "Santa Maria",
    "host": "santamaria",
    "area": "Santa Maria Valley"
  },
  {
    "name": "Siskiyou County",
    "host": "siskiyou",
    "area": "Yreka, Mount Shasta & surrounding communities"
  },
  {
    "name": "Stockton",
    "host": "stockton",
    "area": "Stockton & San Joaquin County"
  },
  {
    "name": "Susanville",
    "host": "susanville",
    "area": "Susanville & Lassen County"
  },
  {
    "name": "Ventura County",
    "host": "ventura",
    "area": "Ventura, Oxnard & surrounding communities"
  },
  {
    "name": "Visalia / Tulare",
    "host": "visalia",
    "area": "Tulare County"
  },
  {
    "name": "Yuba / Sutter",
    "host": "yubasutter",
    "area": "Yuba City, Marysville & surrounding communities"
  }
] },
};

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
  const [state, setState] = useState<'AZ' | 'CA'>('AZ');
  const { name: stateName, regions } = states[state];
  return <main id="main" className="section truck-finder">
    <span className="eyebrow">AZ SPORT TRUCKS / {stateName.toUpperCase()}</span>
    <h1>CRAIGSLIST<br />TRUCK <em>FINDER.</em></h1>
    <p className="finder-intro">Find your next C10, K10, or Chevy K5 Blazer. Choose a state and region to browse photos, prices, and seller details on Craigslist.</p>
    <nav className="sale-categories" aria-label="For sale categories">
      <a href="/for-sale/trucks">Trucks For Sale</a>
      <a href="/for-sale/parts">Parts</a>
      <a href="/for-sale/truck-finder" aria-current="page">Craigslist Truck Finder</a>
    </nav>
    <div className="finder-heading"><h2>Where are you looking?</h2><span aria-live="polite">{regions.length} {stateName} regions · Craigslist</span></div>
    <div className="finder-state"><label htmlFor="finder-state">State</label><NativeSelect id="finder-state" value={state} onChange={event => setState(event.target.value === "CA" ? "CA" : "AZ")}><NativeSelectOption value="AZ">Arizona (AZ)</NativeSelectOption><NativeSelectOption value="CA">California (CA)</NativeSelectOption></NativeSelect></div>
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
