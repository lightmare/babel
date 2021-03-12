Generator Literals - TC39 Strawman Proposal
===========================================

## Briefest summary

Add a new literal type that:
- Has an [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol) value;
- Has syntax similar to the existing [array literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Array#array_literal_notation),
including [spread](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax#spread_in_array_literals);
- Evaluates its element sub-expressions lazily, as its value is iterated over.

## The proposal

### Rationale
1. A solution to the [orphaned promise problem](#the-orphaned-promise-problem).
2. Approaching parity between arrays and iterables.
3. A limited form of lazy evaluation.
4. [A curiously expressive pattern](#infinite-recurrent-sequences) for defining infinite recurrent sequences.

### Syntax

*GeneratorLiteral* ::= `*[`( *AssignmentExpression* | *SpreadElement* )`,`...`]`

Adopts the array literal syntax, replacing the leading bracket with a `*[` token which cannot
appear in any well formed Javascript program at present. The element elision does not make any
sense semantically in this context and should be disallowed, although the reference implementation
presented does not perform this check.

### Semantics

The value is an iterable producing a generator that evaluates and yields elements inside
the brackets on demand. The spread element expects an iterable argument which it delegates
to in its turn.

An expression `*[ expr1, expr2, ...iterable ]` has an exact semantic equivalent in standard
ES6:

```javascript
({
  [Symbol.iterator]: function*() {
    yield expr1;
    yield expr2;
    yield* iterable;
  }
})
```

The reference implementation presented here performs this exact replacement in Babel AST.

## How to use this repository

0. Prerequisites: Node.js 14+, yarn.
1. Clone locally, `git checkout generator-literals`.
2. In the root folder, run `make bootstrap`
followed by `make build`.
3. To run [the tests](./test/fixtures), use `TEST_ONLY=babel-plugin-proposal-generator-literals make test`.
4. To run your own code, use `./node_modules/.bin/babel-node -w @babel/plugin-proposal-generator-literals`.
Note [this](https://babeljs.io/docs/en/babel-node#es6-style-module-loading-may-not-function-as-expected)
and other limitations of REPL mode in `babel-node`; `.js` files supplied via command line are not so limited.

## The orphaned promise problem

Consider the following example:

```javascript
async function callTwoApis(params) {
  await Promise.all([
    firstApi(params),
    secondApi(convertParams(params))
  ]);
}
```

Assume that `firstApi()` and `secondApi()` are well behaved async functions returning
promises that may or may not reject subsequently while `convertParams()` is a synchronous
function. Should `convertParams()` throw for any reason, such as ill-formed parameters,
the call to `Promise.all()` will never be made and the promise returned by the call to
`firstApi(params)` will be orphaned without a catch handler: should it subsequently reject,
an unhandled promise rejection condition will result.

It is easy to see that this problem applies equally to all expressions with multiple promise-valued
subexpressions. Should we consider the unhandled promise rejection a fatal condition -- as
is the case in Node.js 15+ -- this becomes a highly pernicious problem with no simple remedy
in the current language, [discussed at length here](https://es.discourse.group/t/synchronous-exceptions-thrown-from-complex-expressions-create-abandoned-promises-solutions/663).

The [key idea for the solution](https://es.discourse.group/t/synchronous-exceptions-thrown-from-complex-expressions-create-abandoned-promises-solutions/663/41)
is that `Promise.all()` accepts an iterable rather than an array of promises (or a plain
argument list). This allows it, and other facilities expecting to operate on multiple
promises, to preserve the promise values as they are evaluated by storing them in a container,
attaching handlers to them etc. A synchronous exception during evaluation of a value thus
obtained does not affect the ones evaluated and consumed previously.

The role of generator literals in this solution is to afford a simple laconic syntax for
a lazily evaluated list of values. [A test included with this implementation](./test/fixtures/async/exec.js)
illustrates the improved behavior.

## Some interesting implications

### Simple concatenation mechanism for iterables

With generator literals it becomes possible to arbitrarily concatenate iterable sequences
without fully evaluating them and preserving in an intermediate array:

Prepending one or more elements to a possibly infinite iterable sequence:

```javascript
  apiConsumingIterable(
   *[ element, ...iterable ]
  );
```

Prepending a finite iterable sequence to a possibly infinite iterable sequence:

```javascript
  apiConsumingIterable(
    *[ ...finiteIterable, ...iterable ]
  );
```

### Infinite recurrent sequences

Cardinal numbers:

```javascript
let i = 0;
const card = *[ ++i, ...card ];
```

[Fibonacci numbers](./test/fixtures/infinite/exec.js):

```javascript
let a = 0, b = 1;
const fib = *[ a += b, b += a, ...fib ];
```

More complex examples are possible if you observe that the spread operator may be applied
conditionally, e.g. `...(condition ? recursivelyUsedGenerator : [])` where `[]` is used
as a convenient empty iterable.

While expressive, this technique is not, however, advantageous in terms of performance as
it effectively involves recursive invocations of the generator function. Support for TCO
by the major Javascript implementations would, of course, favor it.

Please note that the design choice for generator literals to return an iterable producing
a generator rather than a running generator enables such recursive use. An alternative
semantics:

```javascript
(
  function*() {
    yield expr1;
    yield expr2;
    yield* iterable;
  }
)()
```

would still provide lazy evaluation required by the other use cases but does not condone
the recursive calls. The tradeoffs between the two approaches require further exploration.
