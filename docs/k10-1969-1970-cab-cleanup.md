# 1969–1970 K10 contrasting cab cleanup

September 14, 2026. Nick requested consistent contrasting roof-and-pillar paint in the front-quarter, rear-quarter and straight-front views. The existing side profile was nearly correct and is retained byte-for-byte.

The paired `Chevrolet-K10-1969-1970` entry now uses `chevrolet-k10-1970-color-v5`. All six side-view assets remain identical to v4. The other views have revised cab/roof and body-paint masks: complete outer A/B pillars, body-color cowl and door tops, exclusion of the foreground bed rail from rear cab contrast, and no roof-color overlay inside the rear glass. Small original-paint gaps around the cargo light and across the roof slab are filled while retaining the light and window hardware.

The original studio scenes, lighting textures and center-band masks are unchanged in all four views. Upper/lower moldings, truck shape, ride height, tires and all Stock/Baja/KMC wheel scenes remain intact. Pixel comparisons confirm each alternative wheel scene matches the stock body exactly within the corrected areas. The existing v1 wheel packs work with the corrected v5 paint masks; old studio packs remain available.

Authoring is outside the checkout at workspace `assets/k10-1969-1970-cab-cleanup/`. `inspect-cab.py` records source, mask and orange/white detail grids; `refine-cab.py` creates the new pack and preservation checks in `verification.json`. Five four-view scenarios cover orange/white, blue/white, solid green, red/black roof, and charcoal/yellow contrasting roof in satin. Magnified cowl, pillar, cargo-light, rear-glass and foreground-bed boundaries were visually reviewed. No generation or truck geometry changes were required.

All 39 repository checks, TypeScript validation and the production build pass. The legacy paired-year sharing test now expects v5 and retains checks for colors, roof, finish, wheels and all four views. Local `/design` returned HTTP 200; browser interaction testing was not requested. The quote Worker was deployed first with the corrected manifest, version `47cabd08-924a-45dc-b051-646703348f3f`. Its bindings and the free-only service configuration are unchanged.

After publication, `assets/k10-1969-1970-cab-cleanup/verify-release.py` compares the public client bundle with the local build and checks all 24 v5 studio assets plus 16 existing alternative-wheel scenes. The release commit, timestamp, file checks and quote availability are recorded outside the checkout in `live-release-verification.json`. Confirm those checks pass before reporting the public update complete.
