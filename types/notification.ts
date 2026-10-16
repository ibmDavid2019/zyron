export type NotificationType = "curtida" | "comentario" | "seguidor" | "convite" | "desafio" | "conquista";

export interface AppNotification {
  id: string;
  type: NotificationType;
  actorName: string;
  message: string;
  createdAt: string;
  read: boolean;
  href: string;
}
