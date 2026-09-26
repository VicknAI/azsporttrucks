# K5 lowered street previews

## Requested scope

All four existing Chevrolet K5 selections (1969, 1970, 1971 and 1972) gain 2-inch lower, 4-inch lower and laying-frame previews with C10-style street tires and wheel choices. The 1969/1970 models share the 1970 artwork family; 1971/1972 share the 1972 family. Model IDs, default paint, default roof, and the default pictured stance remain unchanged.

**As pictured** retains the original stock-scene paths, tires and Stock, American Racing Baja, and KMC wheel choices. A lowered height enables Street, Torq Thrust II 18/20, and Rocket Racing Attack 18/20. Switching between stock and lowered heights resets an incompatible wheel selection to the base scene; switching between lowered heights or roof states retains a supported selection. Lowered configurations use the Lowered direction in saved and quoted builds.

These are illustrative suspension, wheel and tire previews. The pictured tire dimensions and wheel proportions are not final fitment specifications. Laying frame represents a parked vehicle with air suspension fully lowered.

## Artwork registration

The existing stock top-on v6 and top-off v5 packs and all stock off-road wheel scenes remain intact. Each lowered pack has separate top-on and top-off layers:

- `/designer/studio/chevrolet-k5-{1970|1972}-street-stance-v1/{top-on|top-off}/{drop2|drop4|frame}/{view}/`
- Six pack files: `studio.png`, `paint-texture.png`, `paint-mask.png`, `center-band-mask.png`, `cab-mask.png`, `roof-mask.png`.
- `/designer/wheels/chevrolet-k5-{1970|1972}-{torq|rocket-attack}-v1/{top-on|top-off}/{18|20}/{drop2|drop4|frame}/{view}.png`

The base lowered `studio.png` contains the Street wheel scene, using the existing `street-temp` configuration ID. No vehicle or wheel IDs are renamed. Across the two source families, two roof states, three lowered heights and four views, the contract contains 288 layered-pack PNGs and 192 alternative-wheel scenes.

`openTopStanceRoots` resolves the correct lowered Top off pack before selecting its paint layers. The shared `availableWheelIds` helper filters by height and roof state and requires matching artwork in all four views, so UI choices and normalized shared, saved and quoted builds agree. The renderer, offline export and private quote review use the same manifest.

## Verification and release

Regression coverage preserves stock K5 builds, checks incompatible wheel fallback, and exercises every K5 year, roof, lowered height and street wheel choice. Drafts and shared builds preserve selected colors, finishes, wheels and heights. Export coverage reads every new layered pack and alternative wheel scene; quote coverage includes both stock off-road builds and the new lowered combinations.

All 50 repository tests, TypeScript, focused lint and the production build pass, along with the quote Worker dry run. The existing guide-anchor lint rule is excluded from the focused check. Native and independent visual review cover all 48 base scenes; wheel verification covers 192 scenes, with 144 bounded face updates and 48 byte-identical straight-front views. Browser checks cover all four K5 years, height-dependent wheel choices, 18/20-inch sizes, hardtop colors and all four lowered Top off views. The regression audit preserves all 6,432 existing renders and 4,326 existing artwork files. Publish and verify the new static assets before the quote Worker references them, coordinating frontend availability with the updated quote normalizer so lowered submissions retain their selections.

Native authoring, built-in image-generation prompts, source provenance and release verification are retained in workspace assets/k5-street-stance. The rear-quarter frame view uses a fractional perspective adjustment across the actual body planes, applied consistently to body, interior, paint texture and masks to keep the far front tire covered and edges smooth.

## Street-tire proportions — September 26, 2026

The lowered K5 tires were too large compared with the C10 previews. All four K5 years now use smaller street tires across every lowered height, roof state and view. Native tire geometry is scaled to 82% of the previous diameter, with each floor contact and axle position retained. The base Rally wheels scale with the tires; optional 18- and 20-inch Torq Thrust II and Rocket Racing Attack rims retain their relative physical sizes and align with the revised tire centers.

The 2- and 4-inch body positions follow the smaller tires; laying frame retains its parked body position. Current hood cleanup, two-tone contours, roof masks and model-specific details are carried forward together. Existing pictured-height previews remain unchanged.

Every lowered paint pack now uses `chevrolet-k5-{1970|1972}-street-stance-v3`; all lowered Torq/Rocket wheel scenes use v3. These new paths cover 288 paint-pack files and 192 alternate-wheel scenes. Authoring, pixel-preservation checks, visual review and public-release verification are retained in workspace `assets/k5-street-tire-size/`.

All 50 repository tests, TypeScript, focused lint, the production build and quote Worker dry run pass. The native build preserves all 1,328 prior K5 PNGs. Regression comparison preserves all 31 defaults and 2,632 saved configurations/summaries, 5,068 unrelated renders and 1,296 pictured-height K5 renders; lowered renders differ only by the intended v3 paths. Browser review confirms the requested 1972 side preview and 20-inch Torq Thrust option.

## Lowered wheel-lip alignment — September 26, 2026

The 1972 laying-frame preview exposed misregistered 18-inch Rocket Attack rims. Native target ellipses were too narrow and leftward in the front-quarter view; the far rim also sat too high. Full metal-lip measurements correct both quarter views for Torq Thrust II and Rocket Attack in both sizes. The masks cover the previous Rally lip and retain the real tire sidewall outside the chosen rim.

All 192 lowered alternate-wheel scenes now use v4 paths. The Street base scenes, smaller tires, body position and every paint pack remain v3. The far rear-quarter source crop also follows the complete donor rim, excluding a body/background fragment that previously notched the lip. The 18/20 size relationship is preserved. Authoring, magnified old/new comparisons, pixel-preservation checks and release verification are retained in workspace `assets/k5-street-wheel-alignment/`.

Independent verification covers all 192 scenes and 524,720 visible bright Rally-metal pixels with no uncovered remnants. All body/paint pixels, the 48 edge-on front scenes, all 480 prior v3 files and all 1,296 tracked K5 studio files remain unchanged. Magnified review checks the actual metal boundaries at 4–5× scale. All 50 tests pass; comparison with c87c767 preserves every configuration and all renders except the intended lowered alternate-wheel URL versions.
