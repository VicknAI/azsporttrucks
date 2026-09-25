'use client';
import { ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
export function SiteHeader() {
  const pathname = usePathname();
  return <header className="site-header">
    <a href="/" className="brand" aria-label="AZ Sport Trucks home"><img src="/az-sport-trucks-logo.png" alt="AZ Sport Trucks" width="1536" height="1024" /></a>
    <nav aria-label="Main navigation">
      <a href="/#builds">Builds</a>
      <a href="/design" aria-current={pathname === '/design' ? 'page' : undefined}>Design Your Build</a>
      <DropdownMenu><DropdownMenuTrigger className="nav-menu-trigger" data-active={pathname.startsWith('/for-sale') || undefined}>For Sale <ChevronDown size={15} aria-hidden="true" /></DropdownMenuTrigger>
        <DropdownMenuContent className="nav-menu" sideOffset={14}>
          <DropdownMenuItem className="nav-menu-item" render={<a href="/for-sale/trucks" aria-label="Trucks For Sale" aria-current={pathname === '/for-sale/trucks' ? 'page' : undefined} />}>Trucks For Sale</DropdownMenuItem>
          <DropdownMenuItem className="nav-menu-item" render={<a href="/for-sale/parts" aria-label="Parts" aria-current={pathname === '/for-sale/parts' ? 'page' : undefined} />}>Parts</DropdownMenuItem>
          <DropdownMenuItem className="nav-menu-item" render={<a href="/for-sale/truck-finder" aria-label="Arizona Truck Finder" aria-current={pathname === '/for-sale/truck-finder' ? 'page' : undefined} />}>Arizona Truck Finder</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <a href="/#approach">Our approach</a>
      <DropdownMenu><DropdownMenuTrigger className="nav-menu-trigger" data-active={['/resources', '/chassis', '/tire-calculator'].includes(pathname) || undefined}>Resources <ChevronDown size={15} aria-hidden="true" /></DropdownMenuTrigger>
        <DropdownMenuContent className="nav-menu resources-menu" align="end" sideOffset={14}>
          <DropdownMenuItem className="nav-menu-item" render={<a href="/chassis" aria-label="Chassis Guide" aria-current={pathname === '/chassis' ? 'page' : undefined} />}>Chassis Guide</DropdownMenuItem>
          <DropdownMenuItem className="nav-menu-item" render={<a href="/tire-calculator" aria-label="Tire Size Calculator" aria-current={pathname === '/tire-calculator' ? 'page' : undefined} />}>Tire Size Calculator</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
    <span className="header-tag">OLD-SCHOOL SOUL.<br /><b>BUILT TO PERFORM.</b></span>
  </header>;
}


