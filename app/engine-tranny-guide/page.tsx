import { ArrowUpRight } from 'lucide-react';
import { pageMetadata } from '@/lib/seo';
import './powertrain.css';

export const metadata = pageMetadata({
  path: '/engine-tranny-guide',
  title: 'Engine/Tranny Guide | GM & Ford Performance | AZ Sport Trucks',
  description: 'Explore factory GM/Chevrolet Performance and Ford Racing engines, transmissions, and complete powertrain packages for your classic truck build.',
});

const chevrolet = 'https://www.chevrolet.com/performance-parts';
const ford = 'https://performanceparts.ford.com';

const gmLineup = [
  { name: 'LS / LSX', models: 'LS3 · LS364 · LS376 · LSX376 · LSX454', description: 'Explore production-based LS options and the performance-focused LSX family.', url: `${chevrolet}/crate-engines/ls-lsx-engines` },
  { name: 'LT / L8', models: 'LT1 · LT4 · L8T · L8P', description: 'Modern direct-injected V8s, including naturally aspirated and supercharged choices.', url: `${chevrolet}/crate-engines/lt-engines` },
  { name: 'Racing Engines', models: 'CT350 · CT400 · CT525 · 525 RLB', description: 'Circle-track engines and the off-road racing 525 RLB. Match the engine to your competition requirements.', url: `${chevrolet}/crate-engines/racing-engines`, competition: true },
];

const fordLineup = [
  { name: 'Coyote / Aluminator', models: '5.0L Coyote · Aluminator · 5.2L options', description: 'Modern overhead-cam V8s. Match the engine generation to its control pack.', url: `${ford}/engines/Default.asp` },
  { name: '7.3L', models: 'Godzilla · Megazilla', description: 'Large-displacement pushrod V8 choices with dedicated control requirements.', url: `${ford}/engines/Default.asp` },
  { name: 'Sealed Racing Engines', models: 'S347JR2 · D347SR · D347SR7', description: '347-based circle-track choices. Check series rules and ordering requirements.', url: `${ford}/engines/Default.asp`, competition: true },
];

type Lineup = typeof gmLineup;

function FactoryLineup({ id, brand, title, items, url }: { id: string; brand: string; title: string; items: Lineup; url: string }) {
  return <article className="powertrain-brand" id={id} aria-labelledby={`${id}-title`}>
    <div className="powertrain-brand-heading"><span className="eyebrow">{brand}</span><h3 id={`${id}-title`}>{title}</h3><a className="powertrain-source" href={url} target="_blank" rel="noopener noreferrer">Official engine catalog <ArrowUpRight size={16} aria-hidden="true" /></a></div>
    <ul className="powertrain-lineup">
      {items.map(item => <li key={item.name}>
        <div className="powertrain-item-title"><h4>{item.name}</h4>{item.competition && <span className="powertrain-badge">Competition</span>}</div>
        <p className="powertrain-models">{item.models}</p><p>{item.description}</p>
        <a className="powertrain-source" href={item.url} target="_blank" rel="noopener noreferrer">Explore factory options <ArrowUpRight size={15} aria-hidden="true" /></a>
      </li>)}
    </ul>
  </article>;
}

