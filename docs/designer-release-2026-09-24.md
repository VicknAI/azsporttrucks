# Designer release — September 24, 2026

Nick explicitly requested publication of the completed designer work.

Included changes:

- Seven square-body C10 year groups, factory-style street-tire defaults, four views, paint, supported wheel choices and lower ride-height illustrations.
- Contrasting-cab corrections for the requested 1975–1976 and 1985–1987 K10 views.
- The 1979 Ford Bronco with separate white, black and body-color rear hardtops and Top off, preserving its fixed steel front roof.
- Medium Blue, Hugger Orange, Dark Green, Red, Ochre and White quick paint circles for the 1967–1972 C10/K10 and available K5 years. Colors are screen approximations; existing model reference presets remain intact.
- A Rocker two-tone pattern for the 1971–1972 K10 only, applying secondary paint below the lower body molding.

## Release validation

All 45 repository tests pass, including saved/shared builds, existing vehicles, wheel and stance combinations, four-view self-contained exports and private quote reviews. TypeScript, focused lint, the production build and quote Worker dry run pass. Browser review covers the new vehicle groups and controls, all Bronco top/view combinations, the scoped paint circles and all four Rocker views. Native artwork and independent regression reports are retained in the workspace `assets/` authoring directories.

Expected production client: `/_next/static/chunks/designer-B04aQU9K.js`.

The quote Worker was deployed first using its existing configuration, route, D1 and email bindings. New version: `1c825d62-3472-4a87-9acd-30c65eb3ae7a`. The website release follows the existing GitHub `main` → Cloudflare build workflow. Live bundle/asset/status verification is recorded in workspace `assets/designer-release-2026-09-24/` after publication.
