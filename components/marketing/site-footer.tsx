import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { APP_SLOGAN } from "@/constants/brand";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Produto",
    links: [
      { label: "Recursos", href: "#recursos" },
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Zyron AI", href: "#zyron-ai" },
      { label: "Preços", href: "#precos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#top" },
      { label: "Contato", href: "mailto:ola@zyron.app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidade", href: "/privacy" },
      { label: "Termos", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
  {
    title: "Suporte",
    links: [{ label: "Central de ajuda", href: "/help" }],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="space-y-3">
            <Link href="/" aria-label="ZYRON — página inicial">
              <Logo size={28} />
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">{APP_SLOGAN}</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <p className="text-sm font-semibold text-foreground">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} ZYRON. Todos os direitos reservados.</p>
          <p>Feito para quem se move.</p>
        </div>
      </div>
    </footer>
  );
}
