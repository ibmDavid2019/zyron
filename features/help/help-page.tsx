"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { HELP_CATEGORIES } from "@/constants/help";

export function HelpPage() {
  const [query, setQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return HELP_CATEGORIES;
    const q = query.toLowerCase();
    return HELP_CATEGORIES.map((category) => ({
      ...category,
      items: category.items.filter(
        (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
      ),
    })).filter((category) => category.items.length > 0);
  }, [query]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Central de ajuda</h1>
        <p className="mt-2 text-muted-foreground">Como podemos ajudar?</p>
        <div className="relative mx-auto mt-5 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar dúvidas..."
            className="pl-9"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Nenhum resultado para &quot;{query}&quot;.
        </p>
      ) : (
        <div className="space-y-8">
          {filteredCategories.map((category) => (
            <section key={category.id} className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold">
                <category.icon className="size-4 text-brand" />
                {category.label}
              </h2>
              <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-2">
                {category.items.map((item, i) => (
                  <AccordionItem key={i} value={`${category.id}-${i}`}>
                    <AccordionTrigger className="text-left text-sm font-medium">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
