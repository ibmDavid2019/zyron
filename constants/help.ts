import { Compass, Lock, MapPin, Sparkles, User, type LucideIcon } from "lucide-react";

export interface HelpItem {
  question: string;
  answer: string;
}

export interface HelpCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items: HelpItem[];
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "comecar",
    label: "Como começar",
    icon: Compass,
    items: [
      {
        question: "Como crio minha conta no ZYRON?",
        answer: "Toque em \"Criar conta\" na tela inicial, preencha nome, e-mail e senha, e siga o onboarding para configurar suas atividades e objetivos.",
      },
      {
        question: "Como registro minha primeira atividade?",
        answer: "Acesse \"Iniciar atividade\" no menu, toque em \"Gravar atividade\" no mapa e escolha a modalidade (corrida, caminhada ou ciclismo) para começar o rastreamento por GPS em tempo real.",
      },
      {
        question: "Preciso pagar para usar o ZYRON?",
        answer: "Não. O plano Gratuito já inclui rastreamento por GPS, histórico completo, feed e desafios públicos. O plano Pro é opcional e traz recursos avançados da Zyron AI.",
      },
    ],
  },
  {
    id: "rastreamento",
    label: "Rastreamento",
    icon: MapPin,
    items: [
      {
        question: "Como funciona o rastreamento por GPS?",
        answer: "Durante uma atividade ao vivo, o ZYRON registra sua distância, ritmo e velocidade em tempo real. Ao finalizar, você pode revisar e editar os detalhes no resumo da atividade.",
      },
      {
        question: "Posso pausar uma atividade em andamento?",
        answer: "Sim. Na tela de atividade ao vivo, toque em \"Pausar\" a qualquer momento e em \"Retomar\" para continuar de onde parou.",
      },
      {
        question: "Como edito o título e a descrição de uma atividade?",
        answer: "Abra a atividade em \"Minhas atividades\", vá até \"Como foi sua atividade?\" e edite título, descrição, foto e privacidade.",
      },
    ],
  },
  {
    id: "conta",
    label: "Conta",
    icon: User,
    items: [
      {
        question: "Como altero minha senha?",
        answer: "Vá em Configurações → Conta → Senha e siga as instruções para definir uma nova senha.",
      },
      {
        question: "Como edito minhas informações de perfil?",
        answer: "Acesse Configurações → Editar perfil, ou toque em \"Editar perfil\" na sua página de perfil, para atualizar foto, nome, bio e cidade.",
      },
      {
        question: "Como excluo minha conta?",
        answer: "Em Configurações, role até \"Dados da conta\" e toque em \"Excluir conta\". Essa ação é permanente e remove todos os seus dados.",
      },
    ],
  },
  {
    id: "privacidade",
    label: "Privacidade",
    icon: Lock,
    items: [
      {
        question: "Quem pode ver minhas atividades?",
        answer: "Você escolhe a privacidade de cada atividade individualmente: Público, Amigos ou Privado, na tela de resumo da atividade.",
      },
      {
        question: "Como torno meu perfil privado?",
        answer: "Em Configurações → Privacidade, desative a opção \"Perfil público\" para restringir quem pode ver seu perfil e atividades.",
      },
      {
        question: "O ZYRON compartilha minha localização?",
        answer: "Sua localização só é usada para rastrear atividades e é compartilhada publicamente apenas se você ativar essa opção em Configurações → Privacidade.",
      },
    ],
  },
  {
    id: "zyron-ai",
    label: "Zyron AI",
    icon: Sparkles,
    items: [
      {
        question: "O que é a Zyron AI?",
        answer: "É a assistente de treino do ZYRON. Ela analisa suas atividades e sugere treinos personalizados com base no seu histórico e objetivos.",
      },
      {
        question: "A Zyron AI substitui um personal trainer ou médico?",
        answer: "Não. A Zyron AI é uma assistente de treino e não substitui orientação médica ou de um profissional de educação física.",
      },
      {
        question: "Como peço um treino personalizado?",
        answer: "Acesse a página Zyron AI e envie uma mensagem como \"Crie um treino para mim\" ou escolha uma das perguntas rápidas sugeridas.",
      },
    ],
  },
];
