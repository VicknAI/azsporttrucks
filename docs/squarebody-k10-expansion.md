# Square-body K10 expansion

Nick selected these year groups on September 12, 2026, using the [CJ Pony Parts identification guide](https://www.cjponyparts.com/resources/square-body-chevy-identification-guide):

| Artwork group | Reference distinction |
| --- | --- |
| 1973–1974 | Early recessed grille |
| 1975–1976 | Flush grille with three horizontal bars |
| 1977–1979 | Revised grille; check within-group lamp and fuel-filler changes |
| 1980 | Single-year grille and trim-dependent headlamps |
| 1981–1982 | Revised front sheet metal, hood and lighting |
| 1983–1984 | Updated two-level grille |
| 1985–1987 | Final grille family |

Nick clarified that each group should be a single selectable designer entry, rather than separate exact-year entries. Use the seven range labels above (with 1980 as the single-year exception). The first implemented group is 1973–1974; the remaining six groups are not yet implemented. Existing 1967–1972 K10s keep their existing selections.

## Integration direction

- Offer one selectable entry per square-body year group: 1973–1974 K10, 1975–1976 K10, 1977–1979 K10, 1980 K10, 1981–1982 K10, 1983–1984 K10 and 1985–1987 K10. Do not add an exact-year selection within these groups. Use a consistent representative truck for each group and document its pictured details without implying every year and trim was identical.
- Use regular-cab short-bed Fleetside 4x4 trucks as the initial working body configuration, consistent with the existing pickup designer. This configuration is an implementation assumption, not an additional preference expressly selected by Nick.
- Start the representative artwork with the 1973–1974 group; review one finished truck before expanding the related bodies and front ends.
- Match the approved Ford-level studio quality across side, front three-quarter, rear three-quarter and straight-front views.
- Nick explicitly noted that square-body two-tone layouts differ from the earlier trucks. Create square-body-specific paint regions from relevant factory-layout photographs, including the correct cab/bed color boundaries and molding relationships. Do not reuse the 1967–1972 center-band shape or assume one layout applies to every square-body group/trim. Confirm the roof/pillar treatment against those references too. Preserve chrome molding, grille, lamps, glass, badges, wheels and tire edges when recoloring. Check both dark solid paint (no residual light bands) and contrasting two-tone paint in all four views before enabling a group.
- Carry forward Stock, Baja Polished, Baja Black and both raw-machined KMC Impact choices once their wheel scenes are individually registered to the new trucks. Existing wheel controls can be reused; wheel images and masks must match the new geometry.
- Keep unsupported years out of the published selector until their complete artwork is ready. Do not substitute the earlier 1967–1972 body.

## Accuracy notes

The user also supplied an identification-summary screenshot. Its seven year groups match the agreed selections, but its technical descriptions are reference claims to verify, not instructions to reproduce blindly. In particular, verify the claimed 1977–1979 rectangular/stacked headlights against original Chevrolet material. The [original 1980 Chevrolet pickup brochure](https://xr793.com/wp-content/uploads/2017/08/1980-Chevrolet-Pickup-Trucks.pdf) explicitly describes rectangular headlights on Silverado and Sport equipment. Do not use the screenshot alone to set any group's lamps or turn-signal placement.

Use the selected guide for grouping, with real-truck photographs and original Chevrolet references for each artwork brief. In particular, check trim-dependent headlights, 1977–1979 detail changes and the 1981 sheet-metal transition rather than treating all differences as a grille swap.

The 1987 4WD model uses the V10 designation in [GM's original 1987 truck documentation](https://news.chevrolet.com/content/dam/company/no_search/heritage-archive-docs/vehicle-information-kits/chevrolet-trucks/1987-Chevrolet-Truck.pdf). Retain it within the requested 1985–1987 group; explain the 1987 designation in the model information without creating another selector entry.

## User-supplied 1985–1987 reference

Nick supplied this [1986 K10 Silverado 4x4 listing](https://bringatrailer.com/listing/1986-chevrolet-k10-pickup-25/). Use it as the late-group body/front-end reference. The listing describes black paint, a Fleetside bed, quad headlights, chrome bumpers, a sliding rear window, a 4-inch suspension lift and 35×12.5-inch BFGoodrich tires on 15-inch Mickey Thompson wheels. The photographed ride height is lifted, not factory stock. Those wheels are reference equipment, not a request to add a new wheel option.

The truck is solid black, so compare the late group's molding and paint boundaries with complementary two-tone photographs. Nick subsequently selected the 1974 example below as a proper square-body two-tone reference; validate how that treatment maps to the late body before applying it.

Listing photo URLs discovered from its article links (photographs have not yet been prepared as studio assets):
- https://bringatrailer.com/wp-content/uploads/2026/07/IMG_3813-scaled-copy-2026-07-27-g64-76468.jpeg?w=940
- https://bringatrailer.com/wp-content/uploads/2026/07/IMG_3817-scaled-copy-2026-07-27-z15-76492.jpeg?w=620
- https://bringatrailer.com/wp-content/uploads/2026/07/IMG_3814-scaled-copy-2026-07-27-9ud-76480.jpeg?w=620

## User-selected 1973–1974 body and two-tone reference

[1974 K10 Cheyenne Super](https://bringatrailer.com/listing/1974-chevrolet-k10-pickup-2/), supplied by Nick as a proper two-tone example. Visually inspected front-quarter, rear-quarter and side photographs. The broad white side panel sits between upper/lower moldings, with blue above and below; it curves down around the front fender's leading edge. Both moldings must remain visible. White covers the upper/rear cab, while the pictured door window frames remain blue. Match these boundaries deliberately rather than copying the earlier truck's cab mask. Retain the tailgate's bright applique separately from paint.

The listing specifies a 2-inch lift and 35-inch tires; its Raceline wheels are reference equipment, not an additional requested option. Saved reference photos for authoring outside the site checkout at `assets/squarebody-k10-expansion/references/1974/`: `front-quarter.jpeg`, `body-reference.jpeg` (rear-quarter) and `side-reference.jpeg`.

## User-selected 1975–1976 reference and corrections

[1976 K10 Scottsdale](https://bringatrailer.com/listing/1976-chevrolet-k10-pickup-7/) supplied for orange/white two-tone and the 1975–1976 body group. Nick explicitly noted that its taillights are modified and asked to omit the duckbill-style visor above the windshield. Use factory-style red/clear taillights and a normal unadorned windshield/roof edge. Do not reproduce the clear aftermarket lamps or the visor. The listing describes a six-inch lift; this is reference equipment, not factory stock stance. Keep the current first implementation focused on 1973–1974.

## First 1973–1974 implementation — September 12, 2026

One selectable `Chevrolet-K10-1973-1974` entry, with the group label retained in summaries, quotes and shared builds. Existing individual-year entries remain unchanged. The new blue/white preset follows the supplied 1974 example; solid paint covers the complete body. The roof/cab-back mask leaves the door window frames in body color. Both molding strips remain visible.

New `chevrolet-k10-1973-1974-color-v1` contains four independent studio scenes and 20 aligned texture/mask PNGs. The built-in image generator supplied one solid-blue four-view sheet from the supplied truck photos and approved Ford studio lighting. Source, exact prompt and generation QA are in workspace `assets/squarebody-k10-expansion/1974/generation-notes.md`. The finished illustration retains a receiver hitch and plain chrome rear bumper, with a lifted stance; it is not a measured stock-height depiction or exact reproduction of every reference accessory.

Deterministic preparation under the user's existing image-cleanup authorization: `assets/squarebody-k10-expansion/1974/prepare-artwork.py`. Replaced generated rim faces with the approved OEM-style K10 stock faces, then registered all four existing Baja/KMC wheel variants to this body's rims. The 16 additional wheel scenes preserve all pixels outside their rim masks, including tires, body and trim. Existing published image files were not altered.

Reviewed blue/white with contrasting cab, green solid, graphite satin, white solid and all wheel choices. Secondary/cab masks are contained within body paint coverage. All 25 repository checks pass, including the grouped selection, solid/two-tone state, wheel eligibility, four-angle exports and legacy vehicle coverage. Production build passes; local designer HTTP 200. No browser interaction testing requested or performed. Publication verification is recorded in the private authoring folder after deployment.
