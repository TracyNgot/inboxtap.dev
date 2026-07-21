"use client";

import { motion, type MotionValue, useMotionValue, useTransform } from "motion/react";
import { type RefObject, useEffect, useRef } from "react";
import type { Dictionary, StoryAct } from "@/lib/i18n/types";
import { StoryStage } from "./story-stage";
import { StorySvgLayer } from "./story-svg-layer";
import { type CaptionTrack, CAPTIONS } from "./story-timeline";

type StoryStrings = Dictionary["landing"]["story"];

function useTrackProgress(ref: RefObject<HTMLDivElement | null>): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const track = ref.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      progress.set(total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [progress, ref]);

  return progress;
}

export function StoryScene({ t }: { t: StoryStrings }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollYProgress = useTrackProgress(trackRef);

  return (
    <div className="story-track" ref={trackRef}>
      <div className="section-shell story-sticky">
        <div className="story-captions">
          {([0, 1, 2] as const).map((index) => (
            <StoryCaption
              act={t.acts[index]}
              key={t.acts[index].title}
              progress={scrollYProgress}
              track={CAPTIONS[index]}
            />
          ))}
        </div>
        <motion.div
          aria-hidden="true"
          className="story-progress"
          style={{ scaleX: scrollYProgress }}
        />
        <div className="story-stage-wrap">
          <div aria-hidden="true" className="story-stage">
            <StorySvgLayer progress={scrollYProgress} />
            <StoryStage progress={scrollYProgress} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryCaption({
  act,
  progress,
  track,
}: {
  act: StoryAct;
  progress: MotionValue<number>;
  track: CaptionTrack;
}) {
  const opacity = useTransform(progress, track.opacity.input, track.opacity.output);
  const y = useTransform(progress, track.y.input, track.y.output);

  return (
    <motion.div className="story-caption" style={{ opacity, y }}>
      <p className="eyebrow">{act.eyebrow}</p>
      <h3>{act.title}</h3>
      <p>{act.line}</p>
    </motion.div>
  );
}
