import type { Hooks, Selector } from "@embellish/core";
import { createHooks as createHooksImpl } from "@embellish/core";
import { createElement } from "react";

/**
 * Values returned from the {@link createHooks} function
 *
 * @typeParam S - The type of the selector logic used in each hook
 *
 * @public
 */
export interface CreateHooksResult<S extends Selector> {
  /**
   * A component that renders a `style` element containing the style sheet
   * required to support the hooks. This should be rendered at the entry point
   * or in the root layout component of the application.
   */
  StyleSheet: () => JSX.Element;

  /**
   * Hooks implementing the specified selector logic and represented in the
   * corresponding style sheet
   */
  hooks: Hooks<S>;
}

/**
 * Creates hooks from the provided selectors.
 *
 * @typeParam S - The type of selector logic used for each hook
 * @param selectors - The selector logic used for each hook
 *
 * @returns A set of hooks implementing the specified selector logic along with
 * the `StyleSheet` component needed to support them
 *
 * @public
 */
export function createHooks<S extends Selector>(
  selectors: S[],
): CreateHooksResult<S> {
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
