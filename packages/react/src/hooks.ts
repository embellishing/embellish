import type { HookId, Selector } from "@embellish/core";
import { createHooks as createHooksImpl } from "@embellish/core";
import { createElement } from "react";

/**
 * Creates the specified CSS hooks.
 *
 * @typeParam Selectors - The type of the selector logic for each hook
 * @param selectors - The selector logic for each hook
 *
 * @returns A set of hooks implementing the specified selector logic along with
 * the `StyleSheet` component required to support them
 *
 * @public
 */
export function createHooks<Selectors extends Selector[]>(
  selectors: Selectors,
): {
  StyleSheet(): JSX.Element;
  hooks: { [Hook in Selectors[number]]: HookId };
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
