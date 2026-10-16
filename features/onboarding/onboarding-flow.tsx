"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/shared/logo";
import { CURRENT_USER } from "@/lib/mock-data";
import { WelcomeStep } from "@/features/onboarding/steps/welcome-step";
import { ActivitiesStep } from "@/features/onboarding/steps/activities-step";
import { GoalStep } from "@/features/onboarding/steps/goal-step";
import { LevelStep } from "@/features/onboarding/steps/level-step";
import { ProfileStep } from "@/features/onboarding/steps/profile-step";
import type { OnboardingData } from "@/types/onboarding";

const TOTAL_STEPS = 5;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    activities: [],
    goal: null,
    level: null,
    profile: {
      name: CURRENT_USER.name,
      city: CURRENT_USER.city ?? "",
      bio: "",
      avatarUrl: null,
    },
  });

  const canContinue =
    step === 1 ? data.activities.length > 0 : step === 2 ? !!data.goal : step === 3 ? !!data.level : true;

  function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
      return;
    }

    setSubmitting(true);
    // TODO(supabase): persist onboarding answers to the user profile
    setTimeout(() => {
      setSubmitting(false);
      toast.success(`Tudo pronto, ${data.profile.name.split(" ")[0] || "atleta"}!`);
      router.push("/dashboard");
    }, 900);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center gap-4 p-4 sm:p-6">
        {step > 0 ? (
          <Button variant="ghost" size="icon" onClick={() => setStep((s) => s - 1)} aria-label="Voltar">
            <ChevronLeft className="size-5" />
          </Button>
        ) : (
          <Link href="/">
            <Logo size={28} wordmark={false} />
          </Link>
        )}
        <Progress value={((step + 1) / TOTAL_STEPS) * 100} className="h-1.5 flex-1" />
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          {step === 0 && <WelcomeStep />}
          {step === 1 && (
            <ActivitiesStep
              value={data.activities}
              onChange={(activities) => setData((d) => ({ ...d, activities }))}
            />
          )}
          {step === 2 && (
            <GoalStep value={data.goal} onChange={(goal) => setData((d) => ({ ...d, goal }))} />
          )}
          {step === 3 && (
            <LevelStep value={data.level} onChange={(level) => setData((d) => ({ ...d, level }))} />
          )}
          {step === 4 && (
            <ProfileStep
              value={data.profile}
              onChange={(profile) => setData((d) => ({ ...d, profile }))}
            />
          )}

          <Button
            size="lg"
            className="mt-8 w-full"
            disabled={!canContinue || submitting}
            onClick={handleNext}
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {step === 0 ? "Vamos começar" : step === TOTAL_STEPS - 1 ? "Começar no ZYRON" : "Continuar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
