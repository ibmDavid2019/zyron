"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trophy, Users, MapPin, CalendarDays, UsersRound } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  MOCK_CHALLENGES,
  MOCK_COMMUNITIES,
  MOCK_EVENTS,
  MOCK_ROUTES,
  MOCK_USERS,
} from "@/lib/mock-data";

function matches(query: string, ...values: string[]) {
  if (!query) return true;
  const q = query.toLowerCase();
  return values.some((v) => v.toLowerCase().includes(q));
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const users = useMemo(
    () => MOCK_USERS.filter((u) => matches(query, u.name, u.username)).slice(0, 4),
    [query]
  );
  const communities = useMemo(
    () => MOCK_COMMUNITIES.filter((c) => matches(query, c.name)).slice(0, 4),
    [query]
  );
  const events = useMemo(
    () => MOCK_EVENTS.filter((e) => matches(query, e.name, e.location)).slice(0, 4),
    [query]
  );
  const routes = useMemo(
    () => MOCK_ROUTES.filter((r) => matches(query, r.name, r.city)).slice(0, 4),
    [query]
  );
  const challenges = useMemo(
    () => MOCK_CHALLENGES.filter((c) => matches(query, c.name)).slice(0, 4),
    [query]
  );

  const hasResults =
    users.length + communities.length + events.length + routes.length + challenges.length > 0;

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex"
      >
        <Search className="size-4 shrink-0" />
        Buscar pessoas, rotas, desafios...
        <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:flex">
          Ctrl K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
      >
        <Search className="size-[18px]" />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Busca global"
        description="Pesquise pessoas, comunidades, eventos, rotas e desafios."
      >
        <CommandInput
          placeholder="Buscar pessoas, comunidades, eventos, rotas, desafios..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {!hasResults && <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>}

          {users.length > 0 && (
            <CommandGroup heading="Usuários">
              {users.map((u) => (
                <CommandItem key={u.id} onSelect={() => go(`/profile/${u.username}`)}>
                  <Users />
                  {u.name}
                  <span className="ml-auto text-xs text-muted-foreground">@{u.username}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {communities.length > 0 && (
            <CommandGroup heading="Comunidades">
              {communities.map((c) => (
                <CommandItem key={c.id} onSelect={() => go(`/communities/${c.id}`)}>
                  <UsersRound />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {events.length > 0 && (
            <CommandGroup heading="Eventos">
              {events.map((e) => (
                <CommandItem key={e.id} onSelect={() => go("/events")}>
                  <CalendarDays />
                  {e.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {routes.length > 0 && (
            <CommandGroup heading="Rotas">
              {routes.map((r) => (
                <CommandItem key={r.id} onSelect={() => go("/routes")}>
                  <MapPin />
                  {r.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {challenges.length > 0 && (
            <CommandGroup heading="Desafios">
              {challenges.map((c) => (
                <CommandItem key={c.id} onSelect={() => go(`/challenges/${c.id}`)}>
                  <Trophy />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
