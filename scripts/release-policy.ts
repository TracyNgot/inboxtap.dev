export type ReleaseLevel = "patch" | "minor" | "major";

export function releaseLevelForBranch(branch: string): ReleaseLevel {
  const [prefix] = branch.split("/", 1);
  if (prefix === "breaking" || prefix === "major") return "major";
  if (prefix === "feat") return "minor";
  return "patch";
}

export function bumpVersion(current: string, level: ReleaseLevel): string {
  const match = current.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) throw new Error(`Expected a stable semantic version, received ${current}`);

  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);
  if (level === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (level === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }
  return `${major}.${minor}.${patch}`;
}

if (import.meta.main) {
  const branch = process.argv[2];
  if (!branch) throw new Error("Usage: bun scripts/release-policy.ts <branch>");
  console.log(releaseLevelForBranch(branch));
}
