"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import type { MatchStatus } from "@/types/match";

const statusLabelKeys: Record<MatchStatus, "upcoming" | "live" | "finished"> = {
  scheduled: "upcoming",
  live: "live",
  finished: "finished",
};

export function TranslatedStatus({ status }: { status: MatchStatus }) {
  const { t } = usePreferences();
  return <>{t(statusLabelKeys[status])}</>;
}
