declare const __brand: unique symbol;

/**
 * Creates a branded type to add a unique symbol for type differentiation.
 *
 * @public
 */
export type Branded<T, B> = T & { [__brand]: B };

const [space, newline] =
  // @ts-expect-error bundler expected to replace `process.env.NODE_ENV` expression
  process.env.NODE_ENV === "development" ? [" ", "\n"] : ["", ""];

/**
 * Converts a string into a union type of its unique characters.
 *
 * @typeParam S - The string to extract characters from.
 * @typeParam Acc - An accumulator to build the union of characters.
 *
 * @public
 */
export type Chars<S, Acc = never> = S extends `${infer Head}${infer Tail}`
  ? Chars<Tail, Acc | Head>
  : Acc;

/**
 * Represents an uppercase letter (A-Z).
 *
 * @public
 */
export type UppercaseLetter = Chars<"ABCDEFGHIJKLMNOPQRSTUVWXYZ">;

/**
 * Represents a letter (uppercase or lowercase).
 *
 * @public
 */
export type Letter = UppercaseLetter | Lowercase<UppercaseLetter>;

/**
 * Represents a digit (0-9).
 *
 * @public
 */
export type Digit = Chars<"0123456789">;

/**
 * Ensures that the string contains only the allowable characters.
 *
 * @typeParam Characters - Allowable characters
 * @typeParam String - The string to check
 *
 * @public
 */
export type OnlyChars<Characters, String> =
  // eslint-disable-next-line @typescript-eslint/ban-types
  String extends `${infer Head}${infer Tail}`
    ? Head extends Characters
      ? OnlyChars<Characters, Tail> & unknown
      : never
    : unknown;

/**
 * Ensures that a condition name is alphanumeric.
 *
 * @typeParam Name - The name to check
 *
 * @public
 */
export type ValidConditionName<Name> = Name extends `${Letter}${infer Tail}`
  ? OnlyChars<Letter | Digit, Tail>
  : never;

/**
 * Represents a condition consisting of a single `S` value or a logical
 * combination of multiple `S` values.
 *
 * @typeParam S - A simple condition; either a hook id or a condition name
 *
 * @public
 */
export type Condition<S> =
  | S
  | { and: Condition<S>[]; or?: undefined; not?: undefined }
  | { or: Condition<S>[]; and?: undefined; not?: undefined }
  | { not: Condition<S>; and?: undefined; or?: undefined };

/**
 * Represents hook selector logic consisting of either a basic CSS selector or
 * an at-rule (`@media`, `@container`, or `@supports`).
 *
 * @public
 */
export type Selector =
  | `${string}&${string}`
  | `@${"media" | "container" | "supports"} ${string}`;

/**
 * Represents a unique hook identifier.
 *
 * @public
 */
export type HookId = Branded<string, "HookId">;

/**
 * A map of hooks, keyed by the selector logic used to create the hook
 *
 * @typeParam S - The selector logic used for each hook
 *
 * @public
 */
export type Hooks<S extends Selector> = Branded<
  { [HookName in S]: HookId },
  "Hooks"
>;

