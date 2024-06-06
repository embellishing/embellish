import type { Branded } from "./brand";
import type { Condition, LogicalExpression } from "./condition.js";
import { conditionToLogicalExpression } from "./condition.js";
import { createHash } from "./util.js";

export type { Condition };

const [space, newline] =
  // @ts-expect-error bundler expected to replace `process.env.NODE_ENV` expression
  process.env.NODE_ENV === "development" ? [" ", "\n"] : ["", ""];

export type Chars<S, Acc = never> = S extends `${infer Head}${infer Tail}`
  ? Chars<Tail, Acc | Head>
  : Acc;

export type UppercaseLetter = Chars<"ABCDEFGHIJKLMNOPQRSTUVWXYZ">;

export type Letter<A extends string = UppercaseLetter> = A | Lowercase<A>;

export type Digit<A = "01234567890"> = Chars<A> | Lowercase<Chars<A>>;

export type OnlyChars<C, S> = S extends `${infer Head}${infer Tail}`
  ? Head extends C
    ? unknown & OnlyChars<C, Tail>
    : never
  : unknown;

export type ValidConditionName<Name> = Name extends "box" | "initial"
  ? never
  : Name extends `${Letter}${infer Tail}`
    ? OnlyChars<Letter | Digit, Tail>
    : never;

export type Selector =
  | `${string}&${string}`
  | `@${"media" | "container" | "supports"} ${string}`;

export type HookId = Branded<string, "HookId">;

export function createHooks<Hooks extends Selector[]>(hooks: Hooks) {
  const hookIds = Object.fromEntries(
    hooks.map(hook => [hook, createHash(hook)]),
  ) as { [Hook in Hooks[number]]: HookId };
  return {
    styleSheet() {
      const indent = Array(2).fill(space).join("");
      return `*${space}{${newline}${Object.entries(hookIds)
        .flatMap(([, id]) => [
          `${indent}--${id}-0:${space}initial;`,
          `${indent}--${id}-1:${space};`,
        ])
        .join(newline)}${newline}}${newline}${Object.entries(hookIds)
        .flatMap(([def, id]) => {
          if (def.startsWith("@")) {
            return [
              `${def} {`,
              `${indent}* {`,
              `${indent}${indent}--${id}-0:${space};`,
              `${indent}${indent}--${id}-1:${space}initial;`,
              `${indent}}`,
              "}",
            ];
          }
          return [
            `${def.replace(/&/g, "*")}${space}{`,
            `${indent}--${id}-0:${space};`,
            `${indent}--${id}-1:${space}initial;`,
            "}",
          ];
        })
        .join(newline)}`;
    },
    hooks: hookIds,
  };
}

export type Conditions<ConditionName extends string> = Branded<
  Record<ConditionName, Condition<HookId>>,
  "Conditions"
>;

export function createConditions<
  Hooks extends ReturnType<typeof createHooks>["hooks"],
  ConditionsConfig extends Record<string, unknown>,
>(
  hooks: Hooks,
  conditions: ConditionsConfig & {
    [ConditionName in keyof ConditionsConfig]: ValidConditionName<ConditionName> &
      Condition<keyof Hooks>;
  },
) {
  return Object.fromEntries(
    (
      Object.entries(conditions) as [
        keyof ConditionsConfig,
        Condition<keyof Hooks>,
      ][]
    ).map(([conditionName, condition]) => [
      conditionName,
      (function expand(condition: Condition<keyof Hooks>): Condition<HookId> {
        if (typeof condition === "string") {
          return hooks[condition] as HookId;
        }
        if (typeof condition === "object") {
          if ("and" in condition) {
            return { and: condition.and.map(expand) };
          }
          if ("or" in condition) {
            return { or: condition.or.map(expand) };
          }
          if ("not" in condition) {
            return { not: expand(condition.not) };
          }
        }
        throw new Error(`Invalid condition: ${JSON.stringify(condition)}`);
      })(condition),
    ]),
  ) as keyof ConditionsConfig extends string
    ? Conditions<keyof ConditionsConfig>
    : never;
}

export function createLocalConditions<
  Conditions extends ReturnType<typeof createConditions>,
  LocalConditions,
>(
  conditions: Conditions,
  localConditions: LocalConditions & {
    [ConditionName in keyof LocalConditions]: ValidConditionName<ConditionName> &
      Condition<keyof Conditions>;
  },
) {
  return {
    get conditionNames() {
      return Object.keys(conditions || {}).concat(
        Object.keys(localConditions || {}),
      ) as (keyof Conditions | keyof LocalConditions)[];
    },
    conditionalDeclarationValue(
      conditionName: keyof Conditions | keyof LocalConditions,
      valueIfTrue: string,
      valueIfFalse: string,
    ) {
      const condition =
        conditionName in localConditions
          ? (function expand(
              condition: Condition<keyof typeof conditions>,
            ): Condition<HookId> {
              if (typeof condition === "string") {
                return conditions[condition] as HookId;
              }
              if (condition && typeof condition === "object") {
                if ("and" in condition) {
                  return { and: condition.and.map(expand) };
                }
                if ("or" in condition) {
                  return { or: condition.or.map(expand) };
                }
                if ("not" in condition) {
                  return { not: expand(condition.not) };
                }
              }
              throw new Error(
                `Invalid condition: ${JSON.stringify(condition)}`,
              );
            })(localConditions[conditionName as keyof LocalConditions])
          : (conditions[
              conditionName as keyof Conditions
            ] as Condition<HookId>);

      return (function buildExpression(
        condition: LogicalExpression<HookId>,
        valueIfTrue: string,
        valueIfFalse: string,
      ): string {
        switch (condition.tag) {
          case "just":
            return `var(--${condition.value}-1, ${valueIfTrue}) var(--${condition.value}-0, ${valueIfFalse})`;
          case "and":
            return buildExpression(
              condition.left,
              buildExpression(condition.right, valueIfTrue, valueIfFalse),
              valueIfFalse,
            );
          case "or":
            return buildExpression(
              condition.left,
              valueIfTrue,
              buildExpression(condition.right, valueIfTrue, valueIfFalse),
            );
          case "not":
            return buildExpression(condition.value, valueIfFalse, valueIfTrue);
        }
      })(
        conditionToLogicalExpression<HookId>(condition),
        valueIfTrue,
        valueIfFalse,
      );
    },
  };
}
