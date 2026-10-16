import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const APK_LINK = "https://drive.google.com/file/d/1wglL4PynAqaW3RlkPOjeVxmfqPyteYpc/view?usp=sharing";

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="scroll-mt-16 bg-muted/40 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Como funciona</h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Baixe e instale o ZYRON no seu Android em poucos passos.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Como instalar o ZYRON no seu Android</h3>

          <Button className="mt-4 w-full sm:w-auto" asChild>
            <a href={APK_LINK} target="_blank" rel="noopener noreferrer">
              <Download className="size-4.5" />
              Baixar Aplicativo
            </a>
          </Button>

          <ol className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">1.</span> Toque no botão acima para
              baixar o arquivo (app-release.apk).
            </li>
            <li>
              <span className="font-medium text-foreground">2.</span> Se aparecer um aviso
              &quot;Instalar de fontes desconhecidas&quot; ou &quot;App não verificado&quot;,
              toque em &quot;Configurações&quot; e ative a permissão para essa instalação — é
              normal, o ZYRON não está na Google Play ainda.
            </li>
            <li>
              <span className="font-medium text-foreground">3.</span> Volte e toque em
              &quot;Instalar&quot;.
            </li>
            <li>
              <span className="font-medium text-foreground">4.</span> Abra o app e crie sua
              conta — seus 7 dias grátis começam na hora.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
