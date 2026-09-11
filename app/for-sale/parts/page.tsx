import { pageMetadata } from '@/lib/seo';
import { SalePage } from '@/components/sale-page';
export const metadata = pageMetadata({ path: '/for-sale/parts', title: 'Parts | AZ Sport Trucks', description: 'Truck parts at AZ Sport Trucks. Contact Nick with your parts inquiry.' });
export default function Parts() { return <SalePage kind="parts" />; }
