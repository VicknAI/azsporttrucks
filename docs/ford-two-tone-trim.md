# Ford two-tone coverage beneath trim

The requested correction extends the secondary two-tone color to the underside of the existing trim on every 1979 Bronco and 1978/1979 F-100 view. The scope includes both Bronco roof states and all four F-100 ride heights. The trim itself remains outside the paint region.

Only `center-band-mask.png` changes within each six-file paint pack. The scene, paint texture, body mask, cab mask and roof mask must remain byte-identical to their prior versions. This preserves solid paint, body details, hardtop/cab colors, tires and wheels. Configuration IDs, defaults, controls, saved builds and wheel-scene paths remain unchanged; no renderer change is required.

## Registered packs

- Bronco: `ford-bronco-1979-color-v4/{top-on|top-off}/{view}/` replaces the previous mixed v2/v3 paint roots. The stock wheel-detail sheet remains `ford-bronco-1979-color-v2/wheel-details.png`.
- F-100 stock: `ford-f100-{1978|1979}-color-v2/{view}/`.
- F-100 lowered: `ford-f100-{1978|1979}-stance-v2/{drop2|drop4|frame}/{view}/`.

These are 40 packs containing 240 PNGs: eight Bronco packs and 32 F-100 packs. Native authoring and independent regression reports are retained in workspace `assets/ford-two-tone-trim/`.

## Verification and release

All 52 repository tests pass. Export matrices cover all packs, both body-paint layouts, Bronco hardtop choices and the F-100 wheel/height combinations. The targeted preservation check confirms all 200 non-band files are byte-identical to their prior packs. Private quote coverage checks the same revised roots with independent wheel and hardtop/cab selections. Independent comparison against `fab9c0b` preserves all 31 defaults, 2,632 configuration/summary/shared-build cases and 9,812 unaffected renders; the 392 F-100 and 324 Bronco renders differ only by the intended paint-pack URLs.

Publish and verify the new website assets before deploying the quote Worker, which shares the manifest and renderer. Existing wheel scenes and service configuration remain in place.
