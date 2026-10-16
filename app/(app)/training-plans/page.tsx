import type { Metadata } from "next";
import { TrainingPlansPage } from "@/features/training-plans/training-plans-page";
import { MOCK_TRAINING_PLANS } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Planos de treino" };

export default function TrainingPlans() {
  return <TrainingPlansPage plans={MOCK_TRAINING_PLANS} />;
}
