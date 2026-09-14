/* oxlint-disable next/no-img-element -- Manufacturer-hosted photos use native lazy loading and graceful failure handling. */
'use client';
import { useState } from 'react';
import { ArrowUpRight, Gauge, Flag, Mountain, Route, Truck } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { chassis, trucks, type Chassis } from '@/lib/chassis-data';
import images from '@/lib/chassis-images.json';

const money = (n: number) => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const road = [
  { name:'Street', tagline:'Enjoy every mile.', copy:'Comfort, cruising and everyday driving.', icon:Truck },
  { name:'Street & Track', tagline:'Drive it. Then push it.', copy:'Street manners with autocross and track-day capability.', icon:Gauge },
  { name:'Track-Focused', tagline:'Build around performance.', copy:'Competition-led builds where setup and tuning take priority.', icon:Flag },
];
const trail = [
  { name:'Street', tagline:'Classic look. Modern comfort.', copy:'Road comfort and everyday 4×4 drivability.', icon:Truck },
  { name:'Street & Trail', tagline:'Beyond the pavement.', copy:'Highway miles and off-road use in the same build.', icon:Route },
  { name:'Off-Road Focused', tagline:'Built for demanding terrain.', copy:'Heavy-duty configurations for more challenging trails.', icon:Mountain },
];
function Card({item, selected, onCompare}: {item:Chassis; selected:boolean; onCompare:()=>void}) {
  const picture = (images as Record<string,{url:string;representative?:boolean}>)[item.id];
  const [failed,setFailed] = useState(false);
  return <article className="chassis-card">
    {picture && !failed && <figure><img src={picture.url} alt={`${item.brand} ${item.name} chassis`} loading="lazy" onError={()=>setFailed(true)} /><figcaption>{picture.representative?'Manufacturer family photo · configuration varies':'Manufacturer photo · options may be shown'}</figcaption></figure>}
    <div className="chassis-card-body">
      <span className="chassis-brand">{item.brand}</span><h3>{item.name}</h3>
      <p className="chassis-summary">{item.summary}</p>
      <div className="chassis-price">{item.price ? <><span>Starting at</span> {money(item.price)}</>:'Request a quote'}</div>
      <span className="chassis-price-caption">{item.price?'Configuration and extras affect final cost.':'Confirm your application and package.'}</span>
      <details className="chassis-details"><summary>View details & track record</summary>
        <h4>Key features</h4><p>{item.features}</p>
        <h4>Before you choose</h4><p>{item.consideration}</p>
        {item.priceNote && <p>{item.priceNote}</p>}
        <h4>Track record</h4><p>{item.history || 'Specifications sourced from the manufacturer. Model launch date and firsthand AZ Sport Trucks experience have not yet been documented in this guide.'}</p>
        {item.historyUrl && <a className="chassis-evidence" href={item.historyUrl} target="_blank" rel="noopener noreferrer">Read the supporting source <ArrowUpRight size={14}/></a>}
        <span className="chassis-source-note">Manufacturer information reviewed September 14, 2026. Category placement is our provisional editorial assessment, not a performance certification.</span>
      </details>
      <div className="chassis-card-actions"><a href={item.url} target="_blank" rel="noopener noreferrer">Visit manufacturer <ArrowUpRight size={16} aria-hidden="true"/></a><button type="button" aria-pressed={selected} onClick={onCompare}>{selected?'✓ Selected':'Compare +'}</button></div>
    </div>
  </article>;
}

