# Square-body K10 rocker coverage and wheels

The Rocker pattern now follows the full lower molding through fender corners
and the painted strip below the tailgate on all seven 1973–1987 K10 groups.
The mask is intersected with approved body-paint coverage so the chrome,
wheel openings and bumpers retain their original appearance.

The 1981–1987 rear wheel scenes previously reused mirrored front-view faces.
Replacement scenes use the matching camera view and axle, positive horizontal
scales and a crop limited to the metal rim. Stock rally rims are restored from
the body's original aligned scene. Polished/black Baja and both machined KMC
options retain the existing tire dimensions and position. Tiny paint-mask
overlap at the front wheel edge is removed to prevent paint tint on the rim.

The release adds versioned packs instead of replacing existing files:

| K10 years | Paint pack | Wheel pack |
| --- | --- | --- |
| 1973–1974 | v5 | unchanged |
| 1975–1976 | v3 | unchanged |
| 1977–1979 | v3 | unchanged |
| 1980 | v2 | unchanged |
| 1981–1982 | v2 | v2 |
| 1983–1984 | v2 | v2 |
| 1985–1987 | v2 | v2 |

Native authoring and visual review sheets are saved in workspace
`assets/k10-rocker-wheel-cleanup/`. Authoring checks verify that pixels outside
the wheel ellipses are unchanged, wheel and paint masks do not overlap,
rocker alpha stays within body paint, and center-band/roof/cab textures are
preserved. Original packs remain byte-identical. The manifest update occurs
after C10 creation so C10 artwork and stance variants remain independent.

Validation: TypeScript check and all 60 designer, quote, and calculator tests
pass. Visual review covers all four views and all five wheel choices for the
later body; the straight-front view preserves its original tires and axle.

## Polished Baja front-quarter follow-up

The distant rear rim still had a doubled upper lip and a distorted hub after
the v2 registration fix. The front-quarter polished Baja scene now uses v3
for 1981–1982, 1983–1984 and 1985–1987. The built-in image editor rebuilt that
rear metal rim. Only the isolated rear rim and immediate bead edge are
composited into the approved v2 photograph; all pixels outside that region
are verified identical. No paint masks, front wheels, other wheel choices,
other camera views, tire dimensions or body proportions change.

Source, prompt, integration recipe and before/after close-ups are retained
in workspace `assets/k10-baja-rear-rim-v3/`. Generated source:
`exec-f672ed10-abf3-4407-b673-54839f7301a3.png` (built-in image_gen).
