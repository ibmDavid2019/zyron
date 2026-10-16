export interface OnboardingProfile {
  name: string;
  city: string;
  bio: string;
  avatarUrl: string | null;
}

export interface OnboardingData {
  activities: string[];
  goal: string | null;
  level: string | null;
  profile: OnboardingProfile;
}
