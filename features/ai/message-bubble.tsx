import { Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn, getInitials } from "@/lib/utils";
import type { ChatMessage } from "@/types/ai";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-2.5", isUser && "flex-row-reverse")}>
      {isUser ? (
        <Avatar className="size-7 shrink-0">
          <AvatarFallback className="bg-muted text-[10px] font-semibold">
            {getInitials(CURRENT_USER.name)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-brand-foreground">
          <Sparkles className="size-3.5" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
          isUser ? "rounded-tr-sm bg-brand text-brand-foreground" : "rounded-tl-sm bg-muted"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
