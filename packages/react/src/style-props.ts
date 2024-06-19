import type { CSSProperties } from "react";

/**
 * Generates a set of style prop definitions for the given CSS property names.
 *
 * @typeParam Properties - A tuple of keys from the CSSProperties type, ensuring only valid CSS property names are used.
 * @param properties - An array of standard React CSS property names for which to create prop functions.
 *
 * @returns An object where each key is a CSS property name from the input array, and each value is a function that takes a value for that property and returns an object with the property and its value.
 *
 * @public
 */
export function createStyleProps<
  const Properties extends (keyof CSSProperties)[],
>(
  properties: Properties,
): {
  [P in Properties[number]]: (
    value: Required<CSSProperties>[P],
  ) => Pick<Required<CSSProperties>, P>;
} {
  return Object.fromEntries(
    properties.map(property => [
      property,
      (value: unknown) => ({ [property]: value }),
    ]),
  ) as ReturnType<typeof createStyleProps>;
}
