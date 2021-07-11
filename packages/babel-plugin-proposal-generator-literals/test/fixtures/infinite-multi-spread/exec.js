const fiveZeros = *[0, 0, 0, 0, 0];
const fiveNonZeros = *[1, 2, 3, 4, 5];

let inf0, inf15;
inf0 = *[...fiveZeros, ...inf15];
inf15 = *[...fiveNonZeros, ...inf0];

let count = 666002;
let target = 999003;
let sum = 0;

for (const x of inf15) {
  if (--count < 0) break;
  sum += x;
}

expect(sum).toBe(target);
