import { execFileSync } from "node:child_process";

export function securePrivateDirectory(
  directory: string
): void {
  if (process.platform !== "win32") {
    return;
  }

  if (typeof directory !== "string" ||
      directory.length === 0) {
    throw new Error("Invalid private directory");
  }

  const sid = getCurrentUserSid();

  if (!/^S-\d+(?:-\d+)+$/.test(sid)) {
    throw new Error("Invalid Windows user SID");
  }

  execFileSync("icacls.exe", [
    directory,
    "/inheritance:r",
    "/grant:r",
    `*${sid}:(OI)(CI)F`,
    "*S-1-5-18:(OI)(CI)F",
    "*S-1-5-32-544:(OI)(CI)F"
  ], {
    windowsHide: true,
    stdio: "ignore"
  });
}

function getCurrentUserSid(): string {
  const output = execFileSync(
    "whoami.exe",
    ["/user", "/fo", "csv", "/nh"],
    { encoding: "utf8", windowsHide: true }
  );

  const match = output.match(/S-\d+(?:-\d+)+/);

  if (!match) {
    throw new Error("Unable to resolve Windows user SID");
  }

  return match[0];
}
