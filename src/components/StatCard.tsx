import { ReactNode } from "react";
import { ArrowDown, ArrowUp, type LucideIcon } from "lucide-react";

export function StatCard({
  label, value, hint, icon: Icon, delta, accent = "primary",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
  delta?: { value: string; positive?: boolean };
  accent?: "primary" | "accent" | "destructive" | "muted";
}) {
  const ringMap: Record<string, string> = {
    primary: "from-primary/30 to-primary/0 text-primary",
    accent: "from-accent/30 to-accent/0 text-accent",
    destructive: "from-destructive/30 to-destructive/0 text-destructive",
    muted: "from-muted-foreground/20 to-muted-foreground/0 text-muted-foreground",
  };
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden hover-elevate">
      <div className={`absolute -top-8 -left-8 size-32 rounded-full blur-3xl bg-gradient-radial pointer-events-none opacity-60 bg-gradient-to-br ${ringMap[accent]}`} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          {Icon && (
            <div className="size-9 rounded-xl glass-subtle grid place-items-center">
              <Icon className={`size-4 ${ringMap[accent].split(" ").pop()}`} />
            </div>
          )}
        </div>
        <div className="text-2xl font-bold tabular-nums tracking-tight">{value}</div>
        <div className="flex items-center justify-between mt-2">
          {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
          {delta && (
            <span className={`text-xs font-semibold inline-flex items-center gap-1 ${
              delta.positive ? "text-emerald-400" : "text-rose-400"
            }`}>
              {delta.positive ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {delta.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
