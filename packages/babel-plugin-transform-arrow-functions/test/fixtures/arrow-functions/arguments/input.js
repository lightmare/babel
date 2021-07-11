function one() {
  var inner = () => arguments;
  return [].slice.call(inner());
}
one(1, 2);

function two() {
  var inner = () => arguments;

  var another = function () {
    var inner2 = () => arguments;
  };

  return [].slice.call(inner());
}
two(1, 2);

function three() {
  var fn = () => arguments[0] + "bar";
  return fn();
}
three("foo");

function four() {
  var fn = () => arguments[0].foo + "bar";
  return fn();
}
four({ foo: "foo" });

function five(obj) {
  var fn = () => obj.arguments[0].foo + "bar";
  return fn();
}
five({ arguments: ["foo"] });

function six(obj) {
  var fn = () => {
    var fn2 = function () {
      return arguments[0];
    };
    return fn2("foobar");
  };
  return fn();
}
six();

var seven = () => {
    var arguments = 1;
    return arguments;
};
seven();

var eight = () => {
    var arguments = 1;
    return () => arguments;
};
eight();

function nine() {
    var arguments = 1;
    var foo = () => {
      return arguments;
    };
}
nine();

var eleven = () => {
  var arguments = 2;
  return function () {
    return () => arguments;
  }
};
eleven()(1,2,3)();

var twelve = () => {
  var arguments = 2;
  return class {
    m() { return () => arguments; }
  }
};
twelve();
