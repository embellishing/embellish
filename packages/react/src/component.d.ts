import type {
  Condition,
  Conditions,
  ValidConditionName,
} from "@embellish/core";
import type { CSSProperties, JSXElementConstructor } from "react";

import type { ComponentPropsWithRef, ValidStylePropName } from "./types";

/**
 * Creates a polymorphic component that can be styled using first-class props and
 * CSS hooks.
 *
 * @typeParam StyleProps - The type of the style properties.
 * @typeParam Conds - The type of the conditions.
 * @typeParam DefaultAs - The default element type for the component, defaults to
 * "div".
 *
 * @param config - The configuration object for creating the component.
 *
 * @returns A polymorphic React component.
 *
 * @public
 */
export function createComponent<
  StyleProps,
  Conds,
  DefaultAs extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any> = "div", // eslint-disable-line @typescript-eslint/no-explicit-any
>(config: {
  displayName?: string;
  defaultAs?: DefaultAs;
  defaultStyle?: CSSProperties;
  styleProps?: StyleProps & {
    [P in keyof StyleProps]: ValidStylePropName<
      P,
      never,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (value: any) => {
        [Q in keyof ReturnType<
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          StyleProps[P] extends (value: any) => unknown ? StyleProps[P] : never
        >]: Q extends keyof CSSProperties ? CSSProperties[Q] : never;
      }
    >;
  };
  conditions?: Conds;
  fallback?: "revert-layer" | "unset";
}): <
  As extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any> = DefaultAs, // eslint-disable-line @typescript-eslint/no-explicit-any
  LocalConditionName extends string = never,
>(
  props: {
    as?: As;
  } & Omit<
    JSX.LibraryManagedAttributes<As, ComponentPropsWithRef<As>>,
    never
  > & {
      [P in Conds extends Conditions<string>
        ? "conditions"
        : never]?: Conds extends Conditions<infer ConditionName>
        ? {
            [P in LocalConditionName]: ValidConditionName<
              P,
              never,
              Condition<ConditionName>
            >;
          }
        : never;
    } & Partial<{
      [P in
        | keyof StyleProps
        | `${
            | (Conds extends Conditions<infer ConditionName>
                ? ConditionName
                : never)
            | LocalConditionName}:${keyof StyleProps extends string ? keyof StyleProps : never}`]: P extends `${`${string}:` | ""}${infer PropertyName}`
        ? PropertyName extends keyof StyleProps
          ? StyleProps[PropertyName] extends (value: any) => unknown // eslint-disable-line @typescript-eslint/no-explicit-any
            ? Parameters<StyleProps[PropertyName]>[0]
            : never
          : never
        : never;
    }>,
) => JSX.Element;
