import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ROTATION: Record<1 | 2 | 3, string> = {
  1: "rotate-[-8deg]",
  2: "rotate-[6deg]",
  3: "rotate-[16deg]",
};

export function CommunityCover({
  variant,
  className,
}: {
  variant: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <div className={cn("bg-gradient-brand relative overflow-hidden", className)}>
      <svg className="absolute inset-0 h-full w-full opacity-20" viewBox="0 0 300 150" preserveAspectRatio="none">
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 30} x2="300" y2={i * 30} stroke="white" strokeWidth="1" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="150" stroke="white" strokeWidth="1" />
        ))}
      </svg>
      <Users
        className={cn("absolute -bottom-4 -right-4 size-24 text-white/15", ROTATION[variant])}
        strokeWidth={1.5}
      />
    </div>
  );
}
