import type { HookId, Selector } from "@embellish/core";
import { createHooks as createHooksImpl } from "@embellish/core";
import { createElement } from "react";

/**
 * Creates the specified CSS hooks.
 *
 * @typeParam Hooks - The type of the hooks to create.
 * @param hooks - The hooks to create.
 *
 * @returns The created hooks along with the `StyleSheet` component required to support them.
 *
 * @public
 */
export function createHooks<Hooks extends Selector[]>(
  hooks: Hooks,
): {
  StyleSheet(): JSX.Element;
  hooks: { [Hook in Hooks[number]]: HookId };
} {
  const { styleSheet, ...rest } = createHooksImpl(hooks);
  return {
    ...rest,
    StyleSheet() {
      return createElement("style", {
        dangerouslySetInnerHTML: { __html: styleSheet() },
      });
    },
  };
}
