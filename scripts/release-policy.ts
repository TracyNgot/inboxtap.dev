export type ReleaseLevel = "patch" | "minor" | "major";

const LEVEL_RANK: Record<ReleaseLevel, number> = { patch: 0, minor: 1, major: 2 };

export function releaseLevelForBranch(branch: string): ReleaseLevel {
  const [prefix] = branch.split("/", 1);
  if (prefix === "breaking" || prefix === "major") return "major";
  if (prefix === "feat") return "minor";
  return "patch";
}

export function maxReleaseLevel(branches: string[]): ReleaseLevel {
  if (branches.length === 0) throw new Error("Expected at least one branch name");
  return branches
    .map(releaseLevelForBranch)
    .reduce((highest, level) => (LEVEL_RANK[level] > LEVEL_RANK[highest] ? level : highest));
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
  const branches = process.argv.slice(2);
  if (branches.length === 0)
    throw new Error("Usage: bun scripts/release-policy.ts <branch> [branch...]");
  console.log(maxReleaseLevel(branches));
}
