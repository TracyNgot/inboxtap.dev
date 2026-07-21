"use client";

import { easeInOut, easeOut } from "motion";
import { motion, type MotionValue, useTransform } from "motion/react";
import { ANCHORS, BOUNDARY, CONSTANTS, STAGE, SVG_TRACKS } from "./story-timeline";

interface TravelTracks {
  opacity: { input: number[]; output: number[] };
  x: { input: number[]; output: number[] };
  y: { input: number[]; output: number[] };
}

function Envelope({ progress, track }: { progress: MotionValue<number>; track: TravelTracks }) {
  const opacity = useTransform(progress, track.opacity.input, track.opacity.output);
  const x = useTransform(progress, track.x.input, track.x.output, { ease: easeInOut });
  const y = useTransform(progress, track.y.input, track.y.output, { ease: easeOut });

  return (
    <motion.g className="story-envelope story-mover" style={{ opacity, x, y }}>
      <rect height="24" rx="2" strokeWidth="1.5" width="36" x="-18" y="-12" />
      <path d="M-18 -12L0 2l18-14" fill="none" strokeWidth="1.5" />
    </motion.g>
  );
}

function Chip({
  label,
  progress,
  track,
  width,
}: {
  label: string;
  progress: MotionValue<number>;
  track: TravelTracks;
  width: number;
}) {
  const opacity = useTransform(progress, track.opacity.input, track.opacity.output);
  const x = useTransform(progress, track.x.input, track.x.output, { ease: easeInOut });
  const y = useTransform(progress, track.y.input, track.y.output, { ease: easeInOut });

  return (
    <motion.g className="story-mover" style={{ opacity, x, y }}>
      <rect className="story-chip-box" height="30" rx="2" width={width} x={-width / 2} y="-15" />
      <text textAnchor="middle" y="5">
        {label}
      </text>
    </motion.g>
  );
}

export function StorySvgLayer({ progress }: { progress: MotionValue<number> }) {
  const routeFakeOpacity = useTransform(
    progress,
    SVG_TRACKS.routeFake.input,
    SVG_TRACKS.routeFake.output,
  );
  const routeRealOpacity = useTransform(
    progress,
    SVG_TRACKS.routeReal.input,
    SVG_TRACKS.routeReal.output,
  );
  const vanishOpacity = useTransform(progress, SVG_TRACKS.vanish.input, SVG_TRACKS.vanish.output);
  const boundaryDraw = useTransform(
    progress,
    SVG_TRACKS.boundaryDraw.input,
    SVG_TRACKS.boundaryDraw.output,
  );
  const checkDraw = useTransform(progress, SVG_TRACKS.check.input, SVG_TRACKS.check.output);

  return (
    <svg
      aria-hidden="true"
      className="story-svg"
      focusable="false"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
      width="100%"
    >
      <motion.path
        className="story-route"
        d={`M ${ANCHORS.app.x + 44} ${ANCHORS.app.y - 8} Q 600 176 ${ANCHORS.fake.x - 84} ${ANCHORS.fake.y}`}
        fill="none"
        stroke="currentColor"
        style={{ opacity: routeFakeOpacity }}
        vectorEffect="non-scaling-stroke"
      />
      <motion.path
        className="story-route"
        d={`M ${ANCHORS.app.x + 44} ${ANCHORS.app.y + 8} Q 600 360 ${ANCHORS.real.x - 84} ${ANCHORS.real.y}`}
        fill="none"
        stroke="currentColor"
        style={{ opacity: routeRealOpacity }}
        vectorEffect="non-scaling-stroke"
      />
      <motion.path
        className="story-accent"
        d={`M ${BOUNDARY.x1} ${BOUNDARY.y1} H ${BOUNDARY.x2} V ${BOUNDARY.y2} H ${BOUNDARY.x1} Z`}
        fill="none"
        stroke="currentColor"
        strokeDasharray="4 7"
        style={{ opacity: 0.75, pathLength: boundaryDraw }}
        vectorEffect="non-scaling-stroke"
      />
      <Envelope progress={progress} track={SVG_TRACKS.envelopeFake} />
      <Envelope progress={progress} track={SVG_TRACKS.envelopeReal} />
      <Envelope progress={progress} track={SVG_TRACKS.envelopeCaught} />
      <motion.g
        style={{ opacity: vanishOpacity }}
        transform={`translate(${ANCHORS.fake.x} ${ANCHORS.fake.y - 52})`}
      >
        <path
          d="M-8 -8L8 8M8 -8L-8 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </motion.g>
      <Chip label={CONSTANTS.code} progress={progress} track={SVG_TRACKS.codeChip} width={96} />
      <Chip label={CONSTANTS.link} progress={progress} track={SVG_TRACKS.linkChip} width={148} />
      <motion.path
        className="story-accent"
        d={`M ${ANCHORS.assertion.x + 118} ${ANCHORS.assertion.y - 2} l 8 9 l 17 -20`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        style={{ pathLength: checkDraw }}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
