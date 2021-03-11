/* global expect */

function generatorYields(generator, sequence, only) {
  const received = [],
    expected = [];
  if (sequence.length || only) {
    for (const item of generator) {
      received.push(item);
      if (!sequence.length) {
        return { expected, received };
      }
      expected.push(sequence.shift());
      if (received[received.length - 1] != expected[expected.length - 1]) {
        return { received, expected };
      }
      if (!sequence.length && !only) {
        break;
      }
    }
    if (sequence.length) {
      return { expected: expected.concat(sequence), received };
    }
  }
  return { expected };
}

function matcher(only) {
  const print = list => (list.length ? list : "nothing");

  return function (generator, ...items) {
    const { received, expected } = generatorYields(generator, items, only);
    return {
      pass: !received,
      message: this.isNot
        ? () => `Expected not to receive ${print(expected)}`
        : () =>
            `Expected to receive ${print(expected)}, received ${print(
              received
            )}`,
    };
  };
}

expect.extend({
  toYieldAtLeast: matcher(false),
  toYieldExactly: matcher(true),
});
