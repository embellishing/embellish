export type Condition<S> =
  | S
  | { and: Condition<S>[] }
  | { or: Condition<S>[] }
  | { not: Condition<S> };

export type LogicalExpression<S> =
  | { tag: "just"; value: S }
  | {
      tag: "and" | "or";
      left: LogicalExpression<S>;
      right: LogicalExpression<S>;
    }
  | { tag: "not"; value: LogicalExpression<S> };

export function conditionToLogicalExpression<S>(
  condition: Condition<S>,
): LogicalExpression<S> {
  if (
    typeof condition !== "object" ||
    condition === null ||
    (!("and" in condition) && !("or" in condition) && !("not" in condition))
  ) {
    return { tag: "just", value: condition as S };
  }

  if ("and" in condition) {
    const [first, ...rest] = condition.and;
    if (first) {
      return rest.reduce<LogicalExpression<S>>(
        (acc, curr) => ({
          tag: "and",
          left: acc,
          right: conditionToLogicalExpression(curr),
        }),
        conditionToLogicalExpression(first),
      );
    }
  }

  if ("or" in condition) {
    const [first, ...rest] = condition.or;
    if (first) {
      return rest.reduce<LogicalExpression<S>>(
        (acc, curr) => ({
          tag: "or",
          left: acc,
          right: conditionToLogicalExpression(curr),
        }),
        conditionToLogicalExpression(first),
      );
    }
  }

  if ("not" in condition) {
    return {
      tag: "not",
      value: conditionToLogicalExpression(condition.not),
    };
  }

  throw new Error(`Invalid condition: ${JSON.stringify(condition)}`);
}
