import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
  bumpVersion,
  hasLibraryChanges,
  isLibraryReleasePath,
  LIBRARY_RELEASE_PATHS,
  maxReleaseLevel,
  releaseLevelForBranch,
} from "../scripts/release-policy.js";

test.each(["src/api.ts", "src/client/index.ts"])("%s is a library release path", (path) => {
  expect(isLibraryReleasePath(path)).toBeTrue();
});

test.each([
  "AGENTS.md",
  "LICENSE",
  "README.md",
  "RELEASING.md",
  "bun.lock",
  "docs/OVERVIEW.md",
  "examples/express-nodemailer/package.json",
  "package.json",
  "scripts/release-policy.ts",
  "test/inboxtap.test.ts",
  "tsconfig.json",
  "tsup.config.ts",
  "web/package.json",
])("%s does not trigger a library release", (path) => {
  expect(isLibraryReleasePath(path)).toBeFalse();
});

test("detects a library change among deferred website and documentation changes", () => {
  expect(hasLibraryChanges(["web/app/page.tsx", "docs/OVERVIEW.md", "src/server.ts"])).toBeTrue();
  expect(hasLibraryChanges(["web/package.json", "bun.lock", "README.md"])).toBeFalse();
});

test("the release workflow path filter matches the release policy", () => {
  const workflow = readFileSync(".github/workflows/release.yml", "utf8");
  const eventStart = workflow.indexOf("  pull_request_target:");
  const eventEnd = workflow.indexOf("  workflow_dispatch:");
  const eventConfiguration = workflow.slice(eventStart, eventEnd);
  const pathsBlock = eventConfiguration.match(/\n {4}paths:\n((?: {6}- .+\n)+)/)?.[1];
  const workflowPaths = pathsBlock
    ?.trim()
    .split("\n")
    .map((line) =>
      line
        .trim()
        .replace(/^-\s+"?/, "")
        .replace(/"?$/, ""),
    );

  expect(workflowPaths).toEqual([...LIBRARY_RELEASE_PATHS]);
});

test("the release workflow derives the previous tag from the package version", () => {
  const workflow = readFileSync(".github/workflows/release.yml", "utf8");
  const prepareRelease = readFileSync("scripts/prepare-release.ts", "utf8");

  expect(workflow).toContain('last_tag="v$(node -p "require(\'./package.json\').version")"');
  expect(workflow).not.toContain("git describe --tags");
  expect(prepareRelease).toMatch(/const previousTag = `v\$\{manifest\.version\}`;/);
  expect(prepareRelease).toContain('capture("git", ["rev-parse", "--verify"');
});

test.each(["breaking/remove-legacy-api", "major/next-generation"])(
  "%s selects a major release",
  (branch) => {
    expect(releaseLevelForBranch(branch)).toBe("major");
  },
);

test("feat branches select a minor release", () => {
  expect(releaseLevelForBranch("feat/add-smtp-auth")).toBe("minor");
});

test.each([
  "fix/header-parsing",
  "docs/release-process",
  "chore/update-dependencies",
  "refactor/message-store",
  "test/smtp-timeout",
  "dependabot/npm_and_yarn/typescript-5.8",
])("%s selects a patch release", (branch) => {
  expect(releaseLevelForBranch(branch)).toBe("patch");
});

test.each([
  [["docs/readme", "chore/deps"], "patch"],
  [["fix/header-parsing", "feat/new-filter", "docs/readme"], "minor"],
  [["chore/deps", "breaking/remove-legacy-api", "feat/new-filter"], "major"],
  [["feat/only-change"], "minor"],
] as const)("%p selects the highest release level %s", (branches, expected) => {
  expect(maxReleaseLevel([...branches])).toBe(expected);
});

test("maxReleaseLevel rejects an empty branch list", () => {
  expect(() => maxReleaseLevel([])).toThrow("Expected at least one branch name");
});

test.each([
  ["0.1.0", "patch", "0.1.1"],
  ["0.1.9", "minor", "0.2.0"],
  ["0.9.9", "major", "1.0.0"],
] as const)("bumps %s with %s to %s", (current, level, expected) => {
  expect(bumpVersion(current, level)).toBe(expected);
});

test.each(["1.0", "v1.0.0", "1.0.0-beta.1"])("rejects unstable version %s", (version) => {
  expect(() => bumpVersion(version, "patch")).toThrow(
    `Expected a stable semantic version, received ${version}`,
  );
});
