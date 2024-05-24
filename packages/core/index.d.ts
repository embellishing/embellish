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

export type Condition<S> =
  | S
  | { and: Condition<S>[] }
  | { or: Condition<S>[] }
  | { not: Condition<S> };

export type Selector =
  | `${string}&${string}`
  | `@${"media" | "container" | "supports"} ${string}`;

export type Conditions<S, Hook, ConditionName extends string | never> = {
  createConditions<Conds>(
    conditions: Record<string, Condition<S>> & {
      [C in keyof Conds]: ValidConditionName<C> & Conds[C];
    },
  ): keyof Conds extends string
    ? Conditions<
        keyof Conds,
        { declarations(): Record<string, string> },
        ConditionName | keyof Conds
      > &
        Hook
    : never;
  conditionNames: ConditionName[];
  conditionalExpression(
    conditionName: ConditionName,
    valueIfTrue: string,
    valueIfFalse: string,
  ): string;
};

export const createConditions: Conditions<
  Selector,
  {
    styleSheet(): string;
  },
  never
>["createConditions"];
