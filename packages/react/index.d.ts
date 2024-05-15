import {
  Component,
  ComponentProps,
  ComponentType,
  PropsWithRef,
  PropsWithoutRef,
} from "react";

export type Chars<S, Acc = never> = S extends `${infer Head}${infer Tail}`
  ? Chars<Tail, Acc | Head>
  : Acc;

export type Letter<A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"> =
  | Chars<A>
  | Lowercase<Chars<A>>;

export type Digit<A = "01234567890"> = Chars<A> | Lowercase<Chars<A>>;

export type OnlyChars<C, S> = S extends `${infer Head}${infer Tail}`
  ? Head extends C
    ? unknown & OnlyChars<C, Tail>
    : never
  : unknown;

export type ValidConditionName<Name> = Name extends `${Letter}${infer Tail}`
  ? OnlyChars<Letter | Digit, Tail>
  : never;

export type Condition<S> = S | { and: S[] } | { or: S[] } | { not: S };

export type Selector =
  | `${string}&${string}`
  | `@${"media" | "container" | "supports"} ${string}`;

export type StyleProps<ConditionName, Properties> = {
  [Property in keyof Properties as `${ConditionName}:${Property}`]: Properties[Property];
};

export type ComponentPropsWithRef<C extends ElementType> = PropsWithRef<
  C extends new (props: infer P) => Component<unknown, unknown>
    ? PropsWithoutRef<P> & RefAttributes<InstanceType<C>>
    : ComponentProps<C>
>;

export type BoxComponent<ConditionName, Properties> = <
  Is extends
    | keyof JSX.IntrinsicElements
    | React.JSXElementConstructor<unknown> = "div",
  LocalConditionName = ""
>(
  props: {
    "box:is"?: Is;
    "box:conditions"?: {
      [P in LocalConditionName]: ValidConditionName<P> &
        Condition<ConditionName>;
    };
  } & Omit<
    JSX.LibraryManagedAttributes<Is, ComponentPropsWithRef<Is>>,
    "style"
  > &
    StyleProps<"initial" | ConditionName | LocalConditionName, Properties>
) => JSX.Element;

export type GetProperties<ConfigProperties> = Partial<{
  [P in keyof ConfigProperties]: Parameters<ConfigProperties[P]>[0];
}>;

export type Config<ConditionName, ConfigProperties> = {
  conditions?: {
    [P in ConditionName]: ValidConditionName<P> & Condition<Selector>;
  };
  properties?: ConfigProperties;
  fallback?: "revert-layer" | "unset";
  debug?: boolean;
};

export type EmbellishResult<ConditionName, Properties> = {
  StyleSheet: ComponentType<Record<string, never>>;
  Box: BoxComponent<ConditionName, Properties>;
};

export type EmbellishFn = <ConditionName, ConfigProperties>(
  config: Config<ConditionName, ConfigProperties>
) => EmbellishResult<ConditionName, GetProperties<ConfigProperties>>;

export const embellish: CreateBoxFn;
