import isValidIdentifier from "../validators/isValidIdentifier";
import {
  identifier,
  booleanLiteral,
  nullLiteral,
  stringLiteral,
  numericLiteral,
  regExpLiteral,
  arrayExpression,
  objectProperty,
  objectExpression,
  unaryExpression,
  binaryExpression,
} from "../builders/generated";
import type * as t from "..";

export default valueToNode as {
  (value: undefined): t.Identifier; // TODO: This should return "void 0"
  (value: boolean): t.BooleanLiteral;
  (value: null): t.NullLiteral;
  (value: string): t.StringLiteral;
  // Infinities and NaN need to use a BinaryExpression; negative values must be wrapped in UnaryExpression
  (value: number): t.NumericLiteral | t.BinaryExpression | t.UnaryExpression;
  (value: RegExp): t.RegExpLiteral;
  (value: ReadonlyArray<unknown>): t.ArrayExpression;

  // this throws with objects that are not plain objects,
  // or if there are non-valueToNode-able values
  (value: object): t.ObjectExpression;

  (value: unknown): t.Expression;
};

const objectToString: (value: object) => string = Function.call.bind(
  Object.prototype.toString,
);

function isRegExp(value): value is RegExp {
  return objectToString(value) === "[object RegExp]";
}

function isPlainObject(value): value is object {
  if (
    typeof value !== "object" ||
    value === null ||
    Object.prototype.toString.call(value) !== "[object Object]"
  ) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  // Object.prototype's __proto__ is null. Every other class's __proto__.__proto__ is
  // not null by default. We cannot check if proto === Object.prototype because it
  // could come from another realm.
  return proto === null || Object.getPrototypeOf(proto) === null;
}

function valueToNode(value: unknown): t.Expression {
  // undefined
  if (value === undefined) {
    return identifier("undefined");
  }

  // boolean
  if (value === true || value === false) {
    return booleanLiteral(value);
  }

  // null
  if (value === null) {
    return nullLiteral();
  }

  // strings
  if (typeof value === "string") {
    return stringLiteral(value);
  }

  // numbers
  if (typeof value === "number") {
    let result;
    if (Number.isFinite(value)) {
      result = numericLiteral(Math.abs(value));
    } else {
      let numerator;
      if (Number.isNaN(value)) {
        // NaN
        numerator = numericLiteral(0);
      } else {
        // Infinity / -Infinity
        numerator = numericLiteral(1);
      }

      result = binaryExpression("/", numerator, numericLiteral(0));
    }

    if (value < 0 || Object.is(value, -0)) {
      result = unaryExpression("-", result);
    }

    return result;
  }

  // regexes
  if (isRegExp(value)) {
    const pattern = value.source;
    const flags = value.toString().match(/\/([a-z]+|)$/)[1];
    return regExpLiteral(pattern, flags);
  }

  // array
  if (Array.isArray(value)) {
    return arrayExpression(value.map(valueToNode));
  }

  // object
  if (isPlainObject(value)) {
    const props = [];
    for (const key of Object.keys(value)) {
      let nodeKey;
      if (isValidIdentifier(key)) {
        nodeKey = identifier(key);
      } else {
        nodeKey = stringLiteral(key);
      }
      props.push(objectProperty(nodeKey, valueToNode(value[key])));
    }
    return objectExpression(props);
  }

  throw new Error("don't know how to turn this value into a node");
}
