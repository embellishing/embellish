import type {
  Condition,
  Conditions,
  ValidConditionName,
} from "@embellish/core";
import type { CSSProperties, JSXElementConstructor } from "react";

import type { StyleProps } from "./style-props";
import type { ComponentPropsWithRef } from "./types";

/**
 * Creates a polymorphic component with first-class style props and conditional
 * styling using CSS hooks.
 *
 * @typeParam P - The type of the style props that the component will expose
 * @typeParam C - The name of the conditions that the component will expose
 * @typeParam DefaultAs - The default element type for the component, defaults
 * to "div".
 *
 * @param config - The configuration object for creating the component.
 *
 * @returns A polymorphic React component with style props
 *
 * @public
 */
export function createComponent<
  C extends string,
  P,
  DefaultAs extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any> = "div", // eslint-disable-line @typescript-eslint/no-explicit-any
>(config: {
  displayName?: string;
  defaultAs?: DefaultAs;
  defaultStyle?: CSSProperties;
  styleProps?: StyleProps<P>;
  conditions?: Conditions<C>;
  fallback?: "revert-layer" | "unset";
}): <
  As extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any> = DefaultAs, // eslint-disable-line @typescript-eslint/no-explicit-any
  LocalConditionName extends string = never,
>(
  props: {
    as?: As;
  } & Omit<JSX.LibraryManagedAttributes<As, ComponentPropsWithRef<As>>, never> &
    (string extends C
      ? unknown
      : {
          conditions?: {
            [Name in LocalConditionName]: ValidConditionName<Name> &
              Condition<C>;
          };
        }) &
    Partial<{
      [PropName in
        | keyof P
        | (keyof P extends string
            ? `${C | LocalConditionName}:${keyof P}`
            : never)]: PropName extends `${C | LocalConditionName}:${infer BasePropName}`
        ? BasePropName extends keyof P
          ? P[BasePropName]
          : never
        : PropName extends keyof P
          ? P[PropName]
          : never;
    }>,
) => JSX.Element;
