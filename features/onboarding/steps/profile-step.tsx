import { useRef, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/lib/utils";
import type { OnboardingProfile } from "@/types/onboarding";

interface ProfileStepProps {
  value: OnboardingProfile;
  onChange: (value: OnboardingProfile) => void;
}

export function ProfileStep({ value, onChange }: ProfileStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onChange({ ...value, avatarUrl: reader.result as string });
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Configure seu perfil</h1>
        <p className="text-sm text-muted-foreground">
          Assim a comunidade ZYRON vai te reconhecer.
        </p>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative"
          aria-label="Adicionar foto de perfil"
        >
          <Avatar className="size-20 border border-border">
            {value.avatarUrl && <AvatarImage src={value.avatarUrl} alt="" />}
            <AvatarFallback className="bg-brand-muted text-lg font-semibold text-brand">
              {value.name ? getInitials(value.name) : <Camera className="size-6" />}
            </AvatarFallback>
          </Avatar>
          <span className="bg-brand text-brand-foreground absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background transition-transform group-hover:scale-105">
            <Camera className="size-3.5" />
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="onboarding-name">Nome</Label>
          <Input
            id="onboarding-name"
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            placeholder="Seu nome"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="onboarding-city">Cidade</Label>
          <Input
            id="onboarding-city"
            value={value.city}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            placeholder="São Paulo, BR"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="onboarding-bio">Bio</Label>
          <Textarea
            id="onboarding-bio"
            value={value.bio}
            onChange={(e) => onChange({ ...value, bio: e.target.value })}
            placeholder="Conte um pouco sobre seus objetivos"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
