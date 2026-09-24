# Early C10 year groups

The C10 selector keeps 1967 and 1968 separate and combines 1969–1970 and 1971–1972. The paired years already share identical default paint, studio layers, ride-height packs and wheel scenes. Grouping happens after all exact-year artwork registration, so the existing assets and customization remain unchanged. The catalog now has 31 selections, including 11 C10 selections.

Canonical IDs are `Chevrolet-C10-1969-1970` and `Chevrolet-C10-1971-1972`. The four retired exact-year IDs remain explicit aliases through `resolveVehicleId`, shared by designer normalization and quote validation. Unknown IDs still fail quote validation. Drafts and shared links normalize to the group; existing stored quote configurations normalize when their private review or pending notification is rendered, without rewriting saved records.

All 47 tests pass, including sharing, drafts, wheel/height selections, offline exports, legacy quote submissions, stored private reviews and notification retries. TypeScript, the production build and quote Worker dry run pass. Focused lint passes with the existing control-character validation regex, guide anchor and anonymous Worker export rules excluded. A separate comparison preserves all studio/stance/wheel packs and all prior defaults and summaries apart from grouped identity. All 2,560 early-C10 render comparisons match after excluding the intended vehicle-label change in SVG accessibility text.

Deploy the quote Worker first so it accepts both old exact-year clients and new grouped IDs, then publish the website through the existing GitHub/Cloudflare workflow.
