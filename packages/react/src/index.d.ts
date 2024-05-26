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

export function createComponent<
  StyleProps,
  ConditionName extends string,
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
        | LocalConditionName}:${keyof StyleProps extends string ? keyof StyleProps : never}`]: P extends `${string}:${infer PropertyName}`
        ? PropertyName extends keyof StyleProps
          ? StyleProps[PropertyName] extends (value: any) => unknown // eslint-disable-line @typescript-eslint/no-explicit-any
            ? Parameters<StyleProps[PropertyName]>[0]
            : never
          : never
        : never;
    }>,
) => JSX.Element;
