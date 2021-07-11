let zeroOne, oneZero;
zeroOne = *[0, ...oneZero];
oneZero = *[1, ...zeroOne];

let count = 128000;
let target = 64000;
let sum = 0;

for (const x of oneZero) {
  if (--count < 0) break;
  sum += x;
}

expect(sum).toBe(target);
