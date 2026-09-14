import { ChassisGuide } from '@/components/chassis-guide';
import { pageMetadata } from '@/lib/seo';
import './chassis.css';

export const metadata = pageMetadata({ path: '/chassis', title: 'Find the Right Chassis for Your Truck | AZ Sport Trucks', description: 'Compare full chassis options for classic C10, K10, K20 and K5 trucks by intended use, fitment, package contents and manufacturer.' });

export default function ChassisPage() {
  return <main id="main" className="chassis-page">
    <section className="chassis-intro">
      <span className="eyebrow"><i /> THE AZ SPORT TRUCKS CHASSIS GUIDE</span>
      <h1>Find the Right Chassis<br /><em>for Your Truck.</em></h1>
      <p>Classic trucks have timeless style—but today’s builds ask more of them. The 1972 Chevy C10’s most powerful factory engine offered 210 net horsepower. Today, a modern performance V8 can deliver over 400 hp before the upgrades even begin. With posted highway limits reaching 85 mph and track speeds climbing higher, the foundation deserves as much attention as the engine.</p>
      <p>At AZ Sport Trucks, we believe your performance build should start with a new, full chassis designed for today’s demands. Whether you’re building for the street, a mix of street and track, or dedicated track use, explore the options below and find the right foundation for your truck.</p>
      <details className="intro-sources"><summary>Sources behind the numbers</summary><a href="https://photos.autohunter.com/assets/media/aded018d-9c55-41bc-af4b-a82904dec146.pdf" target="_blank" rel="noopener noreferrer">1972 Chevrolet truck brochure</a><a href="https://www.chevrolet.com/performance-parts/crate-engines/ls-lsx-engines" target="_blank" rel="noopener noreferrer">Chevrolet Performance engines</a><a href="https://www.txdot.gov/safety/driving-laws/speed-limits/limits.html" target="_blank" rel="noopener noreferrer">Texas highway speed limits</a></details>
    </section>
    <ChassisGuide />
  </main>;
}
