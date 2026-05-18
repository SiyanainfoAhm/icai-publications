/**
 * Recreates portal/public/covers → ../../covers junction (Windows).
 * Run from portal/: node scripts/setup-covers-link.mjs
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const portalDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const linkPath = path.join(portalDir, "public", "covers");
const targetPath = path.join(portalDir, "..", "covers");

if (process.platform !== "win32") {
  console.log("On macOS/Linux, symlink manually: ln -s ../../covers public/covers");
  process.exit(0);
}

if (fs.existsSync(linkPath)) {
  console.log("covers link already exists:", linkPath);
  process.exit(0);
}

fs.mkdirSync(path.join(portalDir, "public"), { recursive: true });
execSync(`mklink /J "${linkPath}" "${path.resolve(targetPath)}"`, { stdio: "inherit" });
console.log("Junction created.");
