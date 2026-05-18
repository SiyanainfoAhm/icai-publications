/**
 * Ensures portal/public/covers points at repo-root covers/ (Windows junction or Unix symlink).
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const portalDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const linkPath = path.join(portalDir, "public", "covers");
const targetPath = path.resolve(portalDir, "..", "covers");

if (!fs.existsSync(targetPath)) {
  console.warn("covers/ folder not found at repo root:", targetPath);
  process.exit(0);
}

if (fs.existsSync(linkPath)) {
  console.log("covers link already exists:", linkPath);
  process.exit(0);
}

fs.mkdirSync(path.join(portalDir, "public"), { recursive: true });

if (process.platform === "win32") {
  execSync(`mklink /J "${linkPath}" "${targetPath}"`, { stdio: "inherit" });
} else {
  fs.symlinkSync(targetPath, linkPath, "dir");
}

console.log("covers link created:", linkPath, "→", targetPath);
