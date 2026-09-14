# 1967 C10 and K10 paint boundaries

September 14, 2026. Align the 1967 C10 two-tone layout and contrasting cab with the approved 1967 K10 side/front pattern, and repair the K10 center band in its two three-quarter views.

The C10 uses `chevrolet-c10-1967-color-v4` and `chevrolet-c10-1967-stance-v2`. The center band follows the upper shoulder and lower stamped body creases in the side and three-quarter views, including the front-fender edge, door/bed transitions, and tailgate panel. Cab contrast covers the roof and pillars while stopping above the horizontal door top and cowl. The three lowered stance packs use the same revised masks, translated through the existing body occlusion masks at their original offsets.

The K10 uses `chevrolet-k10-1967-color-v3`. Only the front-quarter and rear-quarter center-band masks change. Its approved side and straight-front packs are identical to v2, and its existing cab/roof masks are retained in every view.

All original studio scenes, paint textures, body silhouettes, wheel geometry, and stance geometry remain unchanged. Solid paint without a contrasting roof renders identically before and after the changes. Existing 18/20-inch Torq Thrust and Rocket Attack C10 wheels, and Baja/KMC K10 wheels, continue to use the same aligned scenes.

Authoring scripts, before/after views, and verification reports are in the sibling `assets/chevy-1967-paint-cleanup` folder. Review covers orange/white and blue/white two-tone, solid green, a black contrasting roof, and satin paint with a contrasting roof. All 20 view/stance packs and 100 wheel/view/stance combinations were checked for paint alignment. The existing designer and quote tests also exercise shared builds, wheel/stance selection, and offline exports.

Release checks: run the existing test suite, TypeScript check, and production build; deploy the quote Worker with the updated shared manifest; then publish the main site. Verify the production client bundle, all 120 referenced studio assets, all 80 alternative-wheel scenes, and quote availability against the tested local release.
