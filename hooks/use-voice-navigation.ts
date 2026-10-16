"use client";

import { useEffect, useRef, useState } from "react";
import type { LngLat } from "@/types/map";
import { haversineDistanceKm } from "@/utils/geo";
import type { NavigationStep } from "@/utils/navigation";

const WARN_DISTANCE_M = 150;
const IMMEDIATE_DISTANCE_M = 25;
const ADVANCE_DISTANCE_M = 12;

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  window.speechSynthesis.speak(utterance);
}

interface UseVoiceNavigationOptions {
  steps: NavigationStep[];
  currentPosition: LngLat | null;
  enabled: boolean;
}

/** Announces upcoming turns by voice as the live GPS position closes in on each maneuver — real distance math against real Mapbox Directions steps, spoken via the browser's built-in text-to-speech. */
export function useVoiceNavigation({ steps, currentPosition, enabled }: UseVoiceNavigationOptions) {
  const [stepIndex, setStepIndex] = useState(0);
  const announcedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const timeout = setTimeout(() => setStepIndex(0), 0);
    announcedRef.current = new Set();
    return () => clearTimeout(timeout);
  }, [steps]);

  useEffect(() => {
    if (enabled) return;
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !currentPosition || steps.length === 0) return;
    const step = steps[stepIndex];
    if (!step) return;

    const distanceM = haversineDistanceKm(currentPosition, step.location) * 1000;

    if (distanceM <= IMMEDIATE_DISTANCE_M) {
      const key = `${stepIndex}-now`;
      if (!announcedRef.current.has(key)) {
        announcedRef.current.add(key);
        speak(step.instructionPt);
      }
      if (distanceM <= ADVANCE_DISTANCE_M && stepIndex < steps.length - 1) {
        setTimeout(() => setStepIndex((i) => i + 1), 0);
      }
    } else if (distanceM <= WARN_DISTANCE_M) {
      const key = `${stepIndex}-warn`;
      if (!announcedRef.current.has(key)) {
        announcedRef.current.add(key);
        speak(`Em ${Math.round(distanceM / 10) * 10} metros, ${step.instructionPt}`);
      }
    }
  }, [currentPosition, stepIndex, steps, enabled]);

  return { currentStep: steps[stepIndex] ?? null, stepIndex };
}
