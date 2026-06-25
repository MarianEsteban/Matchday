"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import { formatVisibleDate, formatVisibleTime } from "@/lib/i18n";

export function LocalizedKickoff({ date, kickoffTime, kickoffAt }: { date: string; kickoffTime: string; kickoffAt?: string }) {
  const { language } = usePreferences();
  const kickoffDate = kickoffAt ? new Date(kickoffAt) : new Date(`${date}T${kickoffTime}:00`);

  return <>{formatVisibleDate(kickoffDate, language, { hour: "2-digit", minute: "2-digit" })}</>;
}

export function LocalizedKickoffTime({ date, kickoffTime, kickoffAt }: { date: string; kickoffTime: string; kickoffAt?: string }) {
  const { language } = usePreferences();
  const kickoffDate = kickoffAt ? new Date(kickoffAt) : new Date(`${date}T${kickoffTime}:00`);

  return <>{formatVisibleTime(kickoffDate, language)}</>;
}
