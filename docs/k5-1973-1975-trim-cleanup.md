# 1973–1975 K5 trim and roof coverage

The v2 color and street-stance packs replace the straight center-band boundary
with the curved front molding contour in side and front three-quarter views.
The return beside the vertical marker, upper edge and lower molding now delimit
the secondary paint. Chrome and marker pixels stay in the source scene.

The removable hardtop's blue leading lip is reassigned to the roof layer in side,
front three-quarter and straight-front views. White, black and body-color tops
therefore cover the lip. The steel windshield frame remains body color. Top-off
framing is unchanged.

Both the 1973–1974 and 1975 groups use the corrections at all four ride heights.
The corrections follow the original rigid vertical offsets: side 10/20/77,
front-quarter 12/24/88, rear-quarter 11/22/80, front 12/24/92 native pixels.
Wheel scenes keep their existing alignment and URLs.

All studio scenes, neutral paint textures and Rocker masks are byte-identical to
v1. Rear-quarter paint layers and top-off roof/body layers are unchanged. Versioned
URLs prevent mixing updated geometry with cached masks. Native images are 768×512.

Validation includes pixel probes inside/outside the front molding, roof-lip and
windshield-frame separation, both top states, all four heights, high-contrast paint
reviews, and saved/exported/private-quote views with every supported wheel.

Authoring and review files are in the workspace's
`assets/k5-1973-1975-trim-cleanup/` folder. Its `build.py` keeps the traced cubic
paths, verifies retained layers, and generates the public file hash manifest.
