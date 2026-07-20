import { expect, test } from "bun:test";
import { bumpVersion, releaseLevelForBranch } from "../scripts/release-policy.js";

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
