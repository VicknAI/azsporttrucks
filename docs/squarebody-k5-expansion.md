# 1973–1975 Chevrolet K5 expansion

The designer adds a 1973–1974 K5 group and a separate 1975 selection. The two families have independent front-end artwork and retain the user’s 1975 reference vehicle’s proportions, factory-style height, thin-whitewall street tires and stock wheel covers. The earlier 1969, 1970, 1971 and 1972 selections keep their existing IDs and artwork.

Both new selections start with the “Teal / white reference look”: body `#176572`, secondary `#f1eee5`, two-tone paint, White top and the pictured height. These are screen approximations. The full hardtop can be white, black, body color or removed; the open cabin has blue upholstery and a white roll bar. Optional vehicle descriptions keep these details separate from the earlier K5 interior and off-road reference copy.

Pictured-height wheel choices are Stock, polished/black American Racing Baja and raw-machined KMC Impact Monoblock/Beadlock. The 2-inch lower, 4-inch lower and laying-frame previews use Street, Torq Thrust II or Rocket Racing Attack, with 18/20-inch options for the latter two. Wheel availability follows the selected roof and height across all four views. These are illustrative previews; final suspension and wheel/tire fitment require confirmation.

## Independent artwork families

The canonical IDs are `Chevrolet-K5-1973-1974` and `Chevrolet-K5-1975`. Families use `chevrolet-k5-{1973-1974|1975}` in these roots:

- Base layers: `/designer/studio/{family}-color-v1/{top-on|top-off}/{view}/`.
- Lowered layers: `/designer/studio/{family}-street-stance-v1/{top}/{drop2|drop4|frame}/{view}/`.
- Pictured-height wheels: `/designer/wheels/{family}-{baja|baja-black|kmc-impact-monoblock|kmc-impact-beadlock}-v1/{top}/{view}.png`.
- Lowered wheels: `/designer/wheels/{family}-{torq|rocket-attack}-v1/{top}/{18|20}/{stance}/{view}.png`.

Each studio pack contains six files: the scene, neutral paint texture, body mask, center-band mask, cab mask and roof mask. The complete addition contains 96 pictured-height layers, 288 lowered layers, 64 pictured-height wheel scenes and 192 lowered wheel scenes, totaling 640 PNGs. The new entries are constructed after early-K5 registration and never inherit its 1970/1972 sources. The existing renderer handles paint, hardtops, stance and wheels without changes.

Original reference photos, four generated source sheets (including the empty-studio cleanup plate), exact prompts, native authoring and verification reports are retained in workspace `assets/squarebody-k5-expansion/`, with source material in `source/` and `reference/`. `generation-notes.md` records the source files and references.

## Verification and release

The existing-catalog comparison against `b20322a` passes: all 31 previous defaults, 2,632 configuration/summary/shared-build cases and 10,528 rendered SVGs remain unchanged. The catalog contains only the two intended additions, for 33 selections total. Source-only tests pass for the catalog, height-dependent wheel availability and all 160 new private-quote cases.

The full repository suite passes all 55 tests. The new saved-build/export matrix covers both selections, all roof states, every height and wheel choice, solid/two-tone paint and all 640 registered PNGs; the private-quote matrix covers 160 configurations in all four views. TypeScript and focused lint also pass.

The independent native audit in `assets/squarebody-k5-expansion/native-audit-verification.json` passes: all 640 PNGs decode at 768×512, all 64 paint packs have valid mask relationships, all 240 lowered paint layers match their registered body translation, and all 256 alternate-wheel scenes preserve every painted body/roof pixel. All 64 straight-front alternate scenes are byte-identical to their base scenes. All 6,103 previously tracked public files remain unchanged against `b20322a`; PNGs use raw-byte hashes, with Git's existing CRLF normalization applied only to `favicon.svg`.

Base artwork passed independent visual review across teal/white, body-color top, red/black, white/red and charcoal previews. Browser checks passed for 1975 front-quarter teal/white, rear-quarter Black top, 1973–1974 front-quarter Top off, side Solid Forest/Satin/Body-color top, and the grouped-year picker label. The final 640 files are frozen and their combined hashes are recorded in `release-verification.json`. Production build and publication verification are handled separately.

The quote Worker must accept the two new IDs before the frontend exposes them. Publish and verify the complete website asset set with the new controls, and verify the Worker uses the same manifest. No database or saved-build schema migration is required.
