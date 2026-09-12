# Tire size calculator and comparison

Route: `/tire-calculator`. Linked from the shared footer and included in the sitemap, with a canonical URL, indexable metadata and WebApplication structured data. Uses the existing site colors, type and UI components.

Two modes share the same inputs: compare two sizes or calculate one. Both metric (`265/70R17`) and inch/flotation (`33x12.50R15`) notations are accepted, including P/LT prefixes, spaces, decimal wheel diameters, and ZR markings. Load/speed suffixes are not interpreted. Field errors explain invalid or out-of-range markings instead of retaining stale results.

Same-scale dimension diagrams show side profile, section width, or a grounded overlay. Units switch between inches and millimeters. Results include diameter, section width, sidewall, wheel diameter, circumference, theoretical revs/mile, and—in comparison mode—diameter percentage, axle-height change, and estimated actual speed. Presets, swap, reset, and share links support quick comparisons. Clipboard failure provides a selectable link; no account, external submission, or local storage is needed.

Calculations use nominal unloaded dimensions: metric sidewall = width × aspect ratio / 100; diameter = two sidewalls + wheel diameter; circumference = π × diameter; theoretical revs/mile = 1,609,344 mm / circumference. Nominal axle-height change is half the diameter difference. Estimated actual speed = indicated speed × new diameter / current diameter, assuming calibration to the current tire. Rolling deflection is not modeled. The page clearly distinguishes nominal estimates from measured tires and fitment approval; converted dimensions are not advertised as available products.

References reviewed: [TireSize calculator](https://tiresize.com/calculator/) and [comparison](https://tiresize.com/comparison/) for feature scope; [Michelin tire markings](https://www.michelinman.com/auto/auto-tips-and-advice/tires-101/tire-markings-explained), [Tire Rack dimensions](https://www.tirerack.com/upgrade-garage/how-do-i-calculate-tire-dimensions), and [rolling revolutions](https://www.tirerack.com/upgrade-garage/what-is-the-revolutions-per-mile-of-a-tire) for definitions and limits. No source images or interface artwork are copied. SVG geometry serves as a dimension diagram.

Validation: six tire-tool tests cover known dimensions, accepted formats, mixed notation, speed direction/identity/zero, rejection of invalid inputs and internal discoverability. All 24 repository tests and focused lint pass. The local route returns HTTP 200 and was handed off for preview. No browser visual testing was requested or performed.

Production build passed with the new route included.
