import { createConditions, createHooks } from "../src/index.js";

// type-level tests

() => {
  // complex reusable conditions
  const { hooks } = createHooks([
    "@media (prefers-color-scheme: dark)",
    "&:hover",
    "&.active",
  ]);
  createConditions(hooks, {
    dark: "@media (prefers-color-scheme: dark)",
    hoverUnselected: { and: ["&:hover", { not: "&.active" }] },
  });
};
