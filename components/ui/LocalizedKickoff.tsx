"use client";

import { usePreferences } from "@/components/ui/AppPreferences";
import { formatVisibleDate } from "@/lib/i18n";

export function LocalizedKickoff({ date, kickoffTime }: { date: string; kickoffTime: string }) {
  const { language } = usePreferences();

  return <>{formatVisibleDate(new Date(`${date}T${kickoffTime}:00`), language, { hour: "2-digit", minute: "2-digit" })}</>;
}
