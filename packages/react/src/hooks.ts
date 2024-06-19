import type { Hooks, Selector } from "@embellish/core";
import { createHooks as createHooksImpl } from "@embellish/core";
import { createElement } from "react";

/**
 * Creates hooks from the provided selectors.
 *
 * @typeParam S - The type of selector logic used for each hook
 * @param selectors - The selector logic used for each hook
 *
 * @returns A set of hooks implementing the specified selector logic along with
 * the `StyleSheet` component required to support them
 *
 * @public
 */
export function createHooks<S extends Selector>(
  selectors: S[],
): {
  StyleSheet(): JSX.Element;
  hooks: Hooks<S>;
} {
  const { styleSheet, ...rest } = createHooksImpl(selectors);
  return {
    ...rest,
    StyleSheet() {
      return createElement("style", {
        dangerouslySetInnerHTML: { __html: styleSheet() },
      });
    },
  };
}
