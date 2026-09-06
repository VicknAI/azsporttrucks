import { ArrowUpRight } from 'lucide-react';
export function SiteFooter() {
 return <footer><a className="footer-name" href="/">AZ SPORT TRUCKS <ArrowUpRight size={20} aria-hidden="true" /></a><p>Old-school soul. Built to perform.</p><span>© {new Date().getFullYear()} AZ Sport Trucks</span></footer>;
}
