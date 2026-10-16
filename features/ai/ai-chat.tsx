"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { History, Plus, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MessageBubble } from "@/features/ai/message-bubble";
import { QUICK_QUESTIONS, getAssistantReply } from "@/features/ai/mock-responses";
import { MOCK_CONVERSATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { ChatMessage, Conversation } from "@/types/ai";
import { formatRelativeTime } from "@/utils/format";
import { generateId } from "@/utils/id";

function newConversation(): Conversation {
  return {
    id: generateId("conv"),
    title: "Nova conversa",
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: generateId("m"),
        role: "assistant",
        content: "Olá! Sou a Zyron AI, sua treinadora inteligente. Como posso ajudar no seu treino hoje?",
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

export function AiChat() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState(MOCK_CONVERSATIONS[0].id);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, typing]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMessage: ChatMessage = {
      id: generateId("m"),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
              ...c,
              title: c.messages.length <= 1 ? trimmed.slice(0, 40) : c.title,
              messages: [...c.messages, userMessage],
              updatedAt: userMessage.createdAt,
            }
          : c
      )
    );
    setInput("");
    setTyping(true);

    // TODO(ai-backend): replace with a real Zyron AI completion call.
    setTimeout(() => {
      const result = getAssistantReply(trimmed);
      const reply: ChatMessage = {
        id: generateId("m"),
        role: "assistant",
        content: result.reply,
        createdAt: new Date().toISOString(),
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, reply] } : c))
      );
      setTyping(false);
      if (result.activatedPlan) {
        toast.success(`Plano "${result.activatedPlan.name}" ativado!`);
      }
      if (result.weeklyPlanChanged) {
        toast.success("Treino adicionado ao seu plano semanal!");
      }
    }, 900);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage(input);
  }

  function handleNewConversation() {
    const conv = newConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setHistoryOpen(false);
  }

  return (
    <div className="flex h-[70vh] min-h-[480px] flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border p-3">
        <p className="truncate px-2 text-sm font-medium text-muted-foreground">{active.title}</p>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="ghost" size="icon" onClick={handleNewConversation} aria-label="Nova conversa">
            <Plus className="size-4" />
          </Button>
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Histórico de conversas">
                <History className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>Histórico de conversas</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {conversations.map((conv) => (
                  <SheetClose asChild key={conv.id}>
                    <button
                      onClick={() => setActiveId(conv.id)}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted",
                        conv.id === active.id && "bg-brand-muted text-brand"
                      )}
                    >
                      <p className="truncate font-medium">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(new Date(conv.updatedAt))}
                      </p>
                    </button>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {active.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {typing && (
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-brand-foreground">
              <Sparkles className="size-3.5" />
            </span>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {active.messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 border-t border-border p-3">
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo sobre seus treinos..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || typing} aria-label="Enviar">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
