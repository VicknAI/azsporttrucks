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
