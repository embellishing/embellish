<p align="center">
  <!-- npm-remove -->
  <a href="https://github.com/embellishing/embellish/#gh-dark-mode-only" target="_blank">
    <img alt="Embellish" src="https://raw.githubusercontent.com/embellishing/embellish/HEAD/.github/logo-dark.svg" width="320" height="64" style="max-width: 100%;">
  </a>
  <!-- /npm-remove -->
  <a href="https://github.com/embellishing/embellish/#gh-light-mode-only" target="_blank">
    <img alt="Embellish" src="https://raw.githubusercontent.com/embellishing/embellish/HEAD/.github/logo-light.svg" width="320" height="64" style="max-width: 100%;">
  </a>
  <br/>
  A powerfully simple React styling solution
</p>

---

Embellish offers a powerful and intuitive way to style your React application
deterministically, without runtime style injection or extra build steps. Easily
create a polymorphic component with your own custom style props, and use a pure
CSS mechanism to apply styles conditionally, creating hover effects, responsive
behavior, and more. Consider this example of a `Box` component:

```tsx
<Box
  is="a"
  href="https://github.com/embellishing/embellish"
  color="#fff"
  background="#03f"
  hover:background="color-mix(in srgb, #03f, #fff 12.5%)"
  active:background="#c30">
  Get started
</Box>
```

With a styling API that builds upon the declarative nature of React, the `Box`
component enables you to manage complex styling scenarios with ease. Meanwhile,
Embellish's purely CSS-driven approach for defining conditions like `hover` and
`active` means that you can create dynamic and interactive UI elements without
compromising on performance or maintainability.

## Features

- **Conditional styles with pure CSS**: Under the hood, Embellish uses CSS
  Variables to apply styles conditionally based on pseudo-classes, at-rules, or
  arbitrary selector logic.
- **First-class style props**: Components expose CSS properties as first-class
  props. You can choose which ones to support or even define your own custom
  props.
- **Style prop conditions**: Specify the name of a condition as a style prop
  modifier, e.g. `hover:background="#333"`, and its value will apply only under
  that condition.
- **Inline conditions**: Conditions can be combined inline using logical
  operators, providing flexibility, promoting reuse, and keeping global CSS to a
  minimum.
- **No runtime style injection**: Avoid hydration mismatches, flashes of
  unstyled content, and questionable performance of runtime style injection.
- **No build step**: Simplify the development workflow by avoiding static
  analysis and extra build steps.
- **Near-perfect code splitting**: Most style information is embedded directly
  in component markup, with a minimal global style sheet used only to define
  reusable conditions.
- **No cascade defects**: Embellish's use of inline styles ensures that CSS
  rulesets can't "leak in" and modify private component implementation details.

## Installation

