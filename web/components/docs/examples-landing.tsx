import Link from "next/link";
import type { DocContent } from "@/lib/content";
import { exampleReadmes, examplesLanding } from "@/lib/example-registry";
import { docPath, type Locale } from "@/lib/i18n/config";

export function examplesLandingContent(locale: Locale): DocContent {
  function ExamplesLandingContent() {
    const strings = examplesLanding[locale];

    return (
      <>
        <p>{strings.intro}</p>
        <h2 id="runnable-examples">{strings.title}</h2>
        <ul className="examples-list">
          {exampleReadmes.map((example) => (
            <li key={example.directory}>
              <Link href={docPath(locale, `${strings.slug}/${example.directory}`)}>
                <strong>{example.strings[locale].title}</strong>
                <span>{example.strings[locale].description}</span>
                <small>{strings.openExample} →</small>
              </Link>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return ExamplesLandingContent;
}
