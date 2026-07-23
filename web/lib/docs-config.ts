export const docGroups = ["getting-started", "reference", "guides"] as const;

export type DocGroup = (typeof docGroups)[number];

export const docs = [
  { group: "getting-started", key: "" },
  { group: "getting-started", key: "installation" },
  { group: "getting-started", key: "quick-start" },
  { group: "getting-started", key: "configuration" },
  { group: "getting-started", key: "alternatives" },
  { group: "reference", key: "trust" },
  { group: "reference", key: "reference/http-api" },
  { group: "reference", key: "reference/client-sdk" },
  { group: "guides", key: "guides/playwright" },
  { group: "guides", key: "guides/cypress" },
  { group: "guides", key: "guides/test-runners" },
  { group: "guides", key: "guides/better-auth" },
  { group: "guides", key: "guides/nodemailer" },
  { group: "guides", key: "guides/ci" },
  { group: "guides", key: "guides/troubleshooting" },
  { group: "reference", key: "changelog" },
] as const satisfies readonly { group: DocGroup; key: string }[];

export type DocKey = (typeof docs)[number]["key"];
