import type {
  Condition,
  createConditions,
  Digit,
  Letter,
  OnlyChars,
  UppercaseLetter,
  ValidConditionName,
} from "@embellish/core";
import type * as CSS from "csstype";
import type {
  Component,
  ComponentProps,
  CSSProperties,
  ElementType,
  PropsWithoutRef,
  PropsWithRef,
  RefAttributes,
} from "react";

export type ValidComponentDisplayName<Name> =
  Name extends `${UppercaseLetter}${infer Tail}`
    ? OnlyChars<Letter | Digit, Tail>
    : never;

export type ValidPropertyName<Name> = Name extends `${Letter}${infer Tail}`
  ? OnlyChars<Letter | Digit, Tail>
  : never;

export type StyleProps<Namespace, Properties> = {
  [Property in keyof Properties as `${Namespace extends string
    ? Namespace
    : never}:${Property extends string
    ? Property
    : never}`]: Properties[Property];
};

export type ComponentPropsWithRef<C extends ElementType> = PropsWithRef<
  C extends new (props: infer P) => Component<unknown, unknown>
    ? PropsWithoutRef<P> & RefAttributes<InstanceType<C>>
    : ComponentProps<C>
>;

export type BoxComponent<
  DisplayName extends string,
  DefaultIs extends keyof JSX.IntrinsicElements,
  ConditionName,
  Properties,
> = <
  Is extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<unknown> = DefaultIs,
  LocalConditionName extends string = never,
>(
  props: {
    [P in `${Uncapitalize<DisplayName>}:is`]?: Is;
  } & {
    [P in ConditionName extends never
      ? never
      : `${Uncapitalize<DisplayName>}:conditions`]?: {
      [P in LocalConditionName]: ValidConditionName<P> &
        Condition<ConditionName>;
    };
  } & Omit<
      JSX.LibraryManagedAttributes<Is, ComponentPropsWithRef<Is>>,
      "style"
    > &
    StyleProps<"initial" | ConditionName | LocalConditionName, Properties>,
) => JSX.Element;

declare function createBox<
  Conditions,
  Properties,
  DisplayName extends string = "Box",
  DefaultIs extends keyof JSX.IntrinsicElements = "div",
>(config: {
  displayName?: DisplayName & ValidComponentDisplayName<DisplayName>;
  defaultIs?: DefaultIs;
  conditions?: Pick<
    ReturnType<typeof createConditions<Conditions>>,
    "createConditions" | "conditionNames" | "conditionalExpression"
  >;
  properties: {
    [P in keyof Properties]: ValidPropertyName<P> &
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Properties[P] extends (value: any) => CSSProperties ? unknown : never) &
      Properties[P];
  };
  fallback?: "revert-layer" | "unset";
}): BoxComponent<
  DisplayName,
  DefaultIs,
  ReturnType<typeof createConditions<Conditions>>["conditionNames"][number],
  Partial<{
    [P in keyof Properties]: Properties[P] extends (value: infer V) => unknown
      ? V
      : never;
  }>
>;

export const standardLonghandProperties: Required<{
  [P in keyof CSS.StandardLonghandProperties]: (
    value: CSSProperties[P],
  ) => CSSProperties;
}>;

export const standardShorthandProperties: Required<{
  [P in keyof CSS.StandardShorthandProperties]: (
    value: CSSProperties[P],
  ) => CSSProperties;
}>;

export const vendorLonghandProperties: Required<{
  [P in keyof CSS.VendorLonghandProperties]: (
    value: CSSProperties[P],
  ) => CSSProperties;
}>;

export const vendorShorthandProperties: Required<{
  [P in keyof CSS.VendorShorthandProperties]: (
    value: CSSProperties[P],
  ) => CSSProperties;
}>;
