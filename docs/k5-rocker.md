# K5 Rocker two-tone paint

All six K5 selections (1969, 1970, 1971, 1972, 1973–1974 and 1975) offer Center band and Rocker under Paint & finish → Two-tone pattern. Rocker applies the secondary color below the lower body molding. Hardtop color remains independently controlled by the existing K5 roof selection.

The release adds 128 aligned `rocker-mask.png` files to the existing four source families, covering both top states, all four heights and all four views. Early-K5 lowered masks use the original body translation, including the two-plane rear-quarter laying-frame transform. Square-body masks use their own rigid stance offsets. Head-on masks are transparent because the chrome bumper hides the lower painted panels. No existing scene, roof, wheel, paint texture or other mask is changed.

The model flag is registered after all vehicle copies are constructed. The pattern selector uses the pack's Rocker capability, preserving the existing K10 selection. Saved configurations and private quote previews use the existing `twoToneStyle: 'Rocker'` field; no storage migration is needed.

Authoring contours, 96 review sheets and the verification report are retained in the workspace `assets/k5-rocker/`. Verification confirms all 128 masks are contained in the correct body paint layer, do not overlap roof paint and preserve all 768 existing PNGs in these packs. Orange/white, green/white with black top, and white/red with body-color top were reviewed across both roof states and all heights.

All 57 repository tests pass, including all K5 roof/height/wheel combinations, all 128 embedded paint packs, shared configurations and 48 Rocker quote cases. TypeScript and the production build pass. Browser checks confirm the new selector, switching Center band/Rocker and retaining Rocker when moving from the 1972 K5 to the 1975 K5 with Top off.

Publish the quote Worker with the same manifest before the website so direct quote requests retain the new pattern. The work was isolated from the other chat's unfinished all-K10 Rocker expansion.
