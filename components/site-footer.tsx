import { ArrowUpRight } from 'lucide-react';
import { SocialLinks } from '@/components/social-links';
export function SiteFooter() {
 return <footer className="site-footer">
   <div className="footer-main">
     <div className="footer-brand"><a className="footer-name" href="/">AZ SPORT TRUCKS <ArrowUpRight size={20} aria-hidden="true" /></a><p>Old-school soul. Built to perform.</p></div>
     <SocialLinks />
   </div>
   <div className="footer-bottom"><a className="footer-resources" href="/resources">Resources ↗</a><a href="/privacy">Privacy</a><span className="footer-copyright">© {new Date().getFullYear()} AZ Sport Trucks</span></div>
 </footer>;
}
