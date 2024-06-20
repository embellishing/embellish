import type { Branded } from "@embellish/core";
import type { CSSProperties } from "react";

import type { ValidStylePropName } from "./types";

/**
 * Represents style prop definitions.
 *
 * @typeParam P - The name and type of each style prop
 *
 * @public
 */
export type StyleProps<P> = Branded<P, "StyleProps">;

/**
 * Creates style props, with each entry either enabling a standard CSS property
 * or defining a custom CSS property.
 *
 * @typeParam StylePropConfig - The type of the style props to create
 * @param styleProps - The style props to create
 *
 * @returns The set of style props defined in the provided configuration and
 * available for use in a component
 *
 * @public
 */
export function createStyleProps<StylePropConfig>(
  styleProps: StylePropConfig & {
    [P in keyof StylePropConfig]:
      | (P extends keyof CSSProperties ? true : never)
      | (ValidStylePropName<P> &
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((value: any) => {
            [Q in keyof ReturnType<
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              StylePropConfig[P] extends (value: any) => unknown
                ? StylePropConfig[P]
                : never
            >]: Q extends keyof CSSProperties ? CSSProperties[Q] : never;
          }));
  },
) {
  return Object.fromEntries(
    Object.entries(styleProps).map(([property, definition]) => [
      property,
      definition === true
        ? (value: unknown) => ({ [property]: value })
        : definition,
    ]),
  ) as StyleProps<{
    [P in keyof StylePropConfig]: P extends keyof CSSProperties
      ? CSSProperties[P]
      : StylePropConfig[P] extends (value: infer Value) => unknown
        ? Value
        : never;
  }>;
}
