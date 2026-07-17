import { execFileSync } from "node:child_process";

export function assertCleanMain(): void {
  const branch = capture("git", ["branch", "--show-current"]);
  if (branch !== "main")
    throw new Error(`Releases must run from main, not ${branch || "detached HEAD"}`);

  const status = capture("git", ["status", "--porcelain"]);
  if (status) throw new Error("Release requires a clean worktree. Commit or stash changes first.");
}

export function capture(command: string, args: string[]): string {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}

export function run(command: string, args: string[]): void {
  execFileSync(command, args, { stdio: "inherit" });
}
