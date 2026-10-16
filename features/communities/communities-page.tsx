"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommunityListCard } from "@/features/communities/community-list-card";
import { CURRENT_USER } from "@/lib/mock-data";
import type { Community } from "@/types/community";
import { generateId } from "@/utils/id";

export function CommunitiesPage({ communities: initial }: { communities: Community[] }) {
  const [communities, setCommunities] = useState(initial);
  const [joined, setJoined] = useState<Set<string>>(new Set(["com1"]));
  const [dialogOpen, setDialogOpen] = useState(false);

  function toggleJoin(id: string) {
    setJoined((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info("Você saiu da comunidade.");
      } else {
        next.add(id);
        toast.success("Você entrou na comunidade!");
      }
      return next;
    });
  }

  const { myCommunities, popular, recommended } = useMemo(() => {
    const mine = communities.filter((c) => joined.has(c.id));
    const others = communities.filter((c) => !joined.has(c.id)).sort((a, b) => b.membersCount - a.membersCount);
    return { myCommunities: mine, popular: others.slice(0, 3), recommended: others.slice(3) };
  }, [communities, joined]);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim() || CURRENT_USER.city || "Brasil";
    if (!name) return;

    const community: Community = {
      id: generateId("com"),
      name,
      description: description || "Uma nova comunidade ZYRON.",
      city,
      membersCount: 1,
      coverVariant: ((communities.length % 3) + 1) as 1 | 2 | 3,
    };

    setCommunities((prev) => [community, ...prev]);
    setJoined((prev) => new Set(prev).add(community.id));
    setDialogOpen(false);
    toast.success("Comunidade criada!");
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Comunidades</h1>
          <p className="text-muted-foreground">Encontre seu grupo de treino ideal.</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Criar comunidade</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreate}>
              <DialogHeader>
                <DialogTitle>Criar comunidade</DialogTitle>
                <DialogDescription>Reúna pessoas com objetivos parecidos com os seus.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="community-name">Nome</Label>
                  <Input id="community-name" name="name" placeholder="Ex: Corredores da Zona Sul" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="community-description">Descrição</Label>
                  <Textarea id="community-description" name="description" placeholder="Sobre o que é essa comunidade?" rows={3} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="community-city">Cidade</Label>
                  <Input id="community-city" name="city" placeholder={CURRENT_USER.city} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <Button type="submit">Criar comunidade</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {myCommunities.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold">Minhas comunidades</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myCommunities.map((c) => (
              <CommunityListCard key={c.id} community={c} joined onToggleJoin={toggleJoin} />
            ))}
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold">Comunidades populares</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((c) => (
              <CommunityListCard key={c.id} community={c} joined={false} onToggleJoin={toggleJoin} />
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-semibold">Comunidades recomendadas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((c) => (
              <CommunityListCard key={c.id} community={c} joined={false} onToggleJoin={toggleJoin} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
