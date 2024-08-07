---
"@embellish/react": minor
---

Renamed the `is` prop to `as`. Aside from `as` being the more common prop name, the HTML `as` attribute applies only to `link` elements, which are strictly non-presentational. On the other hand, the `is` prop is a global attribute used for customizing built-in elements, making the `is` prop collision more likely to create an impediment.
