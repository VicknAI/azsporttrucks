# Late K10 KMC quarter-view rendering

The 1981-1982, 1983-1984 and 1985-1987 K10 KMC quarter-view
scenes contain soft, stretched wheel faces. The renderer now starts with the
aligned stock scene and projects the existing clean side-view metal rims into
individually calibrated ellipses for the two visible wheels. Front and rear
source faces remain assigned to their respective axles.

This applies to KMC Impact Monoblock and Beadlock at the pictured stance in
front and rear three-quarter views. Source PNGs are unchanged. Side and
straight-front views, stock/Baja choices, other years and vehicle families
keep their existing rendering. Paint, roof, trim, tire dimensions and wheel
centers continue to use the original vehicle pack.

`StudioPack.wheelFaceOverlays` records the source image, applicable stance,
source rim ellipses and destination rim ellipses. SVG clipping limits each
projection to the wheel face; no full vehicle image is stretched or mirrored.
The existing export embedder includes the additional image reference so
downloaded artwork remains self-contained.

Validation on October 14, 2026:

- Four focused tests pass (`node --test tests/wheel-projection.test.mjs`).
- A before/after render comparison covers 644 vehicle/wheel/stance/view
  combinations: the 12 intended combinations change; 632 are byte-identical.
- Every image referenced by the compared renders exists in the repository.
- Both KMC styles were rendered in both quarter views and visually reviewed.
- The full dependency-based test suite, production build and live browser
  verification were unavailable in the authoring session. Complete those
  checks before merging/deploying the draft pull request.
