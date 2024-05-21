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
without runtime style injection, extra build steps, or cascade defects. With the
ability to define your own custom style properties and apply them conditionally
using a pure CSS mechanism, the `Box` component provides a flexible and
declarative API for rendering styled elements.

## Features

- **Conditional styles with pure CSS**: Under the hood, Embellish uses CSS
  Variables to apply styles conditionally based on pseudo-classes,
  media/container queries, or arbitrary selector logic.
- **First-class style properties**: The `Box` component exposes CSS properties
  as first-class component props. You can extend or replace these with your own
  custom style properties.
- **Style property conditions**: Specify the name of a condition as a style
  property prefix, e.g. `hover:background="#333"`, and its value will apply only
  under that condition.
- **Locally-defined conditions**: Conditions can be combined in a single `Box`
  instance using logical operators, providing flexibility, promoting reuse, and
  keeping global CSS to a minimum.
- **No runtime style injection**: Avoid hydration mismatches, flashes of
  unstyled content, and various other pitfalls of runtime style injection.
- **No build step**: Simplify the development workflow by avoiding static
  analysis and extra build steps.
- **Near-perfect code splitting**: Most style information is embedded directly
  in component markup, with a minimal global style sheet used only to define
  reusable conditions.
- **No cascade defects**: Embellish's use of inline styles ensures that CSS
  rulesets can't "leak in" and modify private component implementation details.