export function createHooks<S extends Selector>(selectors: S[]) {
  const hooks = Object.fromEntries(
    selectors.map(selector => [selector, createHash(selector)]),
  ) as Hooks<S>;
  return {
    styleSheet() {
      const indent = Array(2).fill(space).join("");
      return `*${space}{${newline}${Object.entries(hooks)
        .flatMap(([, id]) => [
          `${indent}--${id}-0:${space}initial;`,
          `${indent}--${id}-1:${space};`,
        ])
        .join(newline)}${newline}}${newline}${Object.entries(hooks)
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
    hooks,
  };
}

/**
 * A record of condition names, each mapping to a hook id or a logical
 * combination using `and`, `or`, and `not` operators.
 *
 * @typeParam ConditionName - The type of the condition names
 *
 * @public
 */
export type Conditions<ConditionName extends string> = Branded<
  Record<ConditionName, Condition<HookId>>,
  "Conditions"
>;

/**
 * Creates reusable conditions based on the provided hooks, each consisting of
 * either a hook id or a logical combination using the `and`, `or`, and `not`
 * operators.
 *
 * @typeParam S - The selector logic of the hooks available for use in
 * conditions
 * @typeParam ConditionName - The type of the names of conditions to create
 * @param hooks - The hooks available for use in conditions
 * @param conditions - The conditions to create
 *
 * @returns The conditions available for use by a component
 *
 * @public
 */
export function createConditions<
  S extends Selector,
  ConditionName extends string,
>(
  hooks: Hooks<S>,
  conditions: Record<string, Condition<S>> & {
    [Name in ConditionName]: ValidConditionName<Name> & Condition<S>;
  },
) {
  return Object.fromEntries(
    (Object.entries(conditions) as [ConditionName, Condition<S>][]).map(
      ([conditionName, condition]) => [
        conditionName,
        (function expand(condition: Condition<S>): Condition<HookId> {
          if (typeof condition === "string") {
            return hooks[condition] as HookId;
          }
          if (typeof condition === "object") {
            if (condition.and) {
              return { and: condition.and.map(expand) };
            }
            if (condition.or) {
              return { or: condition.or.map(expand) };
            }
            if (condition.not) {
              return { not: expand(condition.not) };
            }
          }
          throw new Error(`Invalid condition: ${JSON.stringify(condition)}`);
        })(condition),
      ],
    ),
  ) as Conditions<ConditionName>;
}

export function createInlineConditions<
  ReusableConditions extends Conditions<string>,
  ConditionName extends string,
  C extends keyof ReusableConditions = ReusableConditions extends Conditions<
    infer C
  >
    ? C
    : never,
>(
  conditions: ReusableConditions,
  inlineConditions: {
    [Name in ConditionName]: ValidConditionName<Name> & Condition<C>;
  },
) {
  return {
    get conditionNames() {
      return Object.keys(conditions || {}).concat(
        Object.keys(inlineConditions || {}),
      ) as (C | ConditionName)[];
    },
    conditionalDeclarationValue(
      conditionName: C | ConditionName,
      valueIfTrue: string,
      valueIfFalse: string,
    ) {
      const condition =
        conditionName in inlineConditions
          ? (function expand(condition: Condition<C>): Condition<HookId> {
              if (typeof condition === "string") {
                return conditions[condition] as HookId;
              }
              if (condition && typeof condition === "object") {
                if (condition.and) {
                  return { and: condition.and.map(expand) };
                }
                if (condition.or) {
                  return { or: condition.or.map(expand) };
                }
                if (condition.not) {
                  return { not: expand(condition.not) };
                }
              }
              throw new Error(
                `Invalid condition: ${JSON.stringify(condition)}`,
              );
            })(inlineConditions[conditionName as ConditionName])
          : (conditions[conditionName as C] as Condition<HookId>);

      return (function buildExpression(
        condition: Condition<HookId>,
        valueIfTrue: string,
        valueIfFalse: string,
      ): string {
        if (typeof condition === "string") {
          return `var(--${condition}-1, ${valueIfTrue}) var(--${condition}-0, ${valueIfFalse})`;
        }
        if (condition.and) {
          const [head, ...tail] = condition.and;
          if (!head) {
            return valueIfTrue;
          }
          if (tail.length === 0) {
            return buildExpression(head, valueIfTrue, valueIfFalse);
          }
          return buildExpression(
            head,
            buildExpression({ and: tail }, valueIfTrue, valueIfFalse),
            valueIfFalse,
          );
        }
        if (condition.or) {
          return buildExpression(
            { and: condition.or.map(not => ({ not })) },
            valueIfFalse,
            valueIfTrue,
          );
        }
        if (condition.not) {
          return buildExpression(condition.not, valueIfFalse, valueIfTrue);
        }
        throw new Error(`Invalid condition: ${JSON.stringify(condition)}`);
      })(condition, valueIfTrue, valueIfFalse);
    },
  };
}

function createHash(obj: unknown) {
  const jsonString = JSON.stringify(obj);

  let hashValue = 0;

  for (let i = 0; i < jsonString.length; i++) {
    const charCode = jsonString.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + charCode;
    hashValue &= 0x7fffffff;
  }

  const str = hashValue.toString(36);

  return /^[0-9]/.test(str) ? `a${str}` : str;
}
