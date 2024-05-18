import { createElement, forwardRef } from "react";

function normalizeCondition(cond) {
  if (!cond) {
    return undefined;
  }
  if (typeof cond === "string") {
    return cond;
  }
  if (typeof cond !== "object") {
    return undefined;
  }
  if ("not" in cond) {
    if (!cond.not) {
      return undefined;
    }
    if (cond.not.not) {
      return normalizeCondition(cond.not.not);
    }
    const inner = normalizeCondition(cond.not);
    return inner ? { not: inner } : undefined;
  }
  const [operator] = Object.keys(cond);
  const [head, ...tail] = cond[operator]
    .map(normalizeCondition)
    .filter((x) => x);
  if (!head) {
    return undefined;
  }
  if (tail.length === 0) {
    return head;
  }
  if (tail.length === 1) {
    return { [operator]: [head, tail[0]] };
  }
  return { [operator]: [head, normalizeCondition({ [operator]: tail })] };
}

function hash(obj) {
  const jsonString = JSON.stringify(obj);

  let hashValue = 0;

  for (let i = 0; i < jsonString.length; i++) {
    const charCode = jsonString.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + charCode;
    hashValue &= 0x7fffffff;
  }

  return hashValue.toString(36);
}

const unitlessNumbers = new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "boxFlex",
  "boxFlexGroup",
  "boxOrdinalGroup",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridArea",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "scale",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity", // SVG-related properties
  "floodOpacity",
  "stopOpacity",
  "strokeDasharray",
  "strokeDashoffset",
  "strokeMiterlimit",
  "strokeOpacity",
  "strokeWidth",
  "MozAnimationIterationCount",
  "MozBoxFlex",
  "MozBoxFlexGroup",
  "MozLineClamp",
  "msAnimationIterationCount",
  "msFlex",
  "msZoom",
  "msFlexGrow",
  "msFlexNegative",
  "msFlexOrder",
  "msFlexPositive",
  "msFlexShrink",
  "msGridColumn",
  "msGridColumnSpan",
  "msGridRow",
  "msGridRowSpan",
  "WebkitAnimationIterationCount",
  "WebkitBoxFlex",
  "WebKitBoxFlexGroup",
  "WebkitBoxOrdinalGroup",
  "WebkitColumnCount",
  "WebkitColumns",
  "WebkitFlex",
  "WebkitFlexGrow",
  "WebkitFlexPositive",
  "WebkitFlexShrink",
  "WebkitLineClamp",
]);

function isUnitlessNumber(name) {
  return /^--/.test(name) || unitlessNumbers.has(name);
}

function stringifyValue(propertyName, value) {
  switch (typeof value) {
    case "string":
      return value;
    case "number":
      return `${value}${isUnitlessNumber(propertyName) ? "" : "px"}`;
    default:
      return null;
  }
}

