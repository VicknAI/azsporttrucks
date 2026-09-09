import type { Metadata } from 'next';
import { Designer } from '@/components/designer/designer';
import './designer.css';
export const metadata: Metadata = {
  title: 'Design Your Build | AZ Sport Trucks',
  description:
    'Local Phase 1 vehicle designer prototype. Configure a classic truck build.',
  robots: { index: false, follow: false },
};
export default function DesignPage() {
  return <Designer />;
}
