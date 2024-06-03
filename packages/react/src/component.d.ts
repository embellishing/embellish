import type {
  Condition,
  Conditions,
  ValidConditionName,
} from "@embellish/core";
import type React, { CSSProperties } from "react";

import type {
  ComponentPropsWithRef,
  ValidComponentDisplayName,
  ValidStylePropName,
} from "./types";

export function createComponent<
  const DisplayName extends string,
  StyleProps,
  Conds,
  DefaultAs extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<any> = "div", // eslint-disable-line @typescript-eslint/no-explicit-any
>(config: {
  displayName: DisplayName & ValidComponentDisplayName<DisplayName>;
  defaultAs?: DefaultAs;
  defaultStyle?: CSSProperties;
  styleProps?: StyleProps & {
    [P in keyof StyleProps]: ValidStylePropName<P> &
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((value: any) => {
        [Q in keyof ReturnType<StyleProps[P]>]: Q extends keyof CSSProperties
          ? CSSProperties[Q]
          : never;
      });
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
    "style"
  > & {
      [P in Conds extends Conditions<unknown>
        ? "conditions"
        : never]?: Conds extends Conditions<infer ConditionName>
        ? {
            [P in LocalConditionName]: ValidConditionName<P> &
              Condition<ConditionName>;
          }
        : never;
    } & Partial<{
      [P in `${
        | "initial"
        | (Conds extends Conditions<infer ConditionName>
            ? ConditionName
            : never)
        | LocalConditionName}:${keyof StyleProps extends string ? keyof StyleProps : never}`]: P extends `${string}:${infer PropertyName}`
        ? PropertyName extends keyof StyleProps
          ? StyleProps[PropertyName] extends (value: any) => unknown // eslint-disable-line @typescript-eslint/no-explicit-any
            ? Parameters<StyleProps[PropertyName]>[0]
            : never
          : never
        : never;
    }>,
) => JSX.Element;
