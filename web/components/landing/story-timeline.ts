export const STAGE = { height: 560, width: 1200 };

export const ANCHORS = {
  app: { x: 180, y: 300 },
  assertion: { x: 330, y: 440 },
  fake: { x: 980, y: 190 },
  inbox: { x: 620, y: 430 },
  inboxtap: { x: 620, y: 290 },
  real: { x: 980, y: 380 },
};

export const BOUNDARY = { x1: 60, x2: 790, y1: 90, y2: 530 };

export const CONSTANTS = {
  code: "482910",
  fakeAddress: "test@example.com",
  link: "/verify?token=…",
};

export function pctLeft(x: number): string {
  return `${(x / STAGE.width) * 100}%`;
}

export function pctTop(y: number): string {
  return `${(y / STAGE.height) * 100}%`;
}

interface Track {
  input: number[];
  output: number[];
}

export interface CaptionTrack {
  opacity: Track;
  y: Track;
}

export const CAPTIONS: readonly [CaptionTrack, CaptionTrack, CaptionTrack] = [
  {
    opacity: { input: [0, 0.3, 0.34], output: [1, 1, 0] },
    y: { input: [0, 0.3, 0.34], output: [0, 0, -8] },
  },
  {
    opacity: { input: [0.3, 0.34, 0.62, 0.66], output: [0, 1, 1, 0] },
    y: { input: [0.3, 0.34, 0.62, 0.66], output: [8, 0, 0, -8] },
  },
  {
    opacity: { input: [0.62, 0.66, 1], output: [0, 1, 1] },
    y: { input: [0.62, 0.66, 1], output: [8, 0, 0] },
  },
];

export const SVG_TRACKS = {
  boundaryDraw: { input: [0.38, 0.5], output: [0, 1] },
  check: { input: [0.84, 0.9], output: [0, 1] },
  codeChip: {
    opacity: { input: [0.68, 0.71, 0.8], output: [0, 1, 1] },
    x: { input: [0.68, 0.8], output: [ANCHORS.inbox.x, ANCHORS.assertion.x] },
    y: { input: [0.68, 0.8], output: [ANCHORS.inbox.y, ANCHORS.assertion.y - 34] },
  },
  envelopeCaught: {
    opacity: { input: [0.44, 0.47, 0.56, 0.585], output: [0, 1, 1, 0] },
    x: { input: [0.44, 0.56], output: [ANCHORS.app.x + 40, ANCHORS.inboxtap.x - 66] },
    y: {
      input: [0.44, 0.5, 0.56],
      output: [ANCHORS.app.y, ANCHORS.inboxtap.y - 24, ANCHORS.inboxtap.y],
    },
  },
  envelopeFake: {
    opacity: { input: [0.02, 0.05, 0.13, 0.17], output: [0, 1, 1, 0] },
    x: { input: [0.02, 0.14], output: [ANCHORS.app.x + 40, ANCHORS.fake.x - 60] },
    y: { input: [0.02, 0.08, 0.14], output: [ANCHORS.app.y, 216, ANCHORS.fake.y] },
  },
  envelopeReal: {
    opacity: { input: [0.18, 0.21, 0.29, 0.33], output: [0, 1, 1, 0] },
    x: { input: [0.18, 0.3], output: [ANCHORS.app.x + 40, ANCHORS.real.x - 60] },
    y: { input: [0.18, 0.24, 0.3], output: [ANCHORS.app.y, 356, ANCHORS.real.y] },
  },
  linkChip: {
    opacity: { input: [0.72, 0.75, 0.84], output: [0, 1, 1] },
    x: { input: [0.72, 0.84], output: [ANCHORS.inbox.x, ANCHORS.assertion.x] },
    y: { input: [0.72, 0.84], output: [ANCHORS.inbox.y, ANCHORS.assertion.y + 2] },
  },
  routeFake: { input: [0, 0.04, 0.34, 0.42], output: [0.9, 0.9, 0.9, 0.25] },
  routeReal: { input: [0.14, 0.18, 0.34, 0.42], output: [0, 0.9, 0.9, 0.25] },
  vanish: { input: [0.13, 0.16, 0.3, 0.34], output: [0, 1, 1, 0] },
};

export const DOM_TRACKS = {
  assertionCard: {
    opacity: { input: [0.66, 0.72], output: [0, 1] },
    y: { input: [0.66, 0.72], output: [24, 0] },
  },
  boundaryTag: { opacity: { input: [0.46, 0.52], output: [0, 1] } },
  inboxCard: {
    opacity: { input: [0.58, 0.64], output: [0, 1] },
    y: { input: [0.58, 0.64], output: [24, 0] },
  },
  inboxtapNode: {
    opacity: { input: [0.34, 0.4], output: [0, 1] },
    scale: { input: [0.34, 0.4], output: [0.92, 1] },
  },
  passedTag: { opacity: { input: [0.84, 0.9], output: [0, 1] } },
  pulse: {
    opacity: { input: [0.55, 0.58, 0.61], output: [0, 0.9, 0] },
    scale: { input: [0.55, 0.61], output: [0.7, 1.35] },
  },
  riskTag: { opacity: { input: [0.24, 0.27, 0.32, 0.36], output: [0, 1, 1, 0] } },
};
