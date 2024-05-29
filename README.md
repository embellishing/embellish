<p align="center">
  <!-- npm-remove -->
  <a href="https://github.com/embellishes/embellish/#gh-dark-mode-only" target="_blank">
    <img alt="Embellish" src="https://raw.githubusercontent.com/embellishes/embellish/HEAD/.github/logo-dark.svg" width="324" height="64" style="max-width: 100%;">
  </a>
  <!-- /npm-remove -->
  <a href="https://github.com/embellishes/embellish/#gh-light-mode-only" target="_blank">
    <img alt="Embellish" src="https://raw.githubusercontent.com/embellishes/embellish/HEAD/.github/logo-light.svg" width="324" height="64" style="max-width: 100%;">
  </a>
</p>

<p align="center">
  A powerfully <em>simple</em> React styling primitive
</p>

<p align="center">
  <a href="https://github.com/embellishes/embellish/actions/workflows/build.yml"><img src="https://img.shields.io/github/actions/workflow/status/embellishes/embellish/build.yml?branch=master" alt="Build Status"></a>
  <a href="https://www.npmjs.com/org/embellish"><img src="https://img.shields.io/npm/v/@embellish%2Freact.svg" alt="Latest Release"></a>
  <a href="https://github.com/embellishes/embellish/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@embellish/react.svg" alt="License"></a>
</p>

---

Embellish offers a powerful and intuitive way to style your React application
deterministically, without runtime style injection or extra build steps. Easily
create a polymorphic component with your own custom style props, and use a pure
CSS mechanism to apply styles conditionally, creating hover effects, responsive
behavior, and more. Consider this example of a `Box` component:

```tsx
<Box
  box:is="a"
  href="https://github.com/embellishes/embellish"
  initial:color="#fff"
  initial:background="#03f"
  hover:background="color-mix(in srgb, #03f, #fff 12.5%)"
  active:background="#c30">
  Get started
</Box>
```

With a styling API that builds heavily upon the declarative nature of React, the
`Box` component enables you to manage complex styling scenarios with ease.
Meanwhile, Embellish's purely CSS-based approach for defining conditions like
`hover` and `active` means that you can create dynamic and interactive UI
elements without compromising on performance or maintainability.

## Features

- **Conditional styles with pure CSS**: Under the hood, Embellish uses CSS
  Variables to apply styles conditionally based on pseudo-classes, at-rules, or
  arbitrary selector logic.
- **First-class style props**: Components expose CSS properties as first-class
  props. You can choose which ones to support or even define your own custom
  props.
- **Style prop conditions**: Specify the name of a condition as a style prop
  prefix, e.g. `hover:background="#333"`, and its value will apply only under
  that condition.
- **Locally-defined conditions**: Conditions can be combined in a single
  component instance using logical operators, providing flexibility, promoting
  reuse, and keeping global CSS to a minimum.
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

```bash
npm install @embellish/react
```

## Getting started

### Step 1: Define CSS hooks

Start by defining CSS hooks. These are all of the CSS "selectors" you want to
use throughout your app. These can be actual selectors, e.g., `&:hover`,
`&.foo`, or `:checked ~ &`, where `&` is a placeholder for the element to which
the conditional style is to be applied; or even `@media`, `@container`, or
`@supports` rules.

```typescript
const { styleSheet, hooks } = createHooks([
  "&:hover",
  "&:focus",
  "&:active",
  "&:disabled",
  "&[aria-disabled=true]",
  "@media (width >= 600px)",
]);
```

> [!NOTE] It's a good practice to keep these hooks as simple and generic as
> possible to promote reuse. As you'll see in the next step, it's possible to
> combine them later to create more complex conditions.

#### Step 1b: Add style sheet

The `styleSheet` function obtained in the previous step returns a small static
style sheet containing the CSS required to support conditional styling. Add this
in a `<style>` element in the root layout component or entry point of your app.

```diff
// e.g. src/main.ts

root.render(
  <StrictMode>
+   <style dangerouslySetInnerHTML={{ __html: styleSheet() }} />
    <App />
  </StrictMode>
);
```

### Step 2: Create reusable conditions

A reusable condition assigns an alphanumeric alias (i.e. a valid prop name) to
each hook. You can also define a complex condition using logical operators.

```typescript
const conditions = createConditions(hooks, {
  hover: "&:hover",
  focus: "&:focus",
  active: "&:active",
  disabled: { or: ["&:disabled", "&[aria-disabled=true]"] },
  intent: { or: ["&:hover", "&:focus"] },
  desktop: "@media (width >= 600px)",
});
```

### Step 3: Create a component

Create e.g. a `Box` component using the conditions defined in the previous step
along with your desired style props.

```typescript
const Box = createComponent({
  displayName: "Box",
  defaultIs: "div", // optional, any HTML tag or component
  defaultStyle: {
    // optional, a regular React style object consisting of "base" styles
    boxSizing: "border-box",
  },
  conditions,
  styleProps: {
    backgroundColor: (backgroundColor: CSSProperties["backgroundColor"]) => ({
      backgroundColor,
    }),
    color: (color: CSSProperties["color"]) => ({
      color,
    }),
    outline: (outline: CSSProperties["outline"]) => ({
      outline,
    }),
    outlineOffset: (outlineOffset: CSSProperties["outlineOffset"]) => ({
      outlineOffset,
    }),
    padding: (padding: CSSProperties["padding"]) => ({
      padding,
    }),
    border: (border: CSSProperties["border"]) => ({
      border,
    }),
    borderRadius: (borderRadius: CSSProperties["borderRadius"]) => ({
      borderRadius,
    }),
    cursor: (cursor: CSSProperties["cursor"]) => ({
      cursor,
    }),
    fontSize: (fontSize: CSSProperties["fontSize"]) => ({
      fontSize,
    }),
    fontWeight: (fontWeight: CSSProperties["fontWeight"]) => ({
      fontWeight,
    }),
    transition: (transition: CSSProperties["transition"]) => ({
      transition,
    }),
    // define any additional style props you'd like to use
  },
});
```

### Step 4: Use the component

Use your `Box` component to create e.g. a styled button:

```tsx
function CtaButton({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <Box
      box:is="a"
      href={href}
      initial:backgroundColor="#6200ea"
      initial:color="#ffffff"
      initial:padding="12px 24px"
      initial:border="none"
      initial:borderRadius="4px"
      initial:cursor="pointer"
      initial:fontSize="16px"
      initial:fontWeight="bold"
      initial:transition="background-color 0.3s, color 0.3s"
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
