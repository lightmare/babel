let a = 0, b = 1;
const fib = *[a+=b, b+=a, ...fib];

expect(fib).toYieldAtLeast(1,2,3,5,8,13,21);

