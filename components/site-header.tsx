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
      <DropdownMenu><DropdownMenuTrigger className="sale-trigger" data-active={pathname.startsWith('/for-sale') || undefined}>For Sale <ChevronDown size={15} aria-hidden="true" /></DropdownMenuTrigger>
        <DropdownMenuContent className="sale-menu" sideOffset={14}>
          <DropdownMenuItem className="sale-menu-item" render={<a href="/for-sale/trucks" aria-current={pathname === '/for-sale/trucks' ? 'page' : undefined} />}>Trucks For Sale</DropdownMenuItem>
          <DropdownMenuItem className="sale-menu-item" render={<a href="/for-sale/parts" aria-current={pathname === '/for-sale/parts' ? 'page' : undefined} />}>Parts</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <a href="/#approach">Our approach</a>
    </nav>
    <span className="header-tag">OLD-SCHOOL SOUL.<br /><b>BUILT TO PERFORM.</b></span>
  </header>;
}


