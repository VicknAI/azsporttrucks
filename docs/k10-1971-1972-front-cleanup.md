# 1971–1972 K10 front-quarter paint cleanup

September 14, 2026. The paired 1971–1972 K10 now uses `chevrolet-k10-1972-color-v4` to correct three front-quarter paint boundaries:

- Extend the secondary center band to the grille-side edge of the front fender while retaining the chrome grille surround and upper molding.
- Stop cab contrast at the pillar/window bases, keeping the cowl and horizontal door top in the main body color.
- Restore body-color coverage on the fender corner below the lower molding, ahead of the front tire. The previous tire/hardware mask mistakenly excluded part of this painted panel.

The original studio image is unchanged. Body-paint texture changes are limited to the recovered lower fender corner, using the untouched blue master for its original shading. The other three views retain all six v3 assets byte-for-byte. The Stock, Baja polished/black, and KMC machined wheel scenes retain their geometry and agree pixel-for-pixel with the studio image throughout the corrected areas.

Reproducible artwork preparation and review images are in the sibling `assets/k10-1971-1972-front-cleanup` folder. Review covers orange/white and blue/white two-tone, solid green, red with a black roof, and charcoal satin with a contrasting roof. The existing grouped-year test checks the new shared asset root and legacy year links.

Release validation: run the existing designer/quote tests, TypeScript check, and production build. Deploy the quote Worker with the updated shared manifest before publishing the main site. Verify the production client bundle and all 24 studio plus 16 alternative-wheel assets against the tested local files, and confirm that the quote service remains available.
