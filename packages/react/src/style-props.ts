import type { CSSProperties } from "react";

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
