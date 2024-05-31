import type {
  Digit,
  Letter,
  OnlyChars,
  UppercaseLetter,
} from "@embellish/core";
import type {
  Component,
  ComponentProps,
  ElementType,
  PropsWithRef,
  RefAttributes,
} from "react";

export type ValidComponentDisplayName<Name> =
  Name extends `${UppercaseLetter}${infer Tail}`
    ? OnlyChars<Letter | Digit, Tail>
    : never;

export type ValidStylePropName<Name> = Name extends `${Letter}${infer Tail}`
  ? OnlyChars<Letter | Digit, Tail>
  : never;

export type ComponentPropsWithRef<C extends ElementType> = PropsWithRef<
  C extends new (props: infer P) => Component<unknown, unknown>
    ? PropsWithRef<P> & RefAttributes<InstanceType<C>>
    : ComponentProps<C>
>;