export default function EngineTrannyGuidePage() {
  return <main id="main" className="powertrain-page">
    <header className="powertrain-intro">
      <p className="eyebrow"><i aria-hidden="true" /> AZ SPORT TRUCKS / BUILD PLANNING</p>
      <h1>ENGINE / TRANNY<br /><em>GUIDE.</em></h1>
      <p>The right power. The right gears. A truck that works as a whole.</p>
      <p>Explore factory performance engines, transmissions and matched packages from GM and Ford. Start with how you want to drive, then build the combination around it.</p>
      <nav className="powertrain-jump-links" aria-label="Engine and transmission guide sections"><a href="#factory-lineup">Factory lineup <span aria-hidden="true">↓</span></a><a href="#transmissions">Transmissions <span aria-hidden="true">↓</span></a><a href="#powertrain-packages">Matched packages <span aria-hidden="true">↓</span></a><a href="#plan-your-swap">Plan your swap <span aria-hidden="true">↓</span></a></nav>
    </header>

    <section id="factory-lineup" className="powertrain-section" aria-labelledby="factory-lineup-title">
      <div className="powertrain-section-heading"><span className="eyebrow">STRAIGHT FROM THE SOURCE</span><h2 id="factory-lineup-title">FACTORY PERFORMANCE<br /><span>LINEUP.</span></h2><p>An overview of the factory engine families and selected racing options. Follow the manufacturer links for individual specifications, current availability and package contents.</p></div>
      <div className="powertrain-grid">
        <FactoryLineup id="gm-lineup" brand="GM" title="CHEVROLET PERFORMANCE" items={gmLineup} url={`${chevrolet}/crate-engines`} />
        <FactoryLineup id="ford-lineup" brand="FORD" title="FORD RACING / PERFORMANCE PARTS" items={fordLineup} url={`${ford}/engines/Default.asp`} />
      </div>
      <p className="powertrain-review-date">Manufacturer listings reviewed November 24, 2026. Confirm the exact part number, vehicle fitment and permitted use before ordering.</p>
    </section>

    <section id="transmissions" className="powertrain-section" aria-labelledby="transmissions-title">
      <div className="powertrain-section-heading"><span className="eyebrow">PUT THE POWER TO WORK</span><h2 id="transmissions-title">MATCH THE ENGINE.<br /><span>CHOOSE YOUR GEARS.</span></h2><p>Engine torque, truck weight, gearing and intended use all belong in the transmission conversation. Choose the engine, controls and transmission together.</p></div>
      <div className="powertrain-grid">
        <article className="powertrain-transmission-card"><span className="eyebrow">GM / CHEVROLET PERFORMANCE</span><h3>AUTOMATIC & MANUAL</h3><dl><div><dt>Four-speed automatics</dt><dd>SuperMatic 4L65-E, 4L70-E, 4L75-E and 4L85-E.</dd></div><div><dt>Six-, eight- & ten-speed automatics</dt><dd>SuperMatic 6L80-E, 8L90-E and 10L90-E.</dd></div><div><dt>Six-speed manual</dt><dd>Super Magnum.</dd></div></dl><p>Use Chevrolet’s package listings to confirm the engine pairing, controller, converter or clutch, and installation kit.</p><a className="powertrain-source" href={`${chevrolet}/transmissions`} target="_blank" rel="noopener noreferrer">Chevrolet transmission lineup <ArrowUpRight size={16} aria-hidden="true" /></a></article>
        <article className="powertrain-transmission-card"><span className="eyebrow">FORD RACING / PERFORMANCE PARTS</span><h3>AUTOMATIC & MANUAL</h3><dl><div><dt>Automatic power modules</dt><dd>Coyote packages with a 10R80 automatic.</dd></div><div><dt>Five-speed manuals</dt><dd>TREMEC TKX and upgraded T-5 options in Ford’s catalog.</dd></div><div><dt>Six-speed manuals</dt><dd>TREMEC six-speed and Magnum XL options.</dd></div></dl><p>Confirm the exact transmission application, engine generation and control pack. Bellhousing, clutch and shifter requirements vary by combination.</p><div className="powertrain-source-links"><a className="powertrain-source" href={`${ford}/category/30/Manual-Trans`} target="_blank" rel="noopener noreferrer">Ford manual transmissions <ArrowUpRight size={16} aria-hidden="true" /></a><a className="powertrain-source" href={`${ford}/special-vehicle/Hot_Rod`} target="_blank" rel="noopener noreferrer">Power modules & controls <ArrowUpRight size={16} aria-hidden="true" /></a></div></article>
      </div>
    </section>

    <section id="powertrain-packages" className="powertrain-section" aria-labelledby="packages-title">
      <div className="powertrain-section-heading"><span className="eyebrow">START WITH A MATCHED COMBINATION</span><h2 id="packages-title">ENGINE. TRANS.<br /><span>WORKING TOGETHER.</span></h2></div>
      <div className="powertrain-grid">
        <article className="powertrain-package"><span className="eyebrow">CHEVROLET PERFORMANCE</span><h3>CONNECT & CRUISE</h3><p>Factory-matched engine and transmission combinations with the specified controls and installation components. Compare the exact package for your chosen engine.</p><a className="powertrain-source" href={`${chevrolet}/crate-engines/engine-transmission-packages`} target="_blank" rel="noopener noreferrer">Explore Connect & Cruise <ArrowUpRight size={18} aria-hidden="true" /></a></article>
        <article className="powertrain-package"><span className="eyebrow">FORD RACING / PERFORMANCE PARTS</span><h3>COYOTE POWER MODULES</h3><p>Ford lists Gen 4X Coyote power modules with a 10R80 automatic or a six-speed manual. Review the module contents and control requirements before planning the installation.</p><a className="powertrain-source" href={`${ford}/special-vehicle/Hot_Rod`} target="_blank" rel="noopener noreferrer">Explore Ford power modules <ArrowUpRight size={18} aria-hidden="true" /></a></article>
      </div>
    </section>

    <section id="plan-your-swap" className="powertrain-section" aria-labelledby="swap-title">
      <div className="powertrain-section-heading"><span className="eyebrow">PLAN THE COMPLETE BUILD</span><h2 id="swap-title">MORE THAN<br /><span>AN ENGINE SWAP.</span></h2></div>
      <div className="powertrain-planning-grid">
        <article><h3>HOW YOU DRIVE</h3><p>Street cruising, track time and trail use place different demands on the combination. Start with your driving goals, tire size and axle gearing.</p><a className="powertrain-source" href="/tire-calculator">Compare tire sizes <ArrowUpRight size={16} aria-hidden="true" /></a></article>
        <article><h3>WHAT FITS</h3><p>Plan engine mounts, oil-pan clearance, exhaust, accessories, the transmission tunnel, crossmember and driveshaft. A 4×4 build also needs a compatible transfer-case arrangement.</p><a className="powertrain-source" href="/chassis">Explore chassis options <ArrowUpRight size={16} aria-hidden="true" /></a></article>
        <article><h3>WHAT IT NEEDS</h3><p>Allow for fuel delivery, cooling, wiring, controls and calibration, plus the correct converter or clutch. Build the budget around the installed combination.</p><a className="powertrain-source" href={`${chevrolet}/owners-support/installation-guides`} target="_blank" rel="noopener noreferrer">GM installation references <ArrowUpRight size={16} aria-hidden="true" /></a></article>
      </div>
    </section>
    <section className="powertrain-help" aria-labelledby="powertrain-help-title"><div><span className="eyebrow">LET’S TALK ABOUT YOUR BUILD</span><h2 id="powertrain-help-title">PLAN YOUR<br /><span>POWERTRAIN.</span></h2></div><div><p>Tell Nick your truck’s year and model, how you’ll use it, your power goals and whether you want an automatic or a manual.</p><a className="action" href="mailto:Aztruckshootout@gmail.com?subject=Engine%20and%20transmission%20help">Talk with Nick <ArrowUpRight size={18} aria-hidden="true" /></a></div></section>
  </main>;
}
