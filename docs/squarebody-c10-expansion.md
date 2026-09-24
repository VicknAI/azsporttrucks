# Square-body C10 expansion

## Scope — September 24, 2026

Nick requested C10 versions of the existing square-body K10 year and body groups, then explicitly selected **factory-style height with street tires** as the starting appearance.

| Designer selection | Existing body artwork retained |
| --- | --- |
| 1973–1974 C10 | 1973–1974 K10 color v4 |
| 1975–1976 C10 | 1975–1976 K10 color v2 |
| 1977–1979 C10 | 1977–1979 K10 color v2 |
| 1980 C10 | 1980 K10 color v1 |
| 1981–1982 C10 | 1981–1982 K10 color v1 |
| 1983–1984 C10 | 1983–1984 K10 color v1 |
| 1985–1987 C10 | 1985–1987 K10 color v1 |

The pictured body configuration continues the regular-cab Fleetside pickup already used in the designer. These grouped illustrations retain the previously approved body, front-end, bright trim, glass and lighting details. A group represents a body/front-end family; it does not imply that all factory trim and equipment were identical throughout those years. Earlier 1967–1972 C10 selections remain separate.

## Artwork and paint

Two generated four-view donor sheets supply the early and late C10 street tires, wheels and two-wheel-drive running gear. Original year-specific body pixels and aligned paint layers are retained through the existing native asset-authoring workflow. Each C10 group receives its own studio pack rather than referring to a K10 or 1971 C10 chassis. Source sheets, prompts, contours, build scripts and review outputs are kept in workspace `assets/squarebody-c10-expansion/` outside the site checkout.

The stock illustration follows the requested factory-style stance. It is a visual design study rather than a measured suspension, wheel or tire fitment specification. The generation brief calls for silver five-lug Rally/steel-style wheels, street tread and independent front suspension, without 4WD locking hubs or a front drive axle.

Body, center-band and cab paint remain editable in all four views. The approved square-body treatment keeps complete upper door frames in body color, with contrasting paint on the roof and cab back. Cab corrections are baked into the C10 mask assets so they can follow any registered ride-height artwork without relying on fixed SVG coordinates. The existing K10 cab corrections remain in their own packs.

The early-family cab masks match across 1973–1980 and the late-family masks match across 1981–1987. Their respective cab corrections therefore carry through every matching C10 group. They do not change the original K10 PNGs.

Each C10 pack includes stock, 2-inch lower, 4-inch lower and laying-frame views, plus the existing C10 Torq Thrust II and Rocket Attack choices in 18- and 20-inch visual proportions. The factory-style stock configuration remains the default. The native authoring checks preserve body pixels and translate all paint layers together at lower heights; alternative wheel scenes change only the bounded wheel-face regions. The same files serve interactive previews, shared builds, self-contained exports and private quote reviews.

## Reference facts

- [GM's 1975 C10 collection record](https://www.gm.com/heritage/collection/chevrolet-trucks/1975-chevrolet-c-10-pickup) documents the C10's Fleetside/Stepside configurations and two wheelbases. The current expansion mirrors the already selected Fleetside artwork; it does not add a Stepside selector.
- [GM's original 1987 truck information](https://news.chevrolet.com/content/dam/company/no_search/heritage-archive-docs/vehicle-information-kits/chevrolet-trucks/1987-Chevrolet-Truck.pdf) uses R10 for the two-wheel-drive regular-cab pickup and lists independent front suspension with coil springs. The requested 1985–1987 C10 group includes the 1987 R10, explained in the model guide alongside the existing V10 note.
- [Coker's GM pickup Rallye wheel documentation](https://cokertire.com/oe-style-gm-pickup-rallye-wheels) distinguishes five-lug wheels for 1971–1998 Chevrolet/GMC half-ton two-wheel-drive pickups from six-lug K10/K5 applications. This informs the artwork brief without claiming exact factory fitment for every pictured trim.

## Verification and release status

Completed locally on September 24, 2026. All 1,120 new PNG assets decode at 768 × 512. The asset workflow passes 112 body-preservation checks and 448 wheel-preservation checks, plus mask containment and translated-layer alignment. Independent visual review covers all 28 stock views; representative optional wheel and stance sheets were also reviewed after cleanup of bumper edges, wheelhouse shadows, mirrors and undercarriage opacity.

The full repository suite passes 41/41 tests. After final PNG writes, all 22 designer tests pass again, including every C10 wheel/stance/view export. TypeScript, focused lint and the production build pass. Separate catalog verification preserves 1,817 existing renders, with only the 15 combinations affected by the three previously requested K10 cab corrections differing from HEAD. All 25 existing vehicles keep their previous defaults and summaries. All 28 new C10 stock views pass self-contained export and share checks. Quote tests retain each new group, paint, stance and wheels in private build reviews.

Browser verification exercises all seven new year groups in all four views, confirms the 13-entry C10 selector, and checks combined ride-height/wheel-size changes with the correct registered artwork. Included in the authorized [September 24 designer release](designer-release-2026-09-24.md), covering both the website and quote Worker.
