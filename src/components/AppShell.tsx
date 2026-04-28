import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Boxes, Calculator, Users, Settings, FileBarChart,
  ChevronDown, Bell, Search, LogOut, Menu, Moon, Sun, FilePlus, ClipboardList,
  ArrowDownUp, BookOpen, Receipt, UserCog, CalendarClock, Plane, Wallet,
  Shield, Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentUser, ROLE_LABEL, canAccess, logout, emitAuthChange } from "@/lib/auth";
import { Logo } from "./Logo";
import { store } from "@/lib/storage";
import { fmtDate } from "@/lib/format";

type NavItem = {
  module: string;
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  children?: { label: string; href: string; icon: typeof LayoutDashboard }[];
};

const NAV: NavItem[] = [
  { module: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard, href: "/dashboard" },
  { module: "data-entry", label: "إدخال بيانات سريع", icon: FilePlus, href: "/data-entry" },
  {
    module: "inventory", label: "المخازن", icon: Boxes,
    children: [
      { label: "الأصناف", href: "/inventory", icon: Boxes },
      { label: "الوارد والصادر", href: "/inventory/transactions", icon: ArrowDownUp },
      { label: "أذون الصرف", href: "/inventory/dispatch", icon: ClipboardList },
    ],
  },
  {
    module: "accounting", label: "الحسابات", icon: Calculator,
    children: [
      { label: "نظرة عامة", href: "/accounting", icon: Calculator },
      { label: "قيود اليومية", href: "/accounting/journal", icon: Receipt },
      { label: "دفتر الأستاذ", href: "/accounting/ledger", icon: BookOpen },
      { label: "التقارير المالية", href: "/accounting/reports", icon: FileBarChart },
    ],
  },
  {
    module: "hr", label: "الموارد البشرية", icon: Users,
    children: [
      { label: "نظرة عامة", href: "/hr", icon: Users },
      { label: "الموظفون", href: "/hr/employees", icon: UserCog },
      { label: "الحضور والانصراف", href: "/hr/attendance", icon: CalendarClock },
      { label: "الإجازات", href: "/hr/leaves", icon: Plane },
      { label: "المرتبات", href: "/hr/payroll", icon: Wallet },
    ],
  },
  { module: "users", label: "المستخدمون", icon: Shield, href: "/users" },
  { module: "reports", label: "التقارير", icon: FileBarChart, href: "/reports" },
  { module: "settings", label: "الإعدادات", icon: Settings, href: "/settings" },
];

