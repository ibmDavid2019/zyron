import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PwaInstallBanner } from "@/components/shared/pwa-install-banner";
import { AdMobBanner } from "@/components/shared/admob-banner";
import { AdMobInterstitial } from "@/components/shared/admob-interstitial";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      {/* Extra bottom padding reserves room for the native AdMob banner that
          floats above the mobile nav on the Android app — harmless unused
          whitespace on the plain web build, where no banner is shown. */}
      <main className="pb-36 lg:pb-8 lg:pl-64" style={{ paddingTop: "calc(4rem + env(safe-area-inset-top))" }}>
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
      <AdMobBanner />
      <AdMobInterstitial />
      <MobileNav />
      <PwaInstallBanner />
    </div>
  );
}
