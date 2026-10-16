import type { Metadata } from "next";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";

export const metadata: Metadata = { title: "Configurar perfil" };

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
