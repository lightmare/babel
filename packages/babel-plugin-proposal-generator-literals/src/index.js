import { declare } from "@babel/helper-plugin-utils";
import syntaxGeneratorLiterals from "@babel/plugin-syntax-generator-literals";
import { types as t } from "@babel/core";
import template from "@babel/template";

const generatorEmpty = template.expression(`
{
  [Symbol.iterator]: function* () {}
}
`);

const generatorNoSpread = template.expression(`
(kList =>
  ({
    [kList]: %%LIST%%,
    [Symbol.iterator]: function* () {
      let result;
      for (const getter of this[kList]) {
        result = yield getter();
      }
      return result;
    }
  })
)(Symbol.for('##generatorExpressionList'))
`);

const generatorWithTail = template.expression(`
((kHead, kTail) =>
  ({
    [kHead]: %%HEAD_ARRAY%%,
    [kTail]: %%TAIL_FUNC%%,
    [Symbol.iterator]: function* () {
      let iter = this;
      do {
        for (const getter of iter[kHead]) {
          yield* getter();
        }
        iter = iter[kTail]();
      } while (kHead in iter);
      return yield* iter;
    }
  })
)(Symbol.for('##generatorExpressionHead'), Symbol.for('##generatorExpressionTail'))
`);

function makeYieldGetter(expr) {
  return t.arrowFunctionExpression([], expr);
}

function makeYieldIterable(expr) {
  return t.isSpreadElement(expr) ? expr.argument : t.arrayExpression([expr]);
}

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "proposal-generator-literals",
    inherits: syntaxGeneratorLiterals,
    visitor: {
      GeneratorExpression(path) {
        const { elements } = path.node;
        if (elements.length === 0) {
          path.replaceWith(generatorEmpty());
        } else if (elements.some(expr => t.isSpreadElement(expr))) {
          const getters = elements.map(makeYieldIterable).map(makeYieldGetter);
          const tail = getters.pop();
          path.replaceWith(
            generatorWithTail({
              HEAD_ARRAY: t.arrayExpression(getters),
              TAIL_FUNC: tail,
            }),
          );
        } else {
          const getters = elements.map(makeYieldGetter);
          path.replaceWith(
            generatorNoSpread({ LIST: t.arrayExpression(getters) }),
          );
        }
      },
    },
  };
});
