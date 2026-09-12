import { ArrowUpRight } from 'lucide-react';
export function SiteFooter() {
 return <footer><a className="footer-name" href="/">AZ SPORT TRUCKS <ArrowUpRight size={20} aria-hidden="true" /></a><p>Old-school soul. Built to perform.</p><a className="footer-calculator" href="/tire-calculator">Tire Size Calculator ↗</a><span>© {new Date().getFullYear()} AZ Sport Trucks</span></footer>;
}
