let ob = {
  bar: 'A',
  foo() {
    return *['B', this.bar, 'R'];
  }
}

expect(Array.from(ob.foo())).toStrictEqual(['B', 'A', 'R']);

