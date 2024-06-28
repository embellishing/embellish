import assert from "node:assert";
import { test } from "node:test";

import type { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer";
import { renderToString } from "react-dom/server";

import {
  createComponent,
  createConditions,
  createHooks,
  createStyleProps,
} from "../src/index.js";

function hex(value: string) {
  const rgb = Array.from(value.match(/^rgb\((([0-9]+,\s?){2}[0-9]+)\)$/) || [])
    .filter((_, ix) => ix === 1)
    .flatMap(x => x.split(","))
    .map(x => parseInt(x.trim()));
  if (rgb.length) {
    return `#${rgb
      .map(x => {
        const channel = x.toString(16);
        return channel.length === 1 ? `0${channel}` : channel;
      })
      .join("")}`;
  }
  throw new Error(
    `Unexpected color format "${value}". Only rgb values are currently accepted.`,
  );
}

async function withBrowser<T>(f: (browser: Browser) => Promise<T>): Promise<T> {
  const browser = await puppeteer.launch();
  try {
    return await f(browser);
  } finally {
    await browser.close();
  }
}

async function withPage<T>(f: (page: Page) => Promise<T>): Promise<T> {
  return await withBrowser(async browser => {
    const page = await browser.newPage();
    return f(page);
  });
}

function renderContent(page: Page, content: JSX.Element) {
  return page.setContent(
    `<!DOCTYPE html><body>${renderToString(content)}</body>`,
  );
}

async function queryComputedStyle(
  page: Page,
  selector: string,
): Promise<ReturnType<typeof getComputedStyle>> {
  const result = await page.evaluate(selector => {
    const element = document.querySelector(selector);
    if (!element) {
      return null;
    }
    return JSON.parse(JSON.stringify(getComputedStyle(element))) as ReturnType<
      typeof getComputedStyle
    >;
  }, selector);
  if (!result) {
    throw new Error(`Failed to query style of element: ${selector}`);
  }
  return result;
}

test("default style", async () => {
  const Box = createComponent({
    defaultStyle: {
      background: "#0000ff",
    },
  });
  const style = await withPage(async page => {
    await renderContent(page, <Box id="box" />);
    return await queryComputedStyle(page, "#box");
  });
  assert.strictEqual(hex(style.backgroundColor), "#0000ff");
});

test("`style` prop", async () => {
  const Box = createComponent({});
  const style = await withPage(async page => {
    await renderContent(
      page,
      <Box id="box" style={{ backgroundColor: "#ff0000" }} />,
    );
    return await queryComputedStyle(page, "#box");
  });
  assert.strictEqual(hex(style.backgroundColor), "#ff0000");
});

test("style props", async () => {
  const Box = createComponent({
    styleProps: createStyleProps({
      padding: true,
      color: true,
      fontSize: true,
    }),
  });
  const style = await withPage(async page => {
    await renderContent(
      page,
      <Box id="box" padding={16} color="#333333" fontSize={14} />,
    );
    return await queryComputedStyle(page, "#box");
  });
  assert.strictEqual(style.padding, "16px");
  assert.strictEqual(hex(style.color), "#333333");
  assert.strictEqual(style.fontSize, "14px");
});

test("declaration ordering - default style vs. `style` prop", async () => {
  const Box = createComponent({
    defaultStyle: {
      color: "#0000ff",
    },
  });
  const style = await withPage(async page => {
    await renderContent(page, <Box id="box" style={{ color: "#ff0000" }} />);
    return await queryComputedStyle(page, "#box");
  });
  assert.strictEqual(hex(style.color), "#ff0000");
});

test("declaration ordering - `style` prop vs. style prop", async () => {
  const Box = createComponent({
    styleProps: createStyleProps({ color: true }),
  });
  const style = await withPage(async page => {
    await renderContent(
      page,
      <Box id="box" color="#ff0000" style={{ color: "#0000ff" }} />,
    );
    return await queryComputedStyle(page, "#box");
  });
  assert.strictEqual(hex(style.color), "#ff0000");
});

test("simple reusable condition", async () => {
  const { StyleSheet, hooks } = createHooks(["&:hover"]);
  const Box = createComponent({
    conditions: createConditions(hooks, {
      hover: "&:hover",
    }),
    styleProps: createStyleProps({ color: true }),
  });
  const { style, hoverStyle } = await withPage(async page => {
    await renderContent(
      page,
      <>
        <StyleSheet />
        <Box is="button" id="box" color="#0000ff" hover:color="#ff0000" />
      </>,
    );
    const style = await queryComputedStyle(page, "#box");
    await page.hover("#box");
    const hoverStyle = await queryComputedStyle(page, "#box");
    return { style, hoverStyle };
  });
  assert.strictEqual(hex(style.color), "#0000ff");
  assert.strictEqual(hex(hoverStyle.color), "#ff0000");
});

test('reusable "and" condition', async () => {
  const { StyleSheet, hooks } = createHooks(["&:enabled", "&:hover"]);
  const Box = createComponent({
    conditions: createConditions(hooks, {
      enabledHover: { and: ["&:enabled", "&:hover"] },
    }),
    styleProps: createStyleProps({ color: true }),
  });
  const { disabledStyle, disabledHoverStyle, enabledStyle, enabledHoverStyle } =
    await withPage(async page => {
      await renderContent(
        page,
        <>
          <StyleSheet />
          <Box
            is="button"
            id="disabledBox"
            disabled
            color="#0000ff"
            enabledHover:color="#ff0000"
          />
          <Box
            is="button"
            id="enabledBox"
            color="#0000ff"
            enabledHover:color="#ff0000"
          />
        </>,
      );
      const disabledStyle = await queryComputedStyle(page, "#disabledBox");
      const enabledStyle = await queryComputedStyle(page, "#enabledBox");
      await page.hover("#disabledBox");
      const disabledHoverStyle = await queryComputedStyle(page, "#disabledBox");
      await page.hover("#enabledBox");
      const enabledHoverStyle = await queryComputedStyle(page, "#enabledBox");
      return {
        disabledStyle,
        enabledStyle,
        disabledHoverStyle,
        enabledHoverStyle,
      };
    });
  assert.strictEqual(hex(disabledStyle.color), "#0000ff");
  assert.strictEqual(hex(enabledStyle.color), "#0000ff");
  assert.strictEqual(hex(disabledHoverStyle.color), "#0000ff");
  assert.strictEqual(hex(enabledHoverStyle.color), "#ff0000");
});

test('reusable "or" condition', async () => {
  const { StyleSheet, hooks } = createHooks([
    "&[aria-disabled=true]",
    "&:disabled",
  ]);
  const Box = createComponent({
    conditions: createConditions(hooks, {
      disabled: { or: ["&[aria-disabled=true]", "&:disabled"] },
    }),
    styleProps: createStyleProps({ color: true }),
  });
  const { linkStyle, buttonStyle, disabledLinkStyle, disabledButtonStyle } =
    await withPage(async page => {
      await renderContent(
        page,
        <>
          <StyleSheet />
          <Box
            is="a"
            id="enabledLink"
            color="#000000"
            disabled:color="#999999"
          />
          <Box
            is="a"
            id="disabledLink"
            aria-disabled="true"
            color="#000000"
            disabled:color="#999999"
          />
          <Box
            is="button"
            id="enabledButton"
            color="#000000"
            disabled:color="#999999"
          />
          <Box
            is="button"
            id="disabledButton"
            disabled
            color="#000000"
            disabled:color="#999999"
          />
        </>,
      );
      const linkStyle = await queryComputedStyle(page, "#enabledLink");
      const disabledLinkStyle = await queryComputedStyle(page, "#disabledLink");
      const buttonStyle = await queryComputedStyle(page, "#enabledButton");
      const disabledButtonStyle = await queryComputedStyle(
        page,
        "#disabledButton",
      );
      return {
        linkStyle,
        disabledLinkStyle,
        buttonStyle,
        disabledButtonStyle,
      };
    });
  assert.strictEqual(hex(linkStyle.color), "#000000");
  assert.strictEqual(hex(disabledLinkStyle.color), "#999999");
  assert.strictEqual(hex(buttonStyle.color), "#000000");
  assert.strictEqual(hex(disabledButtonStyle.color), "#999999");
});

test('reusable "not" condition', async () => {
  const { StyleSheet, hooks } = createHooks(["&:hover"]);
  const Box = createComponent({
    conditions: createConditions(hooks, {
      unhover: { not: "&:hover" },
    }),
    styleProps: createStyleProps({ color: true }),
  });
  const { style, hoverStyle } = await withPage(async page => {
    await renderContent(
      page,
      <>
        <StyleSheet />
        <Box is="button" id="box" color="#ff0000" unhover:color="#0000ff" />
      </>,
    );
    const style = await queryComputedStyle(page, "#box");
    await page.hover("#box");
    const hoverStyle = await queryComputedStyle(page, "#box");
    return { style, hoverStyle };
  });
  assert.strictEqual(hex(style.color), "#0000ff");
  assert.strictEqual(hex(hoverStyle.color), "#ff0000");
});

test("reusable complex condition", async () => {
  const { StyleSheet, hooks } = createHooks(["&.a", "&.b", "&.c"]);
  const Box = createComponent({
    conditions: createConditions(hooks, {
      condition: {
        or: [
          { and: [{ not: { or: ["&.a", "&.b", "&.c"] } }] },
          { and: ["&.a", "&.b", { not: "&.c" }] },
          { and: [{ not: "&.a" }, "&.b", "&.c"] },
        ],
      },
    }),
    styleProps: createStyleProps({ color: true }),
  });
  await withPage(async page => {
    await renderContent(
      page,
      <>
        <StyleSheet />
        {["", "a", "b", "c", "a b", "b c", "a c", "a b c"].map(
          (className, index) => (
            <Box
              key={index}
              id={`case${index}`}
              className={className}
              color="#000000"
              condition:color="#009900"
            />
          ),
        )}
      </>,
    );
    for (const caseId of [1, 2, 3, 6, 7]) {
      assert.strictEqual(
        hex((await queryComputedStyle(page, `#case${caseId}`)).color),
        "#000000",
        `case ${caseId}`,
      );
    }
    for (const caseId of [0, 4, 5]) {
      assert.strictEqual(
        hex((await queryComputedStyle(page, `#case${caseId}`)).color),
        "#009900",
        `case ${caseId}`,
      );
    }
  });
});

test('inline "and" condition', async () => {
  const { StyleSheet, hooks } = createHooks(["&:enabled", "&:hover"]);
  const Box = createComponent({
    conditions: createConditions(hooks, {
      enabled: "&:enabled",
      hover: "&:hover",
    }),
    styleProps: createStyleProps({ color: true }),
  });
  const { disabledStyle, disabledHoverStyle, enabledStyle, enabledHoverStyle } =
    await withPage(async page => {
      await renderContent(
        page,
        <>
          <StyleSheet />
          <Box
            conditions={{ enabledHover: { and: ["enabled", "hover"] } }}
            is="button"
            id="disabledBox"
            disabled
            color="#0000ff"
            enabledHover:color="#ff0000"
          />
          <Box
            conditions={{ enabledHover: { and: ["enabled", "hover"] } }}
            is="button"
            id="enabledBox"
            color="#0000ff"
            enabledHover:color="#ff0000"
          />
        </>,
      );
      const disabledStyle = await queryComputedStyle(page, "#disabledBox");
      const enabledStyle = await queryComputedStyle(page, "#enabledBox");
      await page.hover("#disabledBox");
      const disabledHoverStyle = await queryComputedStyle(page, "#disabledBox");
      await page.hover("#enabledBox");
      const enabledHoverStyle = await queryComputedStyle(page, "#enabledBox");
      return {
        disabledStyle,
        enabledStyle,
        disabledHoverStyle,
        enabledHoverStyle,
      };
    });
  assert.strictEqual(hex(disabledStyle.color), "#0000ff");
  assert.strictEqual(hex(enabledStyle.color), "#0000ff");
  assert.strictEqual(hex(disabledHoverStyle.color), "#0000ff");
  assert.strictEqual(hex(enabledHoverStyle.color), "#ff0000");
});

test('inline "or" condition', async () => {
  const { StyleSheet, hooks } = createHooks([
    "&[aria-disabled=true]",
    "&:disabled",
  ]);
  const Box = createComponent({
    conditions: createConditions(hooks, {
      ariaDisabled: "&[aria-disabled=true]",
      trueDisabled: "&:disabled",
    }),
    styleProps: createStyleProps({ color: true }),
  });
  const { linkStyle, buttonStyle, disabledLinkStyle, disabledButtonStyle } =
    await withPage(async page => {
      await renderContent(
        page,
        <>
          <StyleSheet />
          <Box
            conditions={{ disabled: { or: ["ariaDisabled", "trueDisabled"] } }}
            is="a"
            id="enabledLink"
            color="#000000"
            disabled:color="#999999"
          />
          <Box
            conditions={{ disabled: { or: ["ariaDisabled", "trueDisabled"] } }}
            is="a"
            id="disabledLink"
            aria-disabled="true"
            color="#000000"
            disabled:color="#999999"
          />
          <Box
            conditions={{ disabled: { or: ["ariaDisabled", "trueDisabled"] } }}
            is="button"
            id="enabledButton"
            color="#000000"
            disabled:color="#999999"
          />
          <Box
            conditions={{ disabled: { or: ["ariaDisabled", "trueDisabled"] } }}
            is="button"
            id="disabledButton"
            disabled
            color="#000000"
            disabled:color="#999999"
          />
        </>,
      );
      const linkStyle = await queryComputedStyle(page, "#enabledLink");
      const disabledLinkStyle = await queryComputedStyle(page, "#disabledLink");
      const buttonStyle = await queryComputedStyle(page, "#enabledButton");
      const disabledButtonStyle = await queryComputedStyle(
        page,
        "#disabledButton",
      );
      return {
        linkStyle,
        disabledLinkStyle,
        buttonStyle,
        disabledButtonStyle,
      };
    });
  assert.strictEqual(hex(linkStyle.color), "#000000");
  assert.strictEqual(hex(disabledLinkStyle.color), "#999999");
  assert.strictEqual(hex(buttonStyle.color), "#000000");
  assert.strictEqual(hex(disabledButtonStyle.color), "#999999");
});

test('inline "not" condition', async () => {
  const { StyleSheet, hooks } = createHooks(["&:hover"]);
  const Box = createComponent({
    conditions: createConditions(hooks, {
      hover: "&:hover",
    }),
    styleProps: createStyleProps({ color: true }),
  });
  const { style, hoverStyle } = await withPage(async page => {
    await renderContent(
      page,
      <>
        <StyleSheet />
        <Box
          conditions={{ unhover: { not: "hover" } }}
          is="button"
          id="box"
          color="#ff0000"
          unhover:color="#0000ff"
        />
      </>,
    );
    const style = await queryComputedStyle(page, "#box");
    await page.hover("#box");
    const hoverStyle = await queryComputedStyle(page, "#box");
    return { style, hoverStyle };
  });
  assert.strictEqual(hex(style.color), "#0000ff");
  assert.strictEqual(hex(hoverStyle.color), "#ff0000");
});

test("default as", async () => {
  const Box = createComponent({
    defaultIs: "section",
  });
  const tagName = await withPage(async page => {
    await renderContent(page, <Box id="box" />);
    return await page.evaluate(() => document.getElementById("box")?.tagName);
  });
  assert.strictEqual(tagName, "SECTION");
});

test("prop ordering - initial vs. conditional style", async () => {
  const { StyleSheet, hooks } = createHooks(["&:hover"]);
  const Box = createComponent({
    conditions: createConditions(hooks, {
      hover: "&:hover",
    }),
    styleProps: createStyleProps({ color: true }),
  });
  const { style, hoverStyle } = await withPage(async page => {
    await renderContent(
      page,
      <>
        <StyleSheet />
        <Box id="box" is="button" hover:color="#ff0000" color="#0000ff" />
      </>,
    );
    const style = await queryComputedStyle(page, "#box");
    await page.hover("#box");
    const hoverStyle = await queryComputedStyle(page, "#box");
    return { style, hoverStyle };
  });
  assert.strictEqual(hex(style.color), "#0000ff");
  assert.strictEqual(hex(hoverStyle.color), "#ff0000");
});
