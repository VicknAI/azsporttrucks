import { ArrowUpRight, Truck, Wrench } from 'lucide-react';
import { Empty, EmptyHeader, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
export function SalePage({ kind }: { kind: 'trucks' | 'parts' }) {
 const trucks = kind === 'trucks';
 return <main id="main" className="sale-page section">
   <span className="eyebrow">AZ SPORT TRUCKS / FOR SALE</span>
   <h1>{trucks ? <>TRUCKS<br /><em>FOR SALE.</em></> : <>PARTS<span className="red-period">.</span></>}</h1>
   <nav className="sale-categories" aria-label="For sale categories"><a href="/for-sale/trucks" aria-current={trucks ? 'page' : undefined}>Trucks For Sale</a><a href="/for-sale/parts" aria-current={!trucks ? 'page' : undefined}>Parts</a></nav>
   <Empty className="sale-empty"><EmptyHeader><EmptyMedia>{trucks ? <Truck size={36} aria-hidden="true" /> : <Wrench size={36} aria-hidden="true" />}</EmptyMedia><h2>No {kind} listed yet.</h2><EmptyDescription className="sale-description">{trucks ? 'Looking for your next truck? Contact Nick to ask about availability.' : 'Looking for a specific part? Contact Nick with what you need.'}</EmptyDescription></EmptyHeader><a className="action" href={`mailto:Aztruckshootout@gmail.com?subject=${encodeURIComponent(trucks ? 'Truck availability' : 'Parts inquiry')}`}>Contact Nick <ArrowUpRight size={19} aria-hidden="true" /></a></Empty>
 </main>;
}
