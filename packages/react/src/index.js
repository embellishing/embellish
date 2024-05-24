export * from "@embellish/core";
import { createElement, forwardRef } from "react";

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

export function createBox({
  displayName = "Box",
  defaultIs = "div",
  conditions: configConditions,
  properties,
  fallback: configFallback = "revert-layer",
}) {
  const namespace = displayName.replace(/^./, x => x.toLowerCase());
  const resolveProperty = propertyName =>
    properties[propertyName] || (x => ({ [propertyName]: x }));

  const Component = forwardRef(
    (
      {
        [`${namespace}:is`]: Component = defaultIs,
        [`${namespace}:conditions`]: localConditions = {},
        ...props
      },
      ref,
    ) => {
      const conditions = configConditions.createConditions(localConditions);
      const style = conditions.declarations(),
        forwardProps = {};

      const declarationPattern = new RegExp(
        `^(${conditions.conditionNames.concat("initial").join("|")}):(.+)`,
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
          Object.assign(style, resolveProperty(styleProperty)(props[key]));
          continue;
        }
        for (const [resolvedProperty, value] of Object.entries(
          resolveProperty(styleProperty)(props[key]),
        )) {
          let fallback = stringifyValue(
            resolvedProperty,
            style[resolvedProperty],
          );
          if (fallback === null) {
            fallback = configFallback === "unset" ? "unset" : "revert-layer";
          }
          const condValue = stringifyValue(resolvedProperty, value);
          if (condValue === null) {
            continue;
          }
          delete style[resolvedProperty];
          style[resolvedProperty] = conditions.conditionalExpression(
            stylePrefix,
            condValue,
            fallback,
          );
        }
      }

      return createElement(Component, { ...forwardProps, ref, style });
    },
  );

  Component.displayName = displayName;

  return Component;
}

export const standardLonghandProperties = {};

export const standardShorthandProperties = {};

export const vendorLonghandProperties = {};

export const vendorShorthandProperties = {};
