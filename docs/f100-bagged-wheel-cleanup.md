# F-100 laying-frame wheel cleanup

The reported 1978 F-100 laying-frame preview with 20-inch Torq Thrust wheels now uses corrected wheel artwork. Registration covers the laying-frame preview only, for both 1978 and 1979 and all four views, with the default wheels and 18/20-inch Torq Thrust choices. Stock, 2-inch lower and 4-inch lower previews retain their existing artwork.

## Versioned artwork

- Base packs: `ford-f100-{1978|1979}-stance-v3/frame/{view}/`, containing 48 PNGs across eight packs.
- Torq Thrust scenes: `ford-f100-{1978|1979}-torq-v2/{18|20}/frame/{view}.png`, containing 16 PNGs.

Changes are limited to the base scenes and alternate-wheel scenes. All five paint layers in each new base pack are byte-identical to the corresponding v2 pack: paint texture, body mask, center-band mask, cab mask and roof mask. This retains the recent [two-tone coverage beneath trim](ford-two-tone-trim.md). The previous v1-to-v2 trim-preservation checks remain in place.

Configuration IDs, defaults, wheel options, heights, paint controls, summaries and saved/shared builds remain unchanged. The shared manifest selects the revised paths only for an F-100 at laying-frame height. No renderer change is required. Authoring and independent verification are retained in workspace `assets/f100-bagged-wheel-cleanup/`.

## Verification and release

All 53 repository tests pass. Export and private-quote matrices cover both years, every height, wheel choice and view; the focused preservation test confirms all 40 active laying-frame paint-layer files equal their v2 sources. Independent comparison against `4da764c` preserves all 31 defaults, 2,632 configuration/summary/shared-build cases and 10,432 unaffected renders. The 96 F-100 laying-frame renders differ only by the intended base and Torq URLs. Native verification passes for all 64 new files and preserves 496 prior PNGs; the final candidates pass independent visual review.

Publish and verify the 64 new website assets before deploying the quote Worker that uses the same manifest. Other vehicle artwork and service configuration remain unchanged.
