"use client";

import { useState } from "react";
import { CalendarDays, Repeat, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { TrainingLevel, TrainingPlan } from "@/types/training-plan";

export type PlanStatus = "disponivel" | "meu" | "ativo";

interface PlanCardProps {
  plan: TrainingPlan;
  status: PlanStatus;
  onStart: (id: string) => void;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  onEdit: (id: string, partial: Partial<TrainingPlan>) => void;
}

const LEVELS: TrainingLevel[] = ["Iniciante", "Intermediário", "Avançado"];

export function PlanCard({ plan, status, onStart, onActivate, onDeactivate, onEdit }: PlanCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className={cn("rounded-2xl border bg-card p-5", status === "ativo" ? "border-brand" : "border-border")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{plan.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
        </div>
        {status === "ativo" && <Badge className="shrink-0 bg-brand text-brand-foreground">Ativo</Badge>}
        {status === "meu" && (
          <Badge variant="secondary" className="shrink-0">
            Salvo
          </Badge>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Target className="size-3.5" />
          {plan.goal} · {plan.level}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-3.5" />
          {plan.durationWeeks} semanas
        </span>
        <span className="flex items-center gap-1.5">
          <Repeat className="size-3.5" />
          {plan.sessionsPerWeek}x por semana
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => setDetailsOpen(true)}>
          Ver detalhes
        </Button>
        {status === "disponivel" && (
          <Button className="flex-1" onClick={() => onStart(plan.id)}>
            Iniciar plano
          </Button>
        )}
        {status === "meu" && (
          <Button className="flex-1" onClick={() => onActivate(plan.id)}>
            Definir como ativo
          </Button>
        )}
      </div>

      {(status === "meu" || status === "ativo") && (
        <div className="mt-2 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          {status === "ativo" && (
            <Button variant="outline" className="flex-1 text-destructive" onClick={() => onDeactivate(plan.id)}>
              Desativar
            </Button>
          )}
        </div>
      )}

      <PlanDetailsDialog plan={plan} open={detailsOpen} onOpenChange={setDetailsOpen} />
      <EditPlanDialog plan={plan} open={editOpen} onOpenChange={setEditOpen} onSave={onEdit} />
    </div>
  );
}

function PlanDetailsDialog({
  plan,
  open,
  onOpenChange,
}: {
  plan: TrainingPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const totalSessions = plan.durationWeeks * plan.sessionsPerWeek;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{plan.name}</DialogTitle>
          <DialogDescription>{plan.description}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Objetivo</p>
            <p className="font-medium">{plan.goal}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Nível</p>
            <p className="font-medium">{plan.level}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duração</p>
            <p className="font-medium">{plan.durationWeeks} semanas</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Frequência</p>
            <p className="font-medium">{plan.sessionsPerWeek}x por semana</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Total de sessões</p>
            <p className="font-medium">{totalSessions} treinos ao longo do plano</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EditPlanDialog({
  plan,
  open,
  onOpenChange,
  onSave,
}: {
  plan: TrainingPlan;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, partial: Partial<TrainingPlan>) => void;
}) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [goal, setGoal] = useState(plan.goal);
  const [level, setLevel] = useState<TrainingLevel>(plan.level);
  const [durationWeeks, setDurationWeeks] = useState(String(plan.durationWeeks));
  const [sessionsPerWeek, setSessionsPerWeek] = useState(String(plan.sessionsPerWeek));

  function handleSubmit() {
    onSave(plan.id, {
      name: name.trim() || plan.name,
      description: description.trim() || plan.description,
      goal: goal.trim() || plan.goal,
      level,
      durationWeeks: Math.max(1, Number(durationWeeks) || plan.durationWeeks),
      sessionsPerWeek: Math.max(1, Number(sessionsPerWeek) || plan.sessionsPerWeek),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar plano</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor={`plan-name-${plan.id}`}>Nome</Label>
            <Input id={`plan-name-${plan.id}`} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`plan-description-${plan.id}`}>Descrição</Label>
            <Textarea
              id={`plan-description-${plan.id}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={`plan-goal-${plan.id}`}>Objetivo</Label>
            <Input id={`plan-goal-${plan.id}`} value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Nível</Label>
            <Tabs value={level} onValueChange={(v) => setLevel(v as TrainingLevel)}>
              <TabsList>
                {LEVELS.map((l) => (
                  <TabsTrigger key={l} value={l}>
                    {l}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`plan-weeks-${plan.id}`}>Semanas</Label>
              <Input
                id={`plan-weeks-${plan.id}`}
                type="number"
                min={1}
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`plan-sessions-${plan.id}`}>Sessões/semana</Label>
              <Input
                id={`plan-sessions-${plan.id}`}
                type="number"
                min={1}
                value={sessionsPerWeek}
                onChange={(e) => setSessionsPerWeek(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
