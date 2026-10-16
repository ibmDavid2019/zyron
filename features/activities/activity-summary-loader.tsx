"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ActivitySummary } from "@/features/activities/activity-summary";
import { MOCK_ACTIVITIES } from "@/lib/mock-data";
import { getSavedActivities } from "@/utils/local-store";
import type { Activity } from "@/types/activity";

/**
 * Looks the activity up in both places it can live: the server-known mock
 * catalog (checked immediately) and real GPS-recorded activities, which
 * only exist in the browser's localStorage — so they can't be resolved
 * during server rendering the way the mock ones can.
 */
export function ActivitySummaryLoader({ id }: { id: string }) {
  const [activity, setActivity] = useState<Activity | null | undefined>(() => MOCK_ACTIVITIES.find((a) => a.id === id));

  useEffect(() => {
    if (activity) return;
    const timeout = setTimeout(() => {
      const saved = getSavedActivities().find((a) => a.id === id);
      setActivity(saved ?? null);
    }, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (activity === null) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-lg font-semibold">Atividade não encontrada</p>
        <p className="mt-1 text-sm text-muted-foreground">Ela pode ter sido removida ou o link está incorreto.</p>
        <Link
          href="/activities"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para Minhas atividades
        </Link>
      </div>
    );
  }

  if (!activity) return null;

  return <ActivitySummary activity={activity} />;
}
