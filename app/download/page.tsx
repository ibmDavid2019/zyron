import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, Settings, Smartphone } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Baixar o ZYRON" };

const APK_DOWNLOAD_URL =
  "https://drive.google.com/uc?export=download&id=1wglL4PynAqaW3RlkPOjeVxmfqPyteYpc";

const STEPS = [
  {
    icon: Download,
    title: "Baixe o arquivo",
    description: "Toque no botão acima para baixar o aplicativo.",
  },
  {
    icon: Settings,
    title: 'Ative "Instalar de fontes desconhecidas"',
    description:
      'Se o Android avisar sobre "fontes desconhecidas" ou "app não verificado", toque em Configurações e permita a instalação. Isso é normal — o ZYRON ainda não está na Google Play.',
  },
  {
    icon: Smartphone,
    title: "Instale e abra o app",
    description: "Volte, toque em Instalar e depois abra o ZYRON.",
  },
  {
    icon: CheckCircle2,
    title: "Crie sua conta usando o mesmo e-mail da compra",
    description:
      "Se você já comprou, o cadastro precisa ser feito com o mesmo e-mail usado no pagamento — é assim que liberamos seu acesso automaticamente. Se ainda não comprou, seus 7 dias de teste grátis começam no cadastro.",
  },
];

export default function DownloadPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <Link href="/" className="mb-6 inline-flex">
        <Logo size={32} />
      </Link>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Baixe o ZYRON para Android</h1>
      <p className="mt-2 text-muted-foreground">
        Siga os passos abaixo para instalar o aplicativo.
      </p>

      <Button size="lg" className="mt-8 w-full" asChild>
        <a href={APK_DOWNLOAD_URL}>
          <Download className="size-4.5" />
          Baixar aplicativo
        </a>
      </Button>

      <ul className="mt-10 w-full space-y-5 text-left">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-muted text-sm font-semibold text-brand">
              {index + 1}
            </span>
            <div>
              <p className="flex items-center gap-1.5 font-semibold">
                <step.icon className="size-4 text-brand" />
                {step.title}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-xs text-muted-foreground">
        Alguma dúvida? Fale com a gente em{" "}
        <a href="mailto:ola@zyron.app" className="underline underline-offset-2">
          ola@zyron.app
        </a>
      </p>
    </div>
  );
}
