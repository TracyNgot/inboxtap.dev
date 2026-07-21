import type { Dictionary } from "@/lib/i18n/types";

function LostGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height="44" viewBox="0 0 44 44" width="44">
      <rect height="20" rx="2" stroke="currentColor" strokeWidth="1.5" width="28" x="4" y="12" />
      <path d="M4 14l14 10 14-10" stroke="currentColor" strokeWidth="1.5" />
      <path
        className="story-accent"
        d="M33 29l8 8m0-8l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function CaughtGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height="44" viewBox="0 0 44 44" width="44">
      <path
        className="story-accent"
        d="M2 8V2h6M36 2h6v6M42 36v6h-6M8 42H2v-6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect height="20" rx="2" stroke="currentColor" strokeWidth="1.5" width="28" x="8" y="12" />
      <path d="M8 14l14 10 14-10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AssertGlyph() {
  return (
    <svg aria-hidden="true" fill="none" height="44" viewBox="0 0 44 44" width="44">
      <path d="M4 12h20M4 22h14M4 32h18" stroke="currentColor" strokeWidth="1.5" />
      <path className="story-accent" d="M26 28l6 6 10-12" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

const glyphs = [LostGlyph, CaughtGlyph, AssertGlyph] as const;

export function StoryStacked({ t }: { t: Dictionary["landing"]["story"] }) {
  return (
    <div className="section-shell landing-section story-stacked">
      <div className="card-grid three-column">
        {([0, 1, 2] as const).map((index) => {
          const act = t.acts[index];
          const Glyph = glyphs[index];
          return (
            <div className="glass-card story-panel" key={act.title}>
              <Glyph />
              <p className="eyebrow">{act.eyebrow}</p>
              <h3>{act.title}</h3>
              <p>{act.line}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
