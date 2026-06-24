"use client";

import { Trans, usePreferences } from "@/components/ui/AppPreferences";
import type { MatchEvent, MatchEventTeam, MatchEventType } from "@/types/match-event";
import type { Match } from "@/types/match";

type MatchEventsTimelineProps = {
  events: MatchEvent[];
  match: Match;
};

const eventLabelKeys: Record<MatchEventType, "goal" | "yellowCard" | "redCard" | "substitution"> = {
  goal: "goal",
  "yellow-card": "yellowCard",
  "red-card": "redCard",
  substitution: "substitution",
};

const eventIcons: Record<MatchEventType, string> = {
  goal: "⚽",
  "yellow-card": "🟨",
  "red-card": "🟥",
  substitution: "↔",
};

const eventAccentStyles: Record<MatchEventType, string> = {
  goal: "border-emerald-600/30 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100",
  "yellow-card": "border-yellow-600/30 bg-yellow-100 text-yellow-900 dark:border-yellow-300/30 dark:bg-yellow-300/10 dark:text-yellow-100",
  "red-card": "border-red-600/30 bg-red-100 text-red-900 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100",
  substitution: "border-sky-600/30 bg-sky-100 text-sky-900 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-100",
};

function getTeamName(match: Match, team: MatchEventTeam) {
  return team === "home" ? match.homeTeam.name : match.awayTeam.name;
}

function EventDetail({ event }: { event: MatchEvent }) {
  const { t } = usePreferences();
  if (event.type === "goal") {
    return event.assistName ? (
      <span>{t("assist")}: {event.assistName}</span>
    ) : (
      <span>{t("unassistedGoal")}</span>
    );
  }

  if (event.type === "substitution") {
    return (
      <span>
        {t("playerIn")} {event.playerInName} · {t("playerOut")} {event.playerOutName}
      </span>
    );
  }

  return <span>{event.reason ?? t(eventLabelKeys[event.type])}</span>;
}

export function MatchEventsTimeline({ events, match }: MatchEventsTimelineProps) {
  const { t } = usePreferences();
  const sortedEvents = [...events].sort(
    (firstEvent, secondEvent) => firstEvent.minute - secondEvent.minute,
  );

  return (
    <section className="rounded-2xl border border-stone-300 bg-white/90 p-5 shadow-sm shadow-stone-300/30 dark:border-zinc-800 dark:bg-zinc-900/80 dark:shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100"><Trans k="events" /></h2>
        <span className="rounded-full border border-stone-300 bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          <Trans k="demoData" />
        </span>
      </div>

      {sortedEvents.length > 0 ? (
        <ol className="mt-5 space-y-3">
          {sortedEvents.map((event) => (
            <li key={event.id} className="relative grid grid-cols-[3rem_1fr] gap-3">
              <time className="pt-3 text-right text-sm font-black tabular-nums text-amber-700 dark:text-amber-200">
                {event.minute}&apos;
              </time>
              <div className={`rounded-2xl border p-3 ${eventAccentStyles[event.type]}`}>
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-950/70 text-base">
                    {eventIcons[event.type]}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-zinc-950 dark:text-zinc-50">
                      {t(eventLabelKeys[event.type])} · {event.playerName}
                    </p>
                    <p className="mt-1 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                      {getTeamName(match, event.team)}
                    </p>
                    <p className="mt-2 text-xs text-stone-600 dark:text-zinc-400">
                      <EventDetail event={event} />
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-stone-600 dark:text-zinc-400"><Trans k="noMockEvents" /></p>
      )}
    </section>
  );
}
