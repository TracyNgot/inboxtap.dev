"use client";

import { motion, type MotionValue, useTransform } from "motion/react";
import type { ReactNode } from "react";
import type { Dictionary } from "@/lib/i18n/types";
import { ANCHORS, BOUNDARY, CONSTANTS, DOM_TRACKS, pctLeft, pctTop } from "./story-timeline";

type StoryStrings = Dictionary["landing"]["story"];

interface StageProps {
  progress: MotionValue<number>;
  t: StoryStrings;
}

function Anchor({ children, x, y }: { children: ReactNode; x: number; y: number }) {
  return (
    <div className="story-anchor" style={{ left: pctLeft(x), top: pctTop(y) }}>
      {children}
    </div>
  );
}

export function StoryStage({ progress, t }: StageProps) {
  const track = DOM_TRACKS;
  const inboxtapOpacity = useTransform(
    progress,
    track.inboxtapNode.opacity.input,
    track.inboxtapNode.opacity.output,
  );
  const inboxtapScale = useTransform(
    progress,
    track.inboxtapNode.scale.input,
    track.inboxtapNode.scale.output,
  );
  const pulseOpacity = useTransform(
    progress,
    track.pulse.opacity.input,
    track.pulse.opacity.output,
  );
  const pulseScale = useTransform(progress, track.pulse.scale.input, track.pulse.scale.output);
  const inboxOpacity = useTransform(
    progress,
    track.inboxCard.opacity.input,
    track.inboxCard.opacity.output,
  );
  const inboxY = useTransform(progress, track.inboxCard.y.input, track.inboxCard.y.output);
  const assertionOpacity = useTransform(
    progress,
    track.assertionCard.opacity.input,
    track.assertionCard.opacity.output,
  );
  const assertionY = useTransform(
    progress,
    track.assertionCard.y.input,
    track.assertionCard.y.output,
  );
  const boundaryTagOpacity = useTransform(
    progress,
    track.boundaryTag.opacity.input,
    track.boundaryTag.opacity.output,
  );
  const riskOpacity = useTransform(
    progress,
    track.riskTag.opacity.input,
    track.riskTag.opacity.output,
  );
  const passedOpacity = useTransform(
    progress,
    track.passedTag.opacity.input,
    track.passedTag.opacity.output,
  );
  const assertionValueOpacity = useTransform(
    progress,
    track.assertionValue.opacity.input,
    track.assertionValue.opacity.output,
  );

  return (
    <>
      <Anchor x={ANCHORS.app.x} y={ANCHORS.app.y}>
        <div className="story-node">
          <strong>{t.labels.app}</strong>
          <span>SMTP</span>
        </div>
      </Anchor>
      <Anchor x={ANCHORS.fake.x} y={ANCHORS.fake.y}>
        <div className="story-node">
          <strong>{CONSTANTS.fakeAddress}</strong>
          <span>{t.labels.fake}</span>
        </div>
      </Anchor>
      <Anchor x={ANCHORS.real.x} y={ANCHORS.real.y}>
        <div className="story-node">
          <strong>{t.labels.real}</strong>
        </div>
      </Anchor>
      <Anchor x={ANCHORS.real.x} y={ANCHORS.real.y + 46}>
        <motion.div className="story-tag story-mover" style={{ opacity: riskOpacity }}>
          {t.labels.risk}
        </motion.div>
      </Anchor>
      <Anchor x={ANCHORS.inboxtap.x} y={ANCHORS.inboxtap.y}>
        <motion.div
          className="story-pulse story-mover"
          style={{ opacity: pulseOpacity, scale: pulseScale }}
        />
      </Anchor>
      <Anchor x={ANCHORS.inboxtap.x} y={ANCHORS.inboxtap.y}>
        <motion.div
          className="story-node story-node-accent story-mover"
          style={{ opacity: inboxtapOpacity, scale: inboxtapScale }}
        >
          <strong>InboxTap</strong>
          <span>{t.labels.localhostTag}</span>
        </motion.div>
      </Anchor>
      <Anchor x={(BOUNDARY.x1 + BOUNDARY.x2) / 2} y={BOUNDARY.y1}>
        <motion.div className="story-tag story-mover" style={{ opacity: boundaryTagOpacity }}>
          {t.labels.boundary}
        </motion.div>
      </Anchor>
      <Anchor x={ANCHORS.inbox.x} y={ANCHORS.inbox.y}>
        <motion.div className="story-node story-mover" style={{ opacity: inboxOpacity, y: inboxY }}>
          <strong>{t.labels.inbox}</strong>
          <span>{t.labels.captured} ✓</span>
        </motion.div>
      </Anchor>
      <Anchor x={ANCHORS.assertion.x} y={ANCHORS.assertion.y}>
        <motion.div
          className="story-node story-mover"
          style={{ opacity: assertionOpacity, y: assertionY }}
        >
          <strong>await inbox.waitForCode()</strong>
          <motion.span style={{ opacity: assertionValueOpacity }}>→ {CONSTANTS.code}</motion.span>
        </motion.div>
      </Anchor>
      <Anchor x={ANCHORS.assertion.x} y={ANCHORS.assertion.y + 52}>
        <motion.div
          className="story-tag story-tag-accent story-mover"
          style={{ opacity: passedOpacity }}
        >
          {t.labels.passed} ✓
        </motion.div>
      </Anchor>
    </>
  );
}
