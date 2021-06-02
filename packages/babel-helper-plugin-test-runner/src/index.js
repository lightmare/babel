import testRunner from "@babel/helper-transform-fixture-test-runner";
import path from "path";
import { URL, fileURLToPath } from "url";

export default function (loc) {
  if (!process.env.BABEL_8_BREAKING) {
    if (!loc.startsWith("file://")) {
      const name = path.basename(path.dirname(loc));
      testRunner(loc + "/fixtures", name);
      return;
    }
  }

  const fixtures = fileURLToPath(new URL("./fixtures", loc));
  const name = path.basename(fileURLToPath(new URL("..", loc)));

  testRunner(fixtures, name);
}