Install [@embellish/react](https://www.npmjs.com/package/@embellish/react) using
your package manager of choice, e.g.

```bash
npm install @embellish/react
```

## Getting started

### Step 1: CSS hooks

#### Step 1a: Define hooks

Start by defining CSS hooks. These are all of the "selectors" you want to use
throughout your app. These can be actual CSS selectors or even at-rules.

```typescript
import { createHooks } from "@embellish/react";

const { StyleSheet, hooks } = createHooks([
  "&:hover",
  "&:focus",
  "&:active",
  "&:disabled",
  "&[aria-disabled=true]",
  "@media (width >= 600px)",
]);
```

> [!NOTE]
>
> It's a good practice to keep these hooks as simple and generic as possible to
> promote reuse. Later, you can combine them to create more complex conditions.

#### Step 1b: Add style sheet

The `StyleSheet` component obtained in the previous step renders a small static
style sheet containing the CSS required to support conditional styling. Add this
to the root layout component or entry point of your app.

```diff
// e.g. src/main.tsx

root.render(
  <StrictMode>
+   <StyleSheet />
    <App />
  </StrictMode>
);
```

### Step 2: Create reusable conditions

A reusable condition assigns an alphanumeric alias (i.e. a valid prop name) to
each hook. You can also define complex conditions using logical operators.

```typescript
import { createConditions } from "@embellish/react";

const conditions = createConditions(hooks, {
  hover: "&:hover",
  focus: "&:focus",
  active: "&:active",
  disabled: { or: ["&:disabled", "&[aria-disabled=true]"] },
  intent: { or: ["&:hover", "&:focus"] },
  desktop: "@media (width >= 600px)",
});
```

> [!NOTE]
>
> At this stage, it's still a good practice to consider the reusability of each
> complex condition defined here. You can define
> [inline conditions](#inline-conditions) later for one-off use cases.

### Step 3: Create style props

Use the `createStyleProps` function to define style props. The keys of the
configuration object are the prop names, with each entry consisting of either

- a function, parameterized by the prop value, which returns a React
  `CSSProperties` object; or
- `true`, indicating that a default implementation should be used (standard CSS
  properties only)

```typescript
import { createStyleProps } from "@embellish/react";

const styleProps = createStyleProps({
  backgroundColor: (value: CSSProperties["backgroundColor"]) => ({
    backgroundColor: value,
  }), // defined as a function for illustrative purposes
  border: true,
  borderRadius: true,
  color: true,
  cursor: true,
  display: true,
  fontSize: true,
  fontWeight: true,
  outline: true,
  outlineOffset: true,
  padding: true,
  transition: true,
});
```

### Step 4: Create a component

Create a `Box` component using the conditions defined in the previous step along
with your desired style props.

```typescript
import { createComponent } from "@embellish/react";

const Box = createComponent({
  displayName: "Box", // recommended for debugging purposes
  defaultAs: "div", // optional, any HTML tag or component
  defaultStyle: () => ({
    // optional, a regular React style object consisting of "base" styles
    boxSizing: "border-box",
    textDecoration: "none",
  }),
  conditions,
  styleProps,
});
```

### Step 5: Use the component

Use your `Box` component to create a styled button:

```tsx
function CtaButton({
  href,
  children,
  disabled,
}: {
  href: string;
  children?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Box
      is="a"
      href={href}
      aria-disabled={disabled}
      display="inline-block"
      backgroundColor="#6200ea"
      color="#ffffff"
      padding="12px 24px"
      border="none"
      borderRadius="4px"
      cursor="pointer"
      fontSize="16px"
      fontWeight="bold"
      transition="background-color 0.3s, color 0.3s"
      intent:backgroundColor="#3700b3"
      active:backgroundColor="#6200ea"
      active:color="#bb86fc"
      focus:outline="2px solid #03dac6"
      focus:outlineOffset="2px"
      disabled:cursor="not-allowed">
      {children}
    </Box>
  );
}
```

## Advanced usage

### Inline conditions

You can compose conditions inline using logical operators, creating maximum
flexibility and reuse for the hooks you defined in Step 1 above. Simply pass
additional conditions to the `conditions` prop, and then use them as style prop
modifiers:

```diff
function CtaButton({
  href,
  children,
  disabled,
}: {
  href: string;
  children?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Box
+     conditions={{
+       intentEnabled: {
+         and: ["intent", { not: "disabled" }],
+       },
+       activeEnabled: {
+         and: ["active", { not: "disabled" }],
+       },
+       focusEnabled: {
+         and: ["focus", { not: "disabled" }],
+       },
+     }}
      is="a"
      href={href}
      aria-disabled={disabled}
      display="inline-block"
      backgroundColor="#6200ea"
      color="#ffffff"
      padding="12px 24px"
      border="none"
      borderRadius="4px"
      cursor="pointer"
      fontSize="16px"
      fontWeight="bold"
      transition="background-color 0.3s, color 0.3s"
-     intent:backgroundColor="#3700b3"
-     active:backgroundColor="#6200ea"
-     active:color="#bb86fc"
-     focusEnabled:outline="2px solid #03dac6"
+     intentEnabled:backgroundColor="#3700b3"
+     activeEnabled:backgroundColor="#6200ea"
+     activeEnabled:color="#bb86fc"
+     focusEnabled:outline="2px solid #03dac6"
      focus:outlineOffset="2px"
      disabled:cursor="not-allowed">
      {children}
    </Box>
  );
}
```

## Browser support

| <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/74.1.0/chrome/chrome_24x24.png" alt="Chrome" /><br/>Chrome | <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/74.1.0/edge/edge_24x24.png" alt="Edge" /><br/>Edge | <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/74.1.0/safari/safari_24x24.png" alt="Safari" /><br/>Safari | <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/74.1.0/firefox/firefox_24x24.png" alt="Firefox" /><br/>Firefox | <img src="https://cdnjs.cloudflare.com/ajax/libs/browser-logos/74.1.0/opera/opera_24x24.png" alt="Opera" /><br/>Opera |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| <div align="center">49+</div>                                                                                             | <div align="center">16+</div>                                                                                     | <div align="center">10+</div>                                                                                             | <div align="center">31+</div>                                                                                                 | <div align="center">36+</div>                                                                                         |

## Contributing

Contributions are welcome. Please see the
[contributing guidelines](CONTRIBUTING.md) for more information.

## License

Embellish is offered under the [MIT license](LICENSE).
