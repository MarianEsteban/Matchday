"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import { translateTeamName } from "@/lib/i18n";

export function TeamName({ name }: { name: string }) {
  const { language } = usePreferences();
  return <>{translateTeamName(name, language)}</>;
}
