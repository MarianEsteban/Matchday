"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import { translateCompetitionName } from "@/lib/i18n";

export function TranslatedCompetitionName({ competition }: { competition: string }) {
  const { language } = usePreferences();

  return <>{translateCompetitionName(competition, language)}</>;
}
