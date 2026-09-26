# 1979 Ford Bronco designer

## Requested scope — September 24, 2026

Nick requested the [1979 Ford Bronco Custom in this listing](https://bringatrailer.com/listing/1979-ford-bronco-250/), with separate top colors like the Chevrolet K5, and explicitly confirmed **Top off**. This addition covers 1979 only. It follows the pictured Bronco's lifted stance and off-road tires; the earlier factory-height/street-tire instruction applied to the square-body C10 expansion.

The blue-and-white reference look includes a white removable rear fiberglass hardtop, chrome brightwork, white wheels and a swing-out spare. The listing shows black vinyl seats. [Ford's second-generation Bronco history](https://www.ford.com/bronco/history/1978-1979/) supplies the generation context and links the original 1979 brochure.

## Appearance and controls

The four studio views are side profile, front three-quarter, rear three-quarter and straight front. Solid or two-tone body paint is editable separately from the rear hardtop. White top, Black top, Body-color top and Top off follow the established K5 selection pattern.

On this Bronco, **Top off removes only the rear fiberglass shell**. The steel roof over the front seats, windshield frame, doors and upper door frames remain part of the body. Their color follows the main body paint. The exposed rear seating uses black vinyl. The rear hardtop mask excludes the cap windows, window seals and bright trim; the body mask excludes glass, lights, chrome, wheels, tires and interior.

The artwork is a visual design study based on the pictured vehicle, not a measured suspension or wheel/tire fitment specification.

The reference preset uses deep blue `#1f4e73`, white `#e5e7e7`, two-tone paint and White top. The pictured white wheels remain the Stock choice. The lifted stance and tire sizes remain as pictured; the wheel choices described below now match the F-150 menu.

## Asset provenance

The built-in image-generation tool creates the four-view top-on source and its aligned top-off edit. References, exact prompts, generated sources and native asset-authoring scripts are kept in the workspace's `assets/ford-bronco-1979/` directory, outside the website checkout. The authoring source uses blue painted metal and a magenta rear shell to separate body and hardtop masks; those key colors are replaced by the designer's paint layers.

Public layer assets use `public/designer/studio/ford-bronco-1979-color-v3/top-on/{view}/` for side, front-quarter and rear-quarter. The straight-front top-on view and all top-off views remain under `ford-bronco-1979-color-v2`. Each view supplies `studio.png`, `paint-texture.png`, `paint-mask.png`, `center-band-mask.png`, `cab-mask.png` and `roof-mask.png`. The aligned v2 `wheel-details.png` source supplies the Stock inner wheel faces through native SVG clips. Selected aftermarket scenes contain their own complete wheel faces, so the Stock detail overlay is omitted for those choices. The renderer uses the same registered packs for the live designer, shared builds, saved build summaries, self-contained exports and private quote reviews.

## Wheel-arch and wheel cleanup — September 24, 2026

Nick marked the side-view front and rear wheel arches and asked for cleaner wheels. Smooth native band curves now follow the existing body creases in the side and both quarter views. The top-on and top-off band masks match; the straight-front view and tailgate band are unchanged. All original v1 assets remain intact.

The built-in image-generation tool refined the white wheel faces, followed by a targeted edit giving the rear wheels and spare plain chrome center hardware. Front locking hubs remain red. Only the inner metal wheel faces from the generated source are overlaid; no generated body, tire, roof, or backdrop changes enter the designer. The v2 asset paths prevent an older cached artwork pack from being reused.

Authoring files are in the workspace's `assets/ford-bronco-1979/`: `generated-wheel-details-final-v2.png`, `prompt-wheel-details-v2.txt`, `prompt-wheel-hubs-v2.txt`, and `arch-cleanup-staged/verification.json`. The first prompt requests aligned, mechanically coherent white wheel faces while preserving the source sheet; the second changes only four rear/spare center caps. `geometry.py` contains the smooth band curves, and `stage-arch-masks.py` rebuilds the eight staged masks from the frozen v1 pack.

Validation covers all 16 hardtop/view combinations in the browser, self-contained wheel-detail exports, private quote views, and all 45 repository tests. TypeScript, focused lint and the production build pass. An exhaustive comparison preserves 13,888 non-Bronco renders and all 32 non-Bronco defaults. Artwork outside the six revised band masks and seven clipped wheel faces is preserved.

## Hardtop window-mask cleanup — September 24, 2026

Nick identified a pale angular gap below the side hardtop window with Body-color top selected in blue `#205381`. Inspection found related shell gaps in both quarter views. The native correction traces the window exclusions around the existing glazing, seals and bright trim, then fills the exposed shell area with localized neutral cap texture. It does not require new image generation.

Only the side, front-quarter and rear-quarter **top-on** packs move to v3. The straight-front pack, every Top off pack, and the separate wheel-detail sheet remain on v2. The fixed front steel roof, body paint, center band, wheels, tires and all defaults retain their existing registration.

The registration audit preserves all 31 vehicle defaults and summaries and 12,504 unaffected rendered SVGs. The 72 affected hardtop renders differ only in their three top-on pack roots. All 47 tests, TypeScript, focused lint, production build and quote Worker dry run pass. Browser checks cover all 16 hardtop/view combinations; independent close-up reviews confirm clean edges with body-color and black tops. Drafts, shares, self-contained exports and private quote reviews retain the same options.

The 18 v3 PNGs retain the original scene, body and center-band layers. Roof/cab coverage only increases inside the corrected window boundaries (1,606 side, 967 front-quarter and 1,420 rear-quarter alpha pixels); existing coverage is never removed. Neutral texture changes only at those recovered pixels. Eight known missed-shell probes now have full or near-full alpha, while glass/seal probes remain unpainted. All 49 v2 PNGs are byte-identical. The shared native curves and staging script are in `assets/ford-bronco-1979/{geometry.py,build.py,window-cleanup/stage.py}`, with detailed checks in `window-cleanup/verification.json`. Publish and verify the website's v3 assets before deploying the quote Worker that references them.

## Original addition verification and release status

Completed locally on September 24, 2026. All 48 required PNG layers are present across the eight top-on/top-off view packs. Visual review covers white, black and body-color hardtops, the exposed black interior, contrasting body paints, the center band, and the fixed front cab roof. The final pass corrected source-blue remnants around trim, excluded the spare tire from body tinting, and blended the removed-cap background. Artwork outside the bounded top-removal area is preserved.

The full repository suite passes **43/43 tests**, including Bronco draft/share persistence, all hardtop choices, both paint layouts and finishes, four-view self-contained exports and private quote views. TypeScript, focused lint and the production build pass. A pre-Bronco baseline audit preserves all **32 previous vehicle defaults and summaries**, plus **512 existing paint/cab/view render hashes**. The catalog now contains 33 vehicles, including only the requested 1979 Bronco.

Browser review confirms the Ford → Bronco → 1979 selection, all 16 hardtop/view combinations, reference and contrasting paint, and the build summary's separate fixed front cab roof and rear hardtop entries. Included in the authorized [September 24 designer release](designer-release-2026-09-24.md), covering both the website and quote Worker.

## F-150 wheel choices — September 24, 2026

The Bronco now offers the same five choices as the F-150: Stock, American Racing Baja in polished or black, and KMC Impact Forged Monoblock or Beadlock in raw-machined finish. The existing wheel IDs are shared, but each option uses Bronco-specific artwork. Its pictured tires, lifted stance, body paint and hardtop choices remain intact.

The four aftermarket packs each contain four views for both roof states, totaling 32 PNGs under `/designer/wheels/ford-bronco-1979-{baja|baja-black|kmc-impact-monoblock|kmc-impact-beadlock}-v1/{top-on|top-off}/{view}.png`. Native authoring in workspace `assets/bronco-wheel-options/` registers the already-approved F-150 metal faces to measured Bronco rim boundaries. Front locking hubs retain the cleaned Bronco detail; the visible rear spare matches the chosen rear wheel face. Tire tread and all pixels outside the metal-face boundaries stay unchanged. Straight-front scenes remain exact source copies because no front wheel faces are visible.

The stock white-wheel detail overlay has `baseSceneOnly: true`. The shared renderer suppresses it only when a matching replacement wheel scene exists, so it cannot cover the selected wheel with the stock white face. Stock renders and missing-scene fallbacks retain that detail, and unrelated overlays continue to render normally. Drafts, shared links, exports and private quote previews use the same roof-aware wheel registration.

The independent registration audit preserves all 31 defaults, 14,300 non-Bronco SVGs, 68 stock Bronco SVGs and all 5,062 previously committed artwork files. The only stock summary change is the clearer “Stock” wheel label. New selections resolve to 32 Bronco-owned scene paths, and the audit confirms both aftermarket-overlay suppression and stock fallback. Deploy the website and verify all new PNGs before updating the quote Worker that shares this renderer.

### Front-quarter wheel registration — September 26, 2026

The far metal faces were remeasured against each approved F-150 donor to center the Baja and KMC rims and exclude a small donor tire-letter fragment. The eight corrected front-quarter scenes use v2 URLs; side, rear-quarter and straight-front remain v1. All 32 original v1 files are preserved. The 32 active scenes pass independent visual review, with source Bronco body, tires, paint and roof layers unchanged. Native source hashes, measured geometry and mixed-version public verification are retained in `assets/bronco-wheel-options/`.
