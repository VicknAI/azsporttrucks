import type { Metadata } from 'next';
import { SalePage } from '@/components/sale-page';
export const metadata: Metadata = { title: 'Trucks For Sale | AZ Sport Trucks', description: 'Trucks for sale at AZ Sport Trucks. Contact Nick to ask about availability.' };
export default function TrucksForSale() { return <SalePage kind="trucks" />; }
