// Prints "yes" when a scheduled article's time has come (or one was removed) since the last build, else "no".
// Used by the hourly run in .github/workflows/build.yml so the site is rebuilt only when something changes.
import fs from "node:fs";
import path from "node:path";
import { ROOT_DIR } from "./lib/ui.mjs";
import { ownerPosts } from "./lib/ownerposts.mjs";
import builtIn from "./content/posts.mjs";
let built = [];
try { built = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "_src/.owner-posts.json"), "utf8")); } catch {}
const now = ownerPosts().filter((p) => !builtIn.some((x) => x.slug === p.slug)).map((p) => p.slug).sort();
console.log(JSON.stringify(now) === JSON.stringify([...built].sort()) ? "no" : "yes");
