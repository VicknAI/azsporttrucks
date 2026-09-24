# 1979 Ford Bronco designer

## Requested scope — September 24, 2026

Nick requested the [1979 Ford Bronco Custom in this listing](https://bringatrailer.com/listing/1979-ford-bronco-250/), with separate top colors like the Chevrolet K5, and explicitly confirmed **Top off**. This addition covers 1979 only. It follows the pictured Bronco's lifted stance and off-road tires; the earlier factory-height/street-tire instruction applied to the square-body C10 expansion.

The blue-and-white reference look includes a white removable rear fiberglass hardtop, chrome brightwork, white wheels and a swing-out spare. The listing shows black vinyl seats. [Ford's second-generation Bronco history](https://www.ford.com/bronco/history/1978-1979/) supplies the generation context and links the original 1979 brochure.

## Appearance and controls

The four studio views are side profile, front three-quarter, rear three-quarter and straight front. Solid or two-tone body paint is editable separately from the rear hardtop. White top, Black top, Body-color top and Top off follow the established K5 selection pattern.

On this Bronco, **Top off removes only the rear fiberglass shell**. The steel roof over the front seats, windshield frame, doors and upper door frames remain part of the body. Their color follows the main body paint. The exposed rear seating uses black vinyl. The rear hardtop mask excludes the cap windows, window seals and bright trim; the body mask excludes glass, lights, chrome, wheels, tires and interior.

The artwork is a visual design study based on the pictured vehicle, not a measured suspension or wheel/tire fitment specification.

The reference preset uses deep blue `#1f4e73`, white `#e5e7e7`, two-tone paint and White top. The pictured white wheels and lifted stance are retained. No optional wheel or ride-height artwork is registered for this model.

## Asset provenance

The built-in image-generation tool creates the four-view top-on source and its aligned top-off edit. References, exact prompts, generated sources and native asset-authoring scripts are kept in the workspace's `assets/ford-bronco-1979/` directory, outside the website checkout. The authoring source uses blue painted metal and a magenta rear shell to separate body and hardtop masks; those key colors are replaced by the designer's paint layers.

Public layer assets live under `public/designer/studio/ford-bronco-1979-color-v1/{top-on,top-off}/{view}/`. Each view supplies `studio.png`, `paint-texture.png`, `paint-mask.png`, `center-band-mask.png`, `cab-mask.png` and `roof-mask.png`. The renderer uses the same registered packs for the live designer, shared builds, saved build summaries, self-contained exports and private quote reviews.

## Verification and release status

Completed locally on September 24, 2026. All 48 required PNG layers are present across the eight top-on/top-off view packs. Visual review covers white, black and body-color hardtops, the exposed black interior, contrasting body paints, the center band, and the fixed front cab roof. The final pass corrected source-blue remnants around trim, excluded the spare tire from body tinting, and blended the removed-cap background. Artwork outside the bounded top-removal area is preserved.

The full repository suite passes **43/43 tests**, including Bronco draft/share persistence, all hardtop choices, both paint layouts and finishes, four-view self-contained exports and private quote views. TypeScript, focused lint and the production build pass. A pre-Bronco baseline audit preserves all **32 previous vehicle defaults and summaries**, plus **512 existing paint/cab/view render hashes**. The catalog now contains 33 vehicles, including only the requested 1979 Bronco.

Browser review confirms the Ford → Bronco → 1979 selection, all 16 hardtop/view combinations, reference and contrasting paint, and the build summary's separate fixed front cab roof and rear hardtop entries. Included in the authorized [September 24 designer release](designer-release-2026-09-24.md), covering both the website and quote Worker.
