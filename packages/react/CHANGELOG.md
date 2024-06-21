# @embellish/react

## 0.5.0

### Minor Changes

- 8f33c80: Simplified type definitions for the `createComponent` function. The `createStyleProps` function is now required and accepts a record with `true` values instead of an array of property names.

### Patch Changes

- a7e660a: Removed component display name validation, which is not needed because React allows any string.

## 0.4.2

### Patch Changes

- 84fbfd4: Fix for runtime error when no style props are defined.

## 0.4.1

### Patch Changes

- a39ad49: Fixed pretty-printing in development mode.
- 6bfa76b: Added the `createStyleProps` function to simplify creation of style props.

## 0.4.0

### Minor Changes

- 4f45057: Removed `initial:` and component display name namespaces. Renamed `is` prop to `as`.

## 0.3.0

### Minor Changes

- 5e3ad90: Replaced the `styleSheet` function with a `StyleSheet` component.

## 0.2.5

### Patch Changes

- 9a4ca33: Fix for CSS variable names sometimes being invalid.
- 38f5b97: Prevent excess CSS properties in return values of style props.

## 0.2.4

### Patch Changes

- 749041e: Fix for getting condition names when no conditions exist.

## 0.2.3

### Patch Changes

- c0971bf: Made `createComponent` config type more permissive for less confusing DX.
- 630ffbd: Fix for component composition via `is` prop.

## 0.2.2

### Patch Changes

- 7e9ad14: Fixed multiple type issues in the `createComponent` function.

## 0.2.1

### Patch Changes

- 60b4817: Core type re-exports

## 0.2.0

### Minor Changes

- a3ae0f3: Replaced the `createEmbellish` function with `createConditions` and `createBox`.
  Migrated core functionality in `react` package to separate internal package.
- 6a5fc70: Separated the `createHooks` and `createConditions` APIs. Renamed the `createBox`
  function to `createComponent`.

## 0.1.0

### Minor Changes

- 6932e6e: Renamed the `embellish` function to `createEmbellish`.

### Patch Changes

- 1fe5f25: Added `standardLonghandProperties`, `vendorLonghandProperties`,
  `standardShorthandProperties`, and `vendorShorthandProperties`.

## 0.0.10

### Patch Changes

- 22bc9ca: Fix attempt to get condition names when the conditions object is
  undefined.

## 0.0.9

### Patch Changes

- e005503: Fix for missing props
- 88fb52f: Fix for missing constraints
- e005503: Fix for no conditions at runtime
- 26def23: Fix for missing properties when no conditions are specified

## 0.0.8

### Patch Changes

- 98044b4: Made conditions optional and properties required.

## 0.0.7

### Patch Changes

- 7946320: Updated types to prevent invalid "initial" and "box" condition names.

## 0.0.6

### Patch Changes

- 3ed7ebf: Removed unnecessary eslint-disable.

## 0.0.5

### Patch Changes

- 60eef17: Proper application of fallback value

## 0.0.4

### Patch Changes

- 5aab497: More precise errors for invalid properties

## 0.0.3

### Patch Changes

- dde04c6: Fixed type issues.

## 0.0.2

### Patch Changes

- aa851c9: Fixed the type of the `embellish` function.
