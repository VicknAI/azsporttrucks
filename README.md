# AZ Sport Trucks website

Includes the homepage, For Sale menu, Trucks For Sale page, Parts page, contact email, and brand assets.

## Run locally

Requires Node.js 22.13 or later and pnpm.

1. Open a terminal in this folder.
2. Run `pnpm install`.
3. Run `pnpm dev` and open the local address printed in the terminal.

To build for deployment, run `pnpm build`.

## Main files

- `app/page.tsx`: homepage copy and sections.
- `app/globals.css`: site styling and responsive layouts.
- `components/site-header.tsx`: top navigation and For Sale menu.
- `components/sale-page.tsx`: shared sale page layout and empty listing messages.
- `app/for-sale/trucks/page.tsx`: Trucks For Sale page.
- `app/for-sale/parts/page.tsx`: Parts page.
- `public/`: logo and concept truck image.

The truck image is illustrative concept imagery, not a completed customer build. Inventory pages currently contain no listings. Contact links open the visitor's email application; there is no contact form backend or checkout.

This project uses React, Vinext, and the Sites hosting integration. The included `.openai/hosting.json` identifies the existing private Site; it is not a credential. No passwords, API keys, or source repository credentials are included. Cloudflare serves azsporttrucks.com and www.azsporttrucks.com from the azsporttrucks Worker, connected to main in this repository.

## Vehicle designer preview

The /design page is a public Phase 1 prototype. It includes 20 individual model/year entries, a studio artwork study for the 1967 C10 front-quarter view, and clearly labelled schematic artwork for the remaining views. Wheel styles and some trim selections are recorded but not visualized in the studio study; artwork and fitment are not factory verified.

Drafts and saved builds stay in the visitor's browser. Request a Quote prepares an email to Aztruckshootout@gmail.com; the visitor must send it from their email app and attach the downloaded build sheet and truck photos manually. No automatic submission, CRM, upload service, or email delivery backend is configured. Build sheets embed raster artwork for offline viewing. Shared links contain configuration only, never contact details or photos.

Validate with pnpm test, pnpm exec oxlint lib/designer components/designer/designer.tsx, and pnpm build. The worker name is set to azsporttrucks in vite.config.ts to target the existing Cloudflare service.
