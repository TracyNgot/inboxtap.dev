import type { CoreDocKey, DocGroup } from "../docs-config";

export interface TocItem {
  id: string;
  label: string;
}

export interface DocStrings {
  slug: string;
  title: string;
  description: string;
  toc: readonly TocItem[];
}

export interface DocsDictionary {
  groups: Record<DocGroup, string>;
  entries: Record<CoreDocKey, DocStrings>;
}

export interface StoryAct {
  eyebrow: string;
  title: string;
  line: string;
}

export interface Dictionary {
  chrome: {
    wordmarkAria: string;
    navAria: string;
    navFeatures: string;
    navDocs: string;
    footerTagline: string;
    footerGitHubAria: string;
    npmLabel: string;
    supportLabel: string;
    trustLabel: string;
    languageSwitcherAria: string;
    themeToggleAria: string;
    themeSwitchToLight: string;
    themeSwitchToDark: string;
  };
  docsChrome: {
    browse: string;
    heading: string;
    navAria: string;
    closeOverlayAria: string;
    closeAria: string;
    tocHeading: string;
    pagerAria: string;
    previous: string;
    next: string;
    maintainedBy: string;
    contributors: string;
    lastUpdated: string;
    copy: string;
    copied: string;
    copyAria: string;
    changelogRelease: string;
    changelogFull: string;
  };
  landing: {
    eyebrow: string;
    headline1: string;
    headline2: string;
    lede: string;
    ctaPrimary: string;
    ctaSecondary: string;
    story: {
      ariaLabel: string;
      acts: readonly [StoryAct, StoryAct, StoryAct];
      labels: {
        app: string;
        boundary: string;
        captured: string;
        fake: string;
        inbox: string;
        localhostTag: string;
        passed: string;
        real: string;
        risk: string;
      };
    };
    featuresHeading: string;
    features: readonly (readonly [string, string])[];
    codeEyebrow: string;
    codeHeading: string;
    codeLede: string;
    installEyebrow: string;
    installReady: string;
    installLink: string;
    closingEyebrow: string;
    closingHeading: string;
    closingLede: string;
    closingCta: string;
  };
  meta: {
    title: string;
    titleTemplate: string;
    description: string;
    ogDescription: string;
    twitterDescription: string;
    docsTitle: string;
    docsTitleTemplate: string;
    breadcrumbHome: string;
    breadcrumbDocs: string;
    ogImage: { line1: string; line2: string; tagline: string; alt: string };
  };
  notFound: {
    eyebrow: string;
    title: string;
    text: string;
    goHome: string;
    readDocs: string;
  };
}
