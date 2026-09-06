import type { Metadata } from 'next';
import { SalePage } from '@/components/sale-page';
export const metadata: Metadata = { title: 'Parts | AZ Sport Trucks', description: 'Truck parts at AZ Sport Trucks. Contact Nick with your parts inquiry.' };
export default function Parts() { return <SalePage kind="parts" />; }
