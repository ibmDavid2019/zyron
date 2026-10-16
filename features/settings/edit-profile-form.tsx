"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CURRENT_USER } from "@/lib/mock-data";
import { getInitials } from "@/lib/utils";
import { getProfileOverrides, saveProfileOverrides } from "@/utils/local-store";

export function EditProfileForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [name, setName] = useState(CURRENT_USER.name);
  const [username, setUsername] = useState(CURRENT_USER.username);
  const [bio, setBio] = useState(CURRENT_USER.bio ?? "");
  const [city, setCity] = useState(CURRENT_USER.city ?? "");
  const [saving, setSaving] = useState(false);

  // Overrides live in localStorage (no real backend yet) — apply them once
  // mounted so a previous edit still shows up after a reload.
  useEffect(() => {
    const timeout = setTimeout(() => {
      const overrides = getProfileOverrides();
      if (overrides.name) setName(overrides.name);
      if (overrides.username) setUsername(overrides.username);
      if (overrides.bio) setBio(overrides.bio);
      if (overrides.city) setCity(overrides.city);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  // TODO(supabase): persist profile updates to the users table instead.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => {
      saveProfileOverrides({ name, username, bio, city });
      setSaving(false);
      toast.success("Perfil atualizado!");
    }, 700);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Meu perfil
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Editar perfil</h1>
        <p className="text-muted-foreground">Atualize suas informações públicas.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-5">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative"
            aria-label="Alterar foto de perfil"
          >
            <Avatar className="size-20 border border-border">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
              <AvatarFallback className="bg-brand-muted text-lg font-semibold text-brand">
                {getInitials(name || CURRENT_USER.name)}
              </AvatarFallback>
            </Avatar>
            <span className="bg-brand text-brand-foreground absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full border-2 border-background transition-transform group-hover:scale-105">
              <Camera className="size-3.5" />
            </span>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-name">Nome</Label>
          <Input id="edit-name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-username">Nome de usuário</Label>
          <Input id="edit-username" name="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-bio">Bio</Label>
          <Textarea id="edit-bio" name="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-city">Cidade</Label>
          <Input id="edit-city" name="city" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>

        <Button type="submit" className="w-full" disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
}
