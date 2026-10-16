import type { Metadata } from "next";
import { Suspense } from "react";
import { MapPage } from "@/features/map/map-page";

export const metadata: Metadata = { title: "Mapa" };

export default function Map() {
  return (
    <Suspense>
      <MapPage />
    </Suspense>
  );
}
