import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { login, emitAuthChange } from "@/lib/auth";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const u = login(username.trim(), password);
    setLoading(false);
    if (!u) {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      return;
    }
    emitAuthChange();
    setLocation(u.role === "data-entry" ? "/data-entry" : "/dashboard");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* Brand pane */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 -right-32 size-[500px] rounded-full blur-3xl opacity-40"
               style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 60%)" }} />
          <div className="absolute -bottom-32 -left-32 size-[480px] rounded-full blur-3xl opacity-30"
               style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent 60%)" }} />
          <div className="absolute inset-0 bg-mesh" />
        </div>
        <Logo size={44} />
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-xs font-semibold tracking-widest text-primary mb-3">منصة إدارة الأعمال المتكاملة</div>
            <h1 className="text-5xl xl:text-6xl font-bold leading-[1.1] tracking-tight mb-5">
              مركز قيادة <br /> <span className="gradient-text">شركتك بأكملها</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-lg leading-relaxed">
              من المخازن إلى الحسابات، ومن الموارد البشرية إلى لوحات التحكم التنفيذية —
              كل ما تحتاجه لإدارة منشأتك في مكان واحد، بتصميم عربي احترافي.
            </p>
          </motion.div>
          <div className="grid grid-cols-3 gap-3 mt-10 max-w-lg">
            {[
              { k: "المخازن", v: "إدارة كاملة" },
              { k: "الحسابات", v: "قيود ودفاتر" },
              { k: "الموارد البشرية", v: "حضور ورواتب" },
            ].map((s) => (
              <div key={s.k} className="glass rounded-xl p-4">
                <div className="text-xs text-muted-foreground">{s.k}</div>
                <div className="text-sm font-semibold mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          الإصدار 1.0 — تطوير Orbit Systems
        </div>
      </div>

      {/* Form pane */}
      <div className="relative flex items-center justify-center p-6 sm:p-12">
        <div className="absolute inset-0 -z-10 lg:hidden">
          <div className="absolute inset-0 bg-aurora">
            <div className="bg-aurora-orb" />
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <Logo size={40} />
          </div>
          <div className="glass-strong rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
              <Shield className="size-3.5" />
              تسجيل الدخول الآمن
            </div>
            <h2 className="text-3xl font-bold mb-1">مرحبًا بعودتك</h2>
            <p className="text-sm text-muted-foreground mb-7">
              ادخل بياناتك للوصول إلى لوحة تحكم النظام
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold">اسم المستخدم</Label>
                <Input
                  id="username" value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin" autoComplete="username"
                  className="h-11 bg-background/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">كلمة المرور</Label>
                <div className="relative">
                  <Input
                    id="password" value={password}
                    type={showPwd ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" autoComplete="current-password"
                    className="h-11 bg-background/40 pl-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold">
                {loading ? <Loader2 className="size-4 animate-spin ml-2" /> : <ArrowLeft className="size-4 ml-2" />}
                دخول إلى النظام
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-border/40">
              <div className="text-[11px] font-semibold text-muted-foreground mb-2">حسابات تجريبية للاختبار:</div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  ["admin", "admin123", "مدير"],
                  ["warehouse", "warehouse123", "مخازن"],
                  ["finance", "finance123", "حسابات"],
                  ["hr", "hr123", "موارد بشرية"],
                ].map(([u, p, r]) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => { setUsername(u); setPassword(p); }}
                    className="glass-subtle rounded-md px-2 py-1.5 text-right hover-elevate"
                  >
                    <div className="font-mono text-[10px] text-primary">{u}</div>
                    <div className="text-[9px] text-muted-foreground">{r}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
