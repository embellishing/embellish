import type { HookId, Selector } from "@embellish/core";
import { createHooks as createHooksImpl } from "@embellish/core";
import { createElement } from "react";

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