import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedResources, type ResourceKind } from "@/lib/resources";
import { Reveal } from "../landing/reveal";

const groups = ["integrations", "guides", "compare"] as const satisfies readonly ResourceKind[];

export function ResourceDirectory({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const t = dictionary.resourcesChrome;
  const resources = getLocalizedResources(locale);

  return (
    <section className="section-shell landing-section resource-directory" id="resources">
      <Reveal>
        <p className="eyebrow">{t.landingEyebrow}</p>
        <h2>{t.landingHeading}</h2>
        <p className="section-lede">{t.landingLede}</p>
      </Reveal>
      {groups.map((group) => (
        <div className="resource-directory-group" key={group}>
          <h3>{t.groups[group]}</h3>
          <div className="resource-card-grid">
            {resources
              .filter((resource) => resource.kind === group)
              .map((resource, index) => (
                <Reveal
                  className="glass-card resource-card"
                  delay={(index % 3) * 0.05}
                  key={resource.key}
                >
                  <Link href={resource.path}>
                    <strong>{resource.title}</strong>
                    <span>{resource.description}</span>
                    <small>{t.cardCta} →</small>
                  </Link>
                </Reveal>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
