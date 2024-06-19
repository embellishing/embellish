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

/**
 * Ensures that a component display name is alphanumeric and begins with an
 * uppercase letter.
 *
 * @public
 */
export type ValidComponentDisplayName<Name> =
  Name extends `${UppercaseLetter}${infer Tail}`
    ? OnlyChars<Letter | Digit, Tail>
    : never;

/**
 * Ensures that a style prop name is alphanumeric and begins with a letter.
 *
 * @public
 */
export type ValidStylePropName<Name> = Name extends `${Letter}${infer Tail}`
  ? OnlyChars<Letter | Digit, Tail>
  : never;

/**
 * Represents the props of a React component, including refs.
 *
 * @typeParam C - The type of the component.
 *
 * @public
 */
export type ComponentPropsWithRef<C extends ElementType> = PropsWithRef<
  C extends new (props: infer P) => Component<unknown, unknown>
    ? PropsWithRef<P> & RefAttributes<InstanceType<C>>
    : ComponentProps<C>
>;
