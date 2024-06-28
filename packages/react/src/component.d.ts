import type {
  Condition,
  Conditions,
  ValidConditionName,
} from "@embellish/core";
import type { CSSProperties, JSXElementConstructor } from "react";

import type { StyleProps } from "./style-props";
import type { ComponentPropsWithRef } from "./types";

/**
 * Component configuration options
 *
 * @typeParam P - Type of supported style props
 * @typeParam C - Type of supported condition names
 * @typeParam DefaultIs - Type of element to render the component by default
 *
 * @public
 */
export interface ComponentOptions<P, C extends string, DefaultIs> {
  /** Component display name */
  displayName?: string;

  /** Default value for the `is` prop */
  defaultIs?: DefaultIs;

  /** Default styles to apply to the element */
  defaultStyle?: CSSProperties;

  /** Component style props */
  styleProps?: StyleProps<P>;

  /** Conditions that can be applied to each style prop */
  conditions?: Conditions<C>;

  /**
   * Fallback value to use when no other value is available; defaults to
   * `"revert-layer"`
   */
  fallback?: "revert-layer" | "unset";
}

/**
 * Component props
 *
 * @typeParam P - Type of supported style props
 * @typeParam C - Type of supported condition names
 * @typeParam As - Type of element to render the component
 * @typeParam InlineConditionName - Type of inline condition names
 *
 * @public
 */
export type ComponentProps<
  P,
  C extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  As extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>,
  InlineConditionName extends string,
> = {
  as?: As;
} & Omit<JSX.LibraryManagedAttributes<As, ComponentPropsWithRef<As>>, never> &
  (string extends C
    ? unknown
    : {
        conditions?: {
          [Name in InlineConditionName]: ValidConditionName<Name> &
            Condition<C>;
        };
      }) &
  Partial<{
    [PropName in
      | keyof P
      | (keyof P extends string
          ? `${C | InlineConditionName}:${keyof P}`
          : never)]: PropName extends `${C | InlineConditionName}:${infer BasePropName}`
      ? BasePropName extends keyof P
        ? P[BasePropName]
        : never
      : PropName extends keyof P
        ? P[PropName]
        : never;
  }>;

/**
 * Polymorphic component with first-class style props and conditional styling
 * capabilities
 *
 * @typeParam P - Type of supported style props
 * @typeParam C - Type of supported condition names
 * @typeParam DefaultIs - Type of element to render the component by default
 *
 * @public
 */
export type Component<
  P,
  C extends string,
  DefaultIs extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.JSXElementConstructor<any>,
> = <
  As extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any> = DefaultIs, // eslint-disable-line @typescript-eslint/no-explicit-any
  InlineConditionName extends string = never,
>(
  props: ComponentProps<P, C, As, InlineConditionName>,
) => JSX.Element;

/**
 * Creates a polymorphic component with first-class style props and conditional
 * styling capabilities.
 *
 * @typeParam P - Type of the style props that the component will expose
 * @typeParam C - Name of the conditions that the component will expose
 * @typeParam DefaultIs - Default element type for the component, defaults to
 * "div"
 *
 * @param options - Component configuration options
 *
 * @returns A polymorphic React component with style props
 *
 * @public
 */
export function createComponent<
  P,
  C extends string,
  DefaultIs extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any> = "div", // eslint-disable-line @typescript-eslint/no-explicit-any
>(options: ComponentOptions<P, C, DefaultIs>): Component<P, C, DefaultIs>;
