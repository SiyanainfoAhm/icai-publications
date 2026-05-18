import fs from "fs";
import path from "path";

const CLOSE_WRONG = "</" + "motion>";
const CLOSE_RIGHT = "</" + "div>";
const OPEN_WRONG = "<" + "motion";
const OPEN_RIGHT = "<" + "div";

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (name.endsWith(".tsx") || name.endsWith(".ts")) {
      let c = fs.readFileSync(full, "utf8");
      const before = c;
      c = c.replaceAll(CLOSE_WRONG, CLOSE_RIGHT);
      c = c.replaceAll(OPEN_WRONG, OPEN_RIGHT);
      if (c !== before) {
        fs.writeFileSync(full, c);
        console.log("fixed", full);
      }
    }
  }
}

walk("src");
