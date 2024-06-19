import type { Digit, Letter, OnlyChars } from "@embellish/core";
import type {
  Component,
  ComponentProps,
  ElementType,
  PropsWithRef,
  RefAttributes,
} from "react";

/**
 * Ensures that a style prop name is alphanumeric and begins with a letter.
 *
 * @public
 */
export type ValidStylePropName<Name, Invalid, Valid> =
  Name extends `${Letter}${infer Tail}`
    ? OnlyChars<Letter | Digit, Tail, Invalid, Valid>
    : Invalid;

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
