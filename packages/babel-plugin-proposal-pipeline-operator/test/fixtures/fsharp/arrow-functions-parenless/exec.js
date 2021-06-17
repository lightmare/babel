const y = 2;

const f = (x) => (x |> (y) => y + 1)
  |> (z) => z * y

const _f = (x) => x
  |> (y) => y + 1
  |> (z) => z * y

const g = (x) => x
  |> (y) => (y + 1 |> (z) => z * y)

const _g = (x) => x
  |> (y => (y + 1 |> (z) => z * y))

const __g = (x) => x
  |> (
    y => {
      return (y + 1 |> (z) => z * y);
    }
  )

expect(  f(1)).toBe(4);
expect( _f(1)).toBe(4);
expect(  g(1)).toBe(2);
expect( _g(1)).toBe(2);
expect(__g(1)).toBe(2);

const cache = {};
const work = x => x ** 2;

const memoizeF =           y => cache[y] ??= y |> work;
const memoizeG = x => x |> y => cache[y] ??= y |> work;

expect(memoizeF(2)).toBe(4);
expect(cache[2]).toBe(4);

expect(memoizeG(3)).toBe(9);
expect(cache[3]).toBe(9);