export function AppShell({ children, title, subtitle, breadcrumbs, actions }: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  const user = useCurrentUser();
  const [, setLocation] = useLocation();
  const [theme, setTheme] = useState<"dark" | "light">(() => store.theme.get());
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("dark", theme === "dark");
    store.theme.set(theme);
  }, [theme]);

  const notifications = store.notifications.list();
  const unread = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    logout();
    emitAuthChange();
    setLocation("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex flex-col w-72 shrink-0 glass border-l no-print sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass-strong border-b no-print">
          <div className="flex items-center gap-3 px-4 lg:px-6 py-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-72 glass">
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            <div className="lg:hidden">
              <Logo size={28} />
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في النظام..."
                  className="pr-10 bg-background/30 border-border/40"
                />
              </div>
            </div>

            <div className="flex-1 md:hidden" />

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="size-4" />
                    {unread > 0 && (
                      <span className="absolute top-1 left-1 size-2 rounded-full bg-destructive" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 glass-strong">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>الإشعارات</span>
                    <Badge variant="secondary">{unread} جديدة</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="max-h-[360px]">
                    {notifications.length === 0 && (
                      <div className="px-3 py-6 text-sm text-muted-foreground text-center">لا توجد إشعارات</div>
                    )}
                    {notifications.map((n) => (
                      <div key={n.id} className="px-3 py-2.5 border-b border-border/40 last:border-0 hover-elevate">
                        <div className="flex items-start gap-2">
                          <span className={`mt-1.5 size-2 rounded-full shrink-0 ${
                            n.type === "warning" ? "bg-amber-400"
                            : n.type === "success" ? "bg-emerald-400"
                            : "bg-sky-400"
                          }`} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{n.title}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">{fmtDate(n.date)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">
                        {user?.name?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-right leading-tight">
                      <div className="text-xs font-semibold">{user?.name}</div>
                      <div className="text-[10px] text-muted-foreground">{user ? ROLE_LABEL[user.role] : ""}</div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong">
                  <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/settings")}>
                    <Settings className="size-4 ml-2" />
                    الإعدادات
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="size-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {(breadcrumbs || title) && (
            <div className="px-4 lg:px-6 pb-3 flex items-center justify-between gap-3 flex-wrap">
              <div>
                {breadcrumbs && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    {breadcrumbs.map((b, i) => (
                      <span key={i} className="flex items-center gap-2">
                        {b.href ? <Link href={b.href} className="hover:text-foreground">{b.label}</Link> : <span>{b.label}</span>}
                        {i < breadcrumbs.length - 1 && <span className="opacity-40">/</span>}
                      </span>
                    ))}
                  </div>
                )}
                {title && (
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
                  </div>
                )}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
          )}
        </header>

        <main className="flex-1 px-4 lg:px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={typeof window !== "undefined" ? window.location.pathname : "page"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="px-4 lg:px-6 py-4 text-xs text-muted-foreground border-t border-border/40 no-print flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3" />
            أوربت ERP — نسخة تجريبية
          </div>
          <div>© {new Date().getFullYear()} Orbit Systems. جميع الحقوق محفوظة.</div>
        </footer>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useCurrentUser();
  const [location] = useLocation();
  const visibleNav = useMemo(
    () => NAV.filter((item) => canAccess(user?.role, item.module)),
    [user?.role]
  );

  const initiallyOpen: Record<string, boolean> = {};
  visibleNav.forEach((item) => {
    if (item.children?.some((c) => location.startsWith(c.href))) {
      initiallyOpen[item.module] = true;
    }
  });
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(initiallyOpen);

  const toggle = (mod: string) =>
    setOpenGroups((s) => ({ ...s, [mod]: !s[mod] }));

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-5 border-b border-border/40">
        <Logo size={36} />
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.href && (location === item.href || (item.href !== "/" && location.startsWith(item.href)));
            if (!item.children) {
              return (
                <Link key={item.module} href={item.href!} onClick={onNavigate}>
                  <a className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover-elevate ${
                    isActive ? "bg-primary/15 text-primary" : "text-foreground/85"
                  }`}>
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </a>
                </Link>
              );
            }
            const groupOpen = openGroups[item.module];
            const childActive = item.children.some((c) => location === c.href || (c.href !== "/" && location.startsWith(c.href)));
            return (
              <div key={item.module}>
                <button
                  onClick={() => toggle(item.module)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover-elevate ${
                    childActive ? "text-primary" : "text-foreground/85"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 text-right">{item.label}</span>
                  <ChevronDown className={`size-3.5 transition-transform ${groupOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {groupOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <div className="mr-7 mt-1 space-y-0.5 border-r border-border/40 pr-3">
                        {item.children.map((c) => {
                          const ChildIcon = c.icon;
                          const isCActive = location === c.href || (c.href !== "/" && location === c.href);
                          return (
                            <Link key={c.href} href={c.href} onClick={onNavigate}>
                              <a className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-all hover-elevate ${
                                isCActive ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70"
                              }`}>
                                <ChildIcon className="size-3.5 shrink-0" />
                                <span>{c.label}</span>
                              </a>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-border/40">
        <div className="glass-subtle rounded-xl p-3 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">الإصدار</div>
          <div className="text-sm font-bold gradient-text">Orbit ERP 1.0</div>
        </div>
      </div>
    </div>
  );
}
