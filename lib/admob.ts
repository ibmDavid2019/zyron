import { Capacitor, type PluginListenerHandle } from "@capacitor/core";
import { AdMob, BannerAdPosition, BannerAdSize, RewardAdPluginEvents } from "@capacitor-community/admob";

// Google's official sample ad unit IDs — always serve clearly-labeled test
// ads regardless of account/billing setup, so they're the safe default
// until real production IDs are set via env vars (see .env.local.example).
const TEST_BANNER_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";
const TEST_INTERSTITIAL_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";
const TEST_REWARDED_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

const BANNER_UNIT_ID = process.env.NEXT_PUBLIC_ADMOB_BANNER_UNIT_ID || TEST_BANNER_UNIT_ID;
const INTERSTITIAL_UNIT_ID = process.env.NEXT_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID || TEST_INTERSTITIAL_UNIT_ID;
const REWARDED_UNIT_ID = process.env.NEXT_PUBLIC_ADMOB_REWARDED_UNIT_ID || TEST_REWARDED_UNIT_ID;
// Only "testing" (adds the on-ad "Test Ad" badge, exempt from real-ad
// policy) when no real unit ID was configured — a real ID should always
// serve real ads, even while this app is still in development.
const IS_TESTING = !process.env.NEXT_PUBLIC_ADMOB_BANNER_UNIT_ID;

let initialized = false;

/** No-op outside the native Android/iOS app (e.g. the plain web build) — AdMob only works inside a real app, not a browser tab. */
export function adsAvailable(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform();
}

/** Call once near app startup. Safe to call repeatedly — only initializes the SDK the first time. */
export async function initAdMob(): Promise<void> {
  if (!adsAvailable() || initialized) return;
  initialized = true;
  await AdMob.initialize({ initializeForTesting: IS_TESTING });
}

// Keeps the banner floating just above the app's fixed bottom mobile nav
// (components/layout/mobile-nav.tsx, h-16 = 64px) instead of covering it —
// the native banner is an overlay on top of the WebView, entirely outside
// CSS layout, so this has to be a flat pixel guess rather than something
// that can read the nav's actual rendered height.
const BOTTOM_NAV_MARGIN = 64;

export async function showBanner(): Promise<void> {
  if (!adsAvailable()) return;
  await initAdMob();
  await AdMob.showBanner({
    adId: BANNER_UNIT_ID,
    adSize: BannerAdSize.ADAPTIVE_BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
    margin: BOTTOM_NAV_MARGIN,
    isTesting: IS_TESTING,
  });
}

export async function hideBanner(): Promise<void> {
  if (!adsAvailable()) return;
  await AdMob.removeBanner();
}

/**
 * Prepares and shows a full-screen interstitial, resolving true once it was
 * actually shown (false if it failed to load/show). Unlike the rewarded
 * promise below, `showInterstitial()` resolves right after presenting the
 * ad rather than waiting for it to be dismissed, so there's nothing to
 * race against a Dismissed event here.
 */
export async function showInterstitial(): Promise<boolean> {
  if (!adsAvailable()) return false;
  await initAdMob();

  try {
    await AdMob.prepareInterstitial({ adId: INTERSTITIAL_UNIT_ID, isTesting: IS_TESTING });
    await AdMob.showInterstitial();
    return true;
  } catch {
    return false;
  }
}

/**
 * Shows a rewarded video ad and resolves once the user either earns the
 * reward (true) or dismisses it early / it fails to load (false).
 *
 * `AdMob.showRewardVideoAd()`'s own promise only ever resolves when the
 * reward is actually granted — it never resolves or rejects if the user
 * just closes the ad early — so completion is driven by the Rewarded /
 * Dismissed events instead, with the raw promise only used to catch a
 * load/show failure.
 */
export async function showRewardedAd(): Promise<boolean> {
  if (!adsAvailable()) return false;
  await initAdMob();

  try {
    await AdMob.prepareRewardVideoAd({ adId: REWARDED_UNIT_ID, isTesting: IS_TESTING });
  } catch {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    let settled = false;
    let rewardedHandle: PluginListenerHandle | null = null;
    let dismissedHandle: PluginListenerHandle | null = null;

    function finish(result: boolean) {
      if (settled) return;
      settled = true;
      rewardedHandle?.remove();
      dismissedHandle?.remove();
      resolve(result);
    }

    AdMob.addListener(RewardAdPluginEvents.Rewarded, () => finish(true)).then((handle) => {
      rewardedHandle = handle;
    });
    AdMob.addListener(RewardAdPluginEvents.Dismissed, () => finish(false)).then((handle) => {
      dismissedHandle = handle;
    });

    AdMob.showRewardVideoAd().catch(() => finish(false));
  });
}