export function embellish(config) {
  const conditionNameToId = (name) => `${name}-${hash(config)}`;

  const [space, newline] = [" ", "\n"].map((c) => (config.debug ? c : ""));

  function StyleSheet() {
    const indent = Array(2).fill(space).join("");
    function variablePair({ id, initial, indents }) {
      return [0, 1]
        .map(
          (i) =>
            `${Array(indents).fill(indent).join("")}--${id}-${i}:${space}${
              initial === i ? "initial" : space ? "" : " "
            };${newline}`
        )
        .join("");
    }

    let sheet = `*${space}{${newline}`;

    const conditions = Object.entries(config.conditions || {})
      .map(([name, def]) => [name, normalizeCondition(def)])
      .filter(([, def]) => def);

    for (const [name, def] of conditions) {
      (function it(id, def) {
        if (def && typeof def === "object") {
          if (def.not) {
            it(`${id}X`, def.not);
            sheet += `${indent}--${id}-0:${space}var(--${id}X-1);${newline}`;
            sheet += `${indent}--${id}-1:${space}var(--${id}X-0);${newline}`;
            return;
          }

          if ("and" in def || "or" in def) {
            const operator = def.and ? "and" : "or";
            it(`${id}A`, def[operator][0]);
            it(`${id}B`, def[operator][1]);
            if (operator === "and") {
              sheet += `${indent}--${id}-0:${space}var(--${id}A-0)${space}var(--${id}B-0);${newline}`;
              sheet += `${indent}--${id}-1:${space}var(--${id}A-1,${space}var(--${id}B-1));${newline}`;
            } else {
              sheet += `${indent}--${id}-0:${space}var(--${id}A-0,${space}var(--${id}B-0));${newline}`;
              sheet += `${indent}--${id}-1:${space}var(--${id}A-1)${space}var(--${id}B-1);${newline}`;
            }
            return;
          }
        }
        sheet += variablePair({ id, initial: 0, indents: 1 });
      })(conditionNameToId(name), def);
    }

    sheet += `}${newline}`;

    for (const [name, def] of conditions) {
      (function it(id, def) {
        if (def && typeof def === "object") {
          if (def.not) {
            return it(`${id}X`, def.not);
          }

          if ("and" in def || "or" in def) {
            const operator = def.and ? "and" : "or";
            it(`${id}A`, def[operator][0]);
            it(`${id}B`, def[operator][1]);
            return;
          }
        }

        if (typeof def === "string") {
          if (def[0] === "@") {
            sheet += [
              `${def}${space}{${newline}`,
              `${indent}*${space}{${newline}`,
              variablePair({
                id,
                initial: 1,
                indents: 2,
              }),
              `${indent}}${newline}`,
              `}${newline}`,
            ].join("");
          } else {
            sheet += [
              `${def.replace(/&/g, "*")}${space}{${newline}`,
              variablePair({
                id,
                initial: 1,
                indents: 1,
              }),
              `}${newline}`,
            ].join("");
          }
        }
      })(conditionNameToId(name), def);
    }

    return createElement("style", {
      dangerouslySetInnerHTML: { __html: sheet },
    });
  }

  const Box = forwardRef(function Box(
    {
      "box:is": Component = "div",
      "box:conditions": conditions = {},
      ...props
    },
    ref
  ) {
    const style = {},
      forwardProps = {};

    for (const key in conditions) {
      (function it(id, def) {
        if (typeof def === "string") {
          return conditionNameToId(def);
        }
        if (typeof def === "object") {
          const [operator] = Object.keys(def);
          let leftId, rightId;
          switch (operator) {
            case "not":
              style[`--${id}-0`] = `var(--${it(id, def.not)}-1)`;
              style[`--${id}-1`] = `var(--${it(id, def.not)}-0)`;
              return id;
            case "and":
              leftId = `${id}A`;
              rightId = `${id}B`;
              style[`--${id}-0`] = `var(--${it(
                leftId,
                def.and[0]
              )}-0) var(--${it(rightId, def.and[1])}-0)`;
              style[`--${id}-1`] = `var(--${it(
                leftId,
                def.and[0]
              )}-1, var(--${it(rightId, def.and[1])}-1))`;
              return id;
            case "or":
              leftId = `${id}A`;
              rightId = `${id}B`;
              style[`--${id}-0`] = `var(--${it(
                leftId,
                def.or[0]
              )}-0, var(--${it(rightId, def.or[1])}-0))`;
              style[`--${id}-1`] = `var(--${it(
                leftId,
                def.or[0]
              )}-1) var(--${it(rightId, def.or[1])}-1)`;
              return id;
          }
        }
      })(conditionNameToId(key), normalizeCondition(conditions[key]));
    }

    const conditionNames = Object.keys(config.conditions || {}).concat(
      Object.keys(conditions)
    );

    const declarationPattern = new RegExp(
      `^(${conditionNames.concat("initial").join("|")}):(.+)`
    );

    for (const key of Object.keys(props).sort((a, b) => {
      const prefix = "initial:";
      if (a.startsWith(prefix) && b.startsWith(prefix)) {
        return 0;
      }
      if (a.startsWith(prefix)) {
        return -1;
      }
      if (b.startsWith(prefix)) {
        return 1;
      }
      return 0;
    })) {
      const [, stylePrefix, styleProperty] =
        key.match(declarationPattern) || [];
      if (!stylePrefix) {
        forwardProps[key] = props[key];
        continue;
      }
      if (stylePrefix === "initial") {
        // style[styleProperty] = props[key];
        Object.assign(style, config.properties[styleProperty](props[key]));
        continue;
      }
      const id = conditionNameToId(stylePrefix);
      for (const [resolvedProperty, value] of Object.entries(
        config.properties[styleProperty](props[key])
      )) {
        let fallback = stringifyValue(
          resolvedProperty,
          style[resolvedProperty]
        );
        if (fallback === null) {
          fallback = config.fallback === "unset" ? "unset" : "revert-layer";
        }
        const condValue = stringifyValue(resolvedProperty, value);
        if (condValue === null) {
          continue;
        }
        delete style[resolvedProperty];
        style[
          resolvedProperty
        ] = `var(--${id}-1, ${condValue}) var(--${id}-0, ${fallback})`;
      }
    }

    return createElement(Component, { ...forwardProps, ref, style });
  });

  return { StyleSheet, Box };
}
