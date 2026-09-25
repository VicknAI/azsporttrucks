# K5 two-tone edge and hood cleanup

## Scope

Nick marked the orange/white 1969 K5 side and front-quarter previews for cleaner two-tone edges and removal of a small hood blemish near the cowl. The 1969/1970 selections share the 1970 artwork family, and 1971/1972 share the 1972 family. The side layers are identical between these families; front-quarter layers retain their respective front-end details.

Native authoring and verification live in the workspace sibling `assets/k5-paint-cleanup/`. The center-band contour follows the existing molding and body surface, using each roof state's own paint mask. A built-in ImageGen crop edit removes the raised hood blemish; only 345 source-scene pixels change inside native bounds x215–242, y151–167. The wiper and panel seam remain intact. Its paint coverage follows the smooth edge, and the new shading is calibrated to the existing neutral texture. Lowered layers and patches follow the existing native stance registration; wheel faces and tire positions are retained.

## Versioned assets

Only side and front-quarter paint packs change. Each pack retains the six-file contract: `studio.png`, `paint-texture.png`, `paint-mask.png`, `center-band-mask.png`, `cab-mask.png`, and `roof-mask.png`.

| Affected artwork | New path |
| --- | --- |
| Pictured height, both roof states | `/designer/studio/chevrolet-k5-{1970\|1972}-color-v7/{top-on\|top-off}/{side\|front-quarter}/` |
| Three lowered heights, both roof states | `/designer/studio/chevrolet-k5-{1970\|1972}-street-stance-v2/{top-on\|top-off}/{drop2\|drop4\|frame}/{side\|front-quarter}/` |
| Pictured-height side wheel scenes | `/designer/wheels/chevrolet-k5-{1970\|1972}-{baja\|baja-black\|kmc-impact-monoblock\|kmc-impact-beadlock}-v2/{top-on\|top-off}/side.png` |
| Lowered side wheel scenes | `/designer/wheels/chevrolet-k5-{1970\|1972}-{torq\|rocket-attack}-v2/{top-on\|top-off}/{18\|20}/{drop2\|drop4\|frame}/side.png` |

The hood correction is part of each side scene, so side wheel scenes receive matching v2 paths. Front-quarter wheel scenes remain v1 because the revised paint layers provide that view's correction. Rear-quarter and straight-front stock paint packs keep v6 top-on/v5 top-off; their lowered packs keep v1. All other wheel paths, configuration IDs, defaults, controls and non-K5 artwork remain unchanged. New paths prevent reuse of previously cached artwork.

The contract adds 48 stock-pack PNGs, 144 lowered-pack PNGs, 16 pictured-height side wheel scenes and 48 lowered side wheel scenes: 256 files total.

## Verification and release

All 50 repository tests, TypeScript, focused lint, the production build and the quote Worker dry run pass. Existing tests check the precise per-view versions across all K5 years, roof states, heights and wheel selections, including draft/share persistence, offline exports and private quote previews. Native checks preserve all 1,072 previous K5 PNGs and restrict new changes to the marked band/hood regions, with each lowered layer using the existing stance transform. Independent visual review passes all 16 sheets/64 panels, covering orange/white and solid green, both roof states and every height. Browser review confirms the reported 1969 pictured-height views and the 1972 lowered Top off preview with Torq Thrust wheels. A separate render comparison preserves all 10,016 non-K5 renders and 5,120 unaffected K5 renders; affected renders differ only by the intended artwork URLs.

Publish the website and new static assets through the existing GitHub/Cloudflare workflow first, then verify the new public paths. The quote Worker uses the same manifest and renderer and must deploy afterward so private reviews use those published images. From the repository root:

```powershell
pnpm build
pnpm exec wrangler deploy --config services/quotes/wrangler.jsonc --dry-run
# After the website release and public asset verification:
pnpm exec wrangler deploy --config services/quotes/wrangler.jsonc
```

The existing Worker is `azsporttrucks-quotes`, serving `azsporttrucks.com/api/quotes*`. Its configuration, database and email bindings remain unchanged. See `services/quotes/README.md` for the established deployment workflow.
