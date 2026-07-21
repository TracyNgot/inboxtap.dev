import { describe, expect, test } from "bun:test";
import { transform } from "motion";
import { ANCHORS, CAPTIONS, DOM_TRACKS, SVG_TRACKS } from "@/components/landing/story-timeline";

interface Track {
  input: number[];
  output: number[];
}

function collectTracks(value: unknown, path: string, into: [string, Track][]): void {
  if (!value || typeof value !== "object") return;
  const candidate = value as Partial<Track>;
  if (Array.isArray(candidate.input) && Array.isArray(candidate.output)) {
    into.push([path, candidate as Track]);
    return;
  }
  for (const [key, child] of Object.entries(value)) collectTracks(child, `${path}.${key}`, into);
}

const allTracks: [string, Track][] = [];
collectTracks({ CAPTIONS, DOM_TRACKS, SVG_TRACKS }, "timeline", allTracks);

describe("story timeline", () => {
  test("collects the full keyframe table", () => {
    expect(allTracks.length).toBeGreaterThanOrEqual(20);
  });

  test("every track pairs inputs with outputs and stays inside the scrub range", () => {
    for (const [name, track] of allTracks) {
      expect(track.input.length, name).toBe(track.output.length);
      expect(track.input.length, name).toBeGreaterThanOrEqual(2);
      for (const [index, value] of track.input.entries()) {
        expect(value >= 0 && value <= 1, `${name} input ${value}`).toBe(true);
        if (index > 0) {
          expect(value > (track.input[index - 1] as number), `${name} not increasing`).toBe(true);
        }
      }
    }
  });

  test("exactly one caption is fully visible at each act midpoint", () => {
    const midpoints = [0.15, 0.5, 0.85];
    for (const [actIndex, progress] of midpoints.entries()) {
      for (const [captionIndex, caption] of CAPTIONS.entries()) {
        const opacity = transform(caption.opacity.input, caption.opacity.output)(progress);
        expect(opacity, `caption ${captionIndex} at P=${progress}`).toBe(
          captionIndex === actIndex ? 1 : 0,
        );
      }
    }
  });

  test("the intercepted envelope stops inside the boundary at InboxTap", () => {
    const track = SVG_TRACKS.envelopeCaught;
    const finalX = transform(track.x.input, track.x.output)(0.6);
    expect(finalX).toBeLessThan(ANCHORS.inboxtap.x);
    expect(transform(track.opacity.input, track.opacity.output)(0.65)).toBe(0);
  });

  test("the finale settles fully drawn before the unpin", () => {
    expect(transform(SVG_TRACKS.boundaryDraw.input, SVG_TRACKS.boundaryDraw.output)(0.55)).toBe(1);
    expect(transform(SVG_TRACKS.check.input, SVG_TRACKS.check.output)(0.92)).toBe(1);
    const passed = DOM_TRACKS.passedTag.opacity;
    expect(transform(passed.input, passed.output)(0.95)).toBe(1);
  });
});
