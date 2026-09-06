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

This project uses React, Vinext, and the Sites hosting integration. The included `.openai/hosting.json` identifies the existing private Site; it is not a credential. No passwords, API keys, or source repository credentials are included. The custom domain azsporttrucks.com is not connected yet.
