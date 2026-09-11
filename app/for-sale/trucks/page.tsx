import { pageMetadata } from '@/lib/seo';
import { SalePage } from '@/components/sale-page';
export const metadata = pageMetadata({ path: '/for-sale/trucks', title: 'Trucks For Sale | AZ Sport Trucks', description: 'Trucks for sale at AZ Sport Trucks. Contact Nick to ask about availability.' });
export default function TrucksForSale() { return <SalePage kind="trucks" />; }
