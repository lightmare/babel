import { declare } from "@babel/helper-plugin-utils";
import syntaxGeneratorLiterals from "@babel/plugin-syntax-generator-literals";
import { types as t } from "@babel/core";
import template from "@babel/template";

const literal = template.expression("{[Symbol.iterator]: function*()%%body%%}");

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "proposal-generator-literals",
    inherits: syntaxGeneratorLiterals,
    visitor: {
      GeneratorExpression(path) {
        path.replaceWith(
          literal({
            body: t.blockStatement(
              path.node.elements.map(node => {
                const isSpread = t.isSpreadElement(node);
                return t.expressionStatement(
                  t.yieldExpression(isSpread ? node.argument : node, isSpread),
                );
              }),
            ),
          }),
        );
      },
    },
  };
});
