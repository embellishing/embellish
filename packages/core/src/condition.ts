/**
 * A condition consisting of a single `S` value or a logical combination of
 * multiple `S` values
 *
 * @typeParam S - a simple condition; either a hook id or a condition name
 *
 * @public
 */
export type Condition<S> =
  | S
  | { and: Condition<S>[]; or?: undefined; not?: undefined }
  | { or: Condition<S>[]; and?: undefined; not?: undefined }
  | { not: Condition<S>; and?: undefined; or?: undefined };

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

  if (condition.and) {
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

  if (condition.or) {
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

  if (condition.not) {
    return {
      tag: "not",
      value: conditionToLogicalExpression(condition.not),
    };
  }

  throw new Error(`Invalid condition: ${JSON.stringify(condition)}`);
}
