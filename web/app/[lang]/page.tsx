import { LandingPage } from "@/components/landing/landing-page";
import { assertLocale } from "@/lib/i18n/config";

export default async function LocalizedHomePage({ params }: { params: Promise<{ lang: string }> }) {
  return <LandingPage locale={assertLocale((await params).lang)} />;
}
