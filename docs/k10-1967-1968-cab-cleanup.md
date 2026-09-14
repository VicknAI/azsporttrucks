# 1967 and 1968 K10 contrasting cab cleanup

September 14, 2026. Nick flagged white contrasting roof paint spilling onto the horizontal door top and cowl in the 1967 and 1968 K10 previews.

Both vehicles now use new `chevrolet-k10-1967-color-v2` and `chevrolet-k10-1968-color-v2` studio packs. The cab/roof masks stop at the pillar bases, window sills and cowl boundaries in all four views. The rear-quarter boundary also excludes the foreground bed rail. Contrasting paint still covers the roof and pillars, as requested for the 1967–1972 pickups.

The straight-front paint masks recover a narrow cowl lip that the old glass exclusion left in the original blue/green. The 1968 side mask also recovers painted outer A-pillar pixels that had been excluded as glass. Those bounded paint repairs retain the original pigment-derived chrome/glass exclusions. Studio images, shading textures, center-band masks, geometry, tire proportions and all Stock/Baja/KMC wheel scenes remain unchanged. Existing v1 paths are preserved; the alternative wheel packs continue to use their existing v1 scenes under the corrected v2 paint masks.

Reproducible authoring and detailed review images are outside the checkout at workspace `assets/k10-1967-1968-cab-cleanup/`. `refine-cab.py` generates the two packs and four-view orange/white, blue/white, solid green and red/black-roof reviews. `verification.json` records that roof coverage only decreases outside the recovered A-pillar, original scenes/textures/center-band masks are unchanged, and body paint changes stay inside the small cowl/pillar repairs. No image generation or new truck artwork was needed.

All 39 repository checks, TypeScript validation and the production build pass. The existing 4WD matrix checks every wheel, view and paint layout, including artwork exports. Local `/design` returned HTTP 200. Artwork files and magnified panel boundaries were visually reviewed; browser interaction testing was not requested. The quote Worker was deployed with the new manifest first, version `34f22247-71a9-4363-a625-ecbc5a947256`, so private quote reviews use the corrected masks too. The service configuration and free-only setup are unchanged.

After the website release, `assets/k10-1967-1968-cab-cleanup/verify-release.py` checks the public client bundle against the local build and verifies all 48 new studio files plus 32 existing alternative wheel scenes. Its `live-release-verification.json` records the deployed commit, timestamp, individual file comparisons and quote availability. Publication is complete only after those public checks pass.
