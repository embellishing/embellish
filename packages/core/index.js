const debug = process.env.NODE_ENV === "development";
const space = debug ? " " : "";

function createHash(obj) {
  const jsonString = JSON.stringify(obj);

  let hashValue = 0;

  for (let i = 0; i < jsonString.length; i++) {
    const charCode = jsonString.charCodeAt(i);
    hashValue = (hashValue << 5) - hashValue + charCode;
    hashValue &= 0x7fffffff;
  }

  return hashValue.toString(36);
}

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
  const [head, ...tail] = cond[operator].map(normalizeCondition).filter(x => x);
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

export function createConditions(init, parent) {
  const hash = parent?.hash || createHash(init);
  const depth = parent ? parent.depth + 1 : 0;

  const self = { _tag: parent ? "local" : "global", hash, depth };

  const conditionNames = [
    ...Object.keys(init),
    ...(parent?.conditionNames || []),
  ];

  function conditionId(conditionName) {
    if (conditionName in init) {
      return `${conditionName}-${hash}-${depth}`;
    }
    return parent.conditionId(conditionName);
  }

  function conditionalExpression(conditionName, valueIfTrue, valueIfFalse) {
    return `var(--${conditionId(
      conditionName,
    )}-1,${space}${valueIfTrue})${space}var(--${conditionId(
      conditionName,
    )}-0,${space}${valueIfFalse})`;
  }

  function add(init) {
    return createConditions(init, self);
  }

  function pick() {
    return self;
  }

  function styleSheet() {
    const indent = Array(2).fill(space).join("");
    const newline = debug ? "\n" : "";
    function variablePair({ id, initial, indents }) {
      return [0, 1]
        .map(
          i =>
            `${Array(indents).fill(indent).join("")}--${id}-${i}:${space}${
              initial === i ? "initial" : space ? "" : " "
            };${newline}`,
        )
        .join("");
    }

    let sheet = `*${space}{${newline}`;

    const conditions = Object.entries(init)
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
      })(conditionId(name), def);
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
      })(conditionId(name), def);
    }

    return sheet;
  }

  function declarations() {
    const style = parent._tag === "local" ? parent.declarations() : {};
    for (const key in init) {
      (function it(id, def) {
        if (typeof def === "string") {
          style[`--${id}-0`] = `var(--${parent.conditionId(def)}-0)`;
          style[`--${id}-1`] = `var(--${parent.conditionId(def)}-1)`;
          return id;
        }
        if (typeof def === "object") {
          const [operator] = Object.keys(def);
          let leftId, rightId;
          switch (operator) {
            case "not":
              style[`--${id}-0`] = `var(--${it(`${id}X`, def.not)}-1)`;
              style[`--${id}-1`] = `var(--${it(`${id}X`, def.not)}-0)`;
              return id;
            case "and":
              leftId = `${id}A`;
              rightId = `${id}B`;
              style[`--${id}-0`] = `var(--${it(
                leftId,
                def.and[0],
              )}-0)${space}var(--${it(rightId, def.and[1])}-0)`;
              style[`--${id}-1`] = `var(--${it(
                leftId,
                def.and[0],
              )}-1,${space}var(--${it(rightId, def.and[1])}-1))`;
              return id;
            case "or":
              leftId = `${id}A`;
              rightId = `${id}B`;
              style[`--${id}-0`] = `var(--${it(
                leftId,
                def.or[0],
              )}-0,${space}var(--${it(rightId, def.or[1])}-0))`;
              style[`--${id}-1`] = `var(--${it(
                leftId,
                def.or[0],
              )}-1)${space}var(--${it(rightId, def.or[1])}-1)`;
              return id;
          }
        }
      })(conditionId(key), normalizeCondition(init[key]));
    }
    return style;
  }

  return Object.assign(self, {
    conditionNames,
    conditionId,
    conditionalExpression,
    add,
    pick,
    styleSheet,
    declarations,
  });
}
