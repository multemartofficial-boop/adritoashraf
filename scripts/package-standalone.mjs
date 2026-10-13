// Assembles a cPanel-ready bundle after `next build`:
//   deploy/app/                 -> upload contents to the Node.js App root
//   deploy/adrito-portfolio.zip -> same, zipped for cPanel File Manager "Extract"
import { cpSync, existsSync, rmSync, mkdirSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const standalone = join(root, ".next", "standalone");
const out = join(root, "deploy");
const app = join(out, "app");
const zip = join(out, "adrito-portfolio.zip");

if (!existsSync(join(standalone, "server.js"))) {
  console.error("No .next/standalone/server.js found. Run `npm run build` first.");
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(app, { recursive: true });

cpSync(standalone, app, { recursive: true });
cpSync(join(root, ".next", "static"), join(app, ".next", "static"), { recursive: true });
cpSync(join(root, "public"), join(app, "public"), { recursive: true });

// Never ship local env files or native image binaries built for this OS.
for (const f of readdirSync(app)) if (f.startsWith(".env")) rmSync(join(app, f), { force: true });
for (const p of ["node_modules/sharp", "node_modules/@img"]) rmSync(join(app, p), { recursive: true, force: true });

try {
  if (process.platform === "win32") {
    // Windows 10+ ships bsdtar, which can write zip archives.
    execFileSync("C:\\Windows\\System32\\tar.exe", ["-a", "-c", "-f", zip, "-C", app, "."], { stdio: "inherit" });
  } else {
    execFileSync("zip", ["-qr", zip, "."], { cwd: app, stdio: "inherit" });
  }
  console.log(`\nBundle ready:\n  ${app}\n  ${zip}`);
} catch {
  console.log(`\nBundle folder ready (zip step failed, compress it manually):\n  ${app}`);
}
