import Script from "next/script";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { AiSection } from "@/components/marketing/ai-section";
import { CommunitySection } from "@/components/marketing/community-section";
import { GamificationSection } from "@/components/marketing/gamification-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FinalCtaSection } from "@/components/marketing/final-cta-section";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      {/* Meta Pixel — sales page only, tracks visits/conversions for ad campaigns. */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '37959654103649630');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- required literal Meta Pixel tracking image, not an optimizable local/remote asset */}
        <img
          height={1}
          width={1}
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=37959654103649630&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AiSection />
        <CommunitySection />
        <GamificationSection />
        <PricingSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