export function ChassisGuide() {
  const [truckId,setTruckId]=useState('c67');
  const [ids,setIds]=useState<string[]>([]);
  const [message,setMessage]=useState('');
  const truck=trucks.find(t=>t.id===truckId)!;
  const categories=truck.four?trail:road;
  const entries=chassis.filter(c=>c.apps.includes(truckId));
  const compared=chassis.filter(c=>ids.includes(c.id));
  function toggle(id:string) {
    if(ids.includes(id)){setIds(ids.filter(i=>i!==id));setMessage('');}
    else if(ids.length<3){setIds([...ids,id]);setMessage('');}
    else setMessage('You can compare up to three chassis. Remove one to add another.');
  }
  return <>
    <section className="chassis-selector" aria-labelledby="choose-truck">
      <div><span className="chassis-step">01 / START WITH YOUR TRUCK</span><h2 id="choose-truck">Choose your truck.</h2></div>
      <div className="chassis-select-wrap"><label id="truck-label" htmlFor="truck-picker">Model & generation</label><Select value={truckId} onValueChange={value=>{if(value){setTruckId(value);setIds([]);setMessage('');}}} items={trucks.map(t=>({value:t.id,label:t.name}))}><SelectTrigger id="truck-picker" aria-labelledby="truck-label" className="chassis-select"><SelectValue /></SelectTrigger><SelectContent className="chassis-select-menu">{trucks.map(t=><SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
    </section>
    <section className="chassis-results" aria-labelledby="chassis-results-title">
      <div className="chassis-results-top"><div><span className="chassis-step">02 / FIND YOUR DRIVING STYLE</span><h2 id="chassis-results-title">{truck.name}</h2></div><p aria-live="polite">{entries.length} options to explore · {truck.four?'4×4':'2WD'}</p></div>
      <p className="chassis-editor-note">Choose by how you drive. These are use categories, not quality rankings. Exact year, bed length, drivetrain and package fitment should be confirmed with the manufacturer.</p>
      <div className="chassis-columns" key={truckId}>{categories.map((category,index)=>{
        const Icon=category.icon;const group=entries.filter(i=>i.category===index);
        return <section key={category.name} className={`chassis-column chassis-column-${index}`} aria-labelledby={`category-${index}`}>
          <header className="chassis-category-head"><div><Icon size={27} aria-hidden="true"/><span>{String(index+1).padStart(2,'0')}</span></div><h3 id={`category-${index}`}>{category.name}</h3><strong>{category.tagline}</strong><p>{category.copy}</p><span className="chassis-count">{group.length} {group.length===1?'option':'options'}</span></header>
          <div className="chassis-stack">{group.length?group.map(item=><Card key={item.id} item={item} selected={ids.includes(item.id)} onCompare={()=>toggle(item.id)}/>):<div className="chassis-empty"><Flag size={28}/><h4>Still researching this category.</h4><p>We haven’t identified a suitable option for this truck in this category yet. Explore the adjacent options or talk with us about your build.</p></div>}</div>
        </section>;
      })}</div>
    </section>
    {ids.length>0 && <aside className="chassis-compare-bar" aria-label="Selected chassis"><span>{ids.length} of 3 selected</span><a href="#compare-chassis">Compare selections ↓</a><button type="button" onClick={()=>{setIds([]);setMessage('');}}>Clear</button></aside>}
    <output className="chassis-message" aria-live="polite">{message}</output>
    {compared.length>0 && <section id="compare-chassis" className="chassis-comparison"><span className="chassis-step">YOUR SHORTLIST</span><h2>Side by side.</h2><p>Select up to three chassis above. Starting prices cover different equipment.</p><div className="chassis-table-scroll" aria-label="Chassis comparison table"><table><thead><tr><th scope="col">Compare</th>{compared.map(i=><th scope="col" key={i.id}>{i.brand}<br/>{i.name}<button onClick={()=>toggle(i.id)} aria-label={`Remove ${i.brand} ${i.name} from comparison`}>Remove</button></th>)}</tr></thead><tbody>
      {(['Intended use','Starting price','Key features','Considerations'] as const).map(label=><tr key={label}><th scope="row">{label}</th>{compared.map(i=><td key={i.id}>{label==='Intended use'?i.summary:label==='Starting price'?`${i.price?money(i.price):'Request a quote'}. ${i.priceNote||'Confirm selected equipment and extras.'}`:label==='Key features'?i.features:i.consideration}</td>)}</tr>)}
      <tr><th scope="row">Learn more</th>{compared.map(i=><td key={i.id}><a href={i.url} target="_blank" rel="noopener noreferrer">Visit manufacturer ↗</a></td>)}</tr>
    </tbody></table></div></section>}
    <section className="chassis-help"><div><span className="chassis-step">LET’S TALK ABOUT YOUR BUILD</span><h2>Not sure where<br/>to start?</h2></div><div><p>Tell us about your truck, power goals, driving style and budget. We’ll help you narrow down the right foundation.</p><a className="action" href={`mailto:Aztruckshootout@gmail.com?subject=${encodeURIComponent('Chassis help: '+truck.name)}`}>Talk with AZ Sport Trucks <ArrowUpRight size={18}/></a></div></section>
  </>;
}
