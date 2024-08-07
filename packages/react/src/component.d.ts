/* eslint-disable @typescript-eslint/no-explicit-any */

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
 * @typeParam DefaultAs - Type of element to render the component by default
 *
 * @public
 */
export interface ComponentOptions<P, C extends string, DefaultAs> {
  /** Component display name */
  displayName?: string;

  /** Default value for the `is` prop */
  defaultAs?: DefaultAs;

  /** Default styles to apply to the element */
  defaultStyle?: (
    /** The value provided for the `is` prop */
    is: keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>,
  ) => CSSProperties;

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
 * Fixes type inference for callback props, e.g. `onClick`.
 *
 * @remarks
 * See
 * {@link https://github.com/microsoft/TypeScript/issues/44596#issuecomment-1447648600 | microsoft/TypeScript#44596 (comment)}.
 *
 * @public
 */
export type CallbackPropFix<T> = T extends any ? T : never;

/**
 * Component props
 *
 * @typeParam P - Type of supported style props
 * @typeParam C - Type of supported condition names
 * @typeParam As - Type of element to render the component
 * @typeParam InlineConditionName - Type of inline condition names
 * @typeParam OwnProps - Type of the component's own props
 *
 * @public
 */
export type ComponentProps<
  P,
  C extends string,
  As extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>,
  InlineConditionName extends string,
  OwnProps = {
    as?: As;
  } & (string extends C
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
    }>,
> = CallbackPropFix<
  Omit<
    JSX.LibraryManagedAttributes<As, ComponentPropsWithRef<As>>,
    keyof OwnProps
  >
> &
  OwnProps;

/**
 * Polymorphic component with first-class style props and conditional styling
 * capabilities
 *
 * @typeParam P - Type of supported style props
 * @typeParam C - Type of supported condition names
 * @typeParam DefaultAs - Type of element to render the component by default
 *
 * @public
 */
export type Component<
  P,
  C extends string,
  DefaultAs extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any>,
> = <
  As extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any> = DefaultAs,
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
 * @typeParam DefaultAs - Default element type for the component, defaults to
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
  DefaultAs extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any> = "div",
>(options: ComponentOptions<P, C, DefaultAs>): Component<P, C, DefaultAs>;
