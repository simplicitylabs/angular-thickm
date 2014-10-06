0.3.1 / 2014-10-06:
-------------------
 - Added `.toArray()` for collection instances: produces an array which passes
 Angular's `angular.toArray()` (angular#angular.js#7143).

0.3.0 / 2014-09-22:
-------------------
 - **Breaking change:** Removed validation. Models are still a good place to
 specify validation rules, but it is left out of ThickM for now.

0.2.0 / 2014-09-12:
-------------------
 - **Breaking change:** The provider's `.setBaseUrl()` method is now deprecated,
 in favor of setting this option on `ThickModel`'s prototype, see example in
 `example/` folder.
 - Updates to `README.md`.
 - Added example to `example/` folder.

0.1.0 / 2014-08-26:
-------------------
 - Fixed some dev dependencies.
 - Renamed Resource to ThickModel.
 - Renamed ResourceCollection to ThickModelCollection
 - Updated docs.
 - Wrote README.md.

0.0.1 / 2014-08-25:
-------------------
Initial release, working release.
