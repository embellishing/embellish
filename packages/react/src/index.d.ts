import type {
  Condition,
  Conditions,
  Digit,
  Letter,
  OnlyChars,
  UppercaseLetter,
  ValidConditionName,
} from "@embellish/core";
import type {
  Component,
  ComponentProps,
  CSSProperties,
  ElementType,
  PropsWithoutRef,
  PropsWithRef,
  RefAttributes,
} from "react";

export * from "@embellish/core";

export type ValidComponentDisplayName<Name> =
  Name extends `${UppercaseLetter}${infer Tail}`
    ? OnlyChars<Letter | Digit, Tail>
    : never;

export type ValidStylePropName<Name> = Name extends `${Letter}${infer Tail}`
  ? OnlyChars<Letter | Digit, Tail>
  : never;

export type ComponentPropsWithRef<C extends ElementType> = PropsWithRef<
  C extends new (props: infer P) => Component<unknown, unknown>
    ? PropsWithoutRef<P> & RefAttributes<InstanceType<C>>
    : ComponentProps<C>
>;

declare function createComponent<
  StyleProps,
  ConditionName,
  const DisplayName extends string = "Box",
  DefaultIs extends keyof JSX.IntrinsicElements = "div",
>(config: {
  displayName?: DisplayName & ValidComponentDisplayName<DisplayName>;
  defaultIs?: DefaultIs;
  defaultStyle?: CSSProperties;
  styleProps: StyleProps & {
    [P in keyof StyleProps]: ValidStylePropName<P> & StyleProps[P];
  } & Record<string, (value: any) => CSSProperties>; // eslint-disable-line @typescript-eslint/no-explicit-any
  conditions?: Conditions<ConditionName>;
  fallback?: "revert-layer" | "unset";
}): <
  Is extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<unknown> = DefaultIs,
  LocalConditionName extends string = never,
>(
  props: {
    [P in `${Uncapitalize<DisplayName>}:is`]?: Is;
  } & Omit<
    JSX.LibraryManagedAttributes<Is, ComponentPropsWithRef<Is>>,
    "style"
  > & {
      [P in ConditionName extends never
        ? never
        : `${Uncapitalize<DisplayName>}:conditions`]?: {
        [P in LocalConditionName]: ValidConditionName<P> &
          Condition<ConditionName>;
      };
    } & Partial<{
      [P in `${
        | "initial"
        | ConditionName
        | LocalConditionName}:${keyof StyleProps}`]: P extends `${string}:${infer PropertyName}`
        ? Parameters<StyleProps[PropertyName]>[0]
        : never;
    }>,
) => JSX.Element;
