import { skipTransparentExprWrapperNodes } from "@babel/helper-skip-transparent-expression-wrappers";
import type { NodePath } from "@babel/traverse";
import { types as t } from "@babel/core";
// https://crbug.com/v8/11558

// check if there is a spread element followed by another argument.
// (...[], 0) or (...[], ...[])

function matchAffectedArguments(argumentNodes) {
  const spreadIndex = argumentNodes.findIndex(node => t.isSpreadElement(node));
  return spreadIndex >= 0 && spreadIndex !== argumentNodes.length - 1;
}

/**
 * Check whether the optional chain is affected by https://crbug.com/v8/11558.
 * This routine MUST not manipulate NodePath
 *
 * @export
 * @param {(NodePath<t.OptionalMemberExpression | t.OptionalCallExpression>)} path
 * @returns {boolean}
 */
export function shouldTransform(
  path: NodePath<t.OptionalMemberExpression | t.OptionalCallExpression>,
): boolean {
  let node: t.Expression = path.node;
  let affected = false;
  for (;;) {
    if (t.isOptionalCallExpression(node)) {
      affected = matchAffectedArguments(node.arguments);
      // f?.(...[], 0)
      if (affected && node.optional) {
        return true;
      }
      node = skipTransparentExprWrapperNodes(node.callee);
    } else if (t.isOptionalMemberExpression(node)) {
      // o?.m(...[], 0)
      if (affected && node.optional) {
        return true;
      }
      affected = false;
      node = skipTransparentExprWrapperNodes(node.object);
    } else {
      return false;
    }
  }
}
