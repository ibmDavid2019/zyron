"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ShareEditor } from "@/features/share/share-editor";
import { MOCK_ACTIVITIES } from "@/lib/mock-data";
import { getSavedActivities } from "@/utils/local-store";
import type { Activity } from "@/types/activity";

/** Same lookup pattern as ActivitySummaryLoader — the activity may be a server-known mock or a real GPS recording that only exists in localStorage. */
export function ShareEditorLoader({ id }: { id: string }) {
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

  if (activity === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activity === null) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-lg font-semibold">Atividade não encontrada</p>
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

  return <ShareEditor activity={activity} />;
}
