import { createLocalConditions } from "@embellish/core";
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

export function createComponent({
  displayName,
  styleProps,
  defaultAs = "div",
  defaultStyle = {},
  conditions: configConditions,
  fallback: configFallback = "revert-layer",
}) {
  const resolveProperty = propertyName =>
    styleProps[propertyName] || (x => ({ [propertyName]: x }));

  const Component = forwardRef(
    (
      {
        as: Component = defaultAs,
        conditions: localConditions = {},
        style: styleProp = {},
        ...props
      },
      ref,
    ) => {
      const style = { ...defaultStyle },
        forwardProps = {};

      for (const key in styleProp) {
        delete style[key];
        style[key] = styleProp[key];
      }

      const conditions = createLocalConditions(
        configConditions,
        localConditions,
      );

      const stylePropPattern = new RegExp(
        `^(${conditions.conditionNames.join("|")}):(.+)`,
      );

      for (const key of Object.keys(props).sort((a, b) => {
        if (a in styleProps && b in styleProps) {
          return 0;
        }
        if (a in styleProps) {
          return -1;
        }
        if (b in styleProps) {
          return 1;
        }
        return 0;
      })) {
        if (key in styleProps) {
          Object.assign(style, resolveProperty(key)(props[key]));
          continue;
        }

        const [, stylePrefix, styleProperty] =
          key.match(stylePropPattern) || [];

        if (!stylePrefix) {
          forwardProps[key] = props[key];
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
            fallback = configFallback;
          }
          const condValue = stringifyValue(resolvedProperty, value);
          if (condValue === null) {
            continue;
          }
          delete style[resolvedProperty];
          style[resolvedProperty] = conditions.conditionalDeclarationValue(
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
