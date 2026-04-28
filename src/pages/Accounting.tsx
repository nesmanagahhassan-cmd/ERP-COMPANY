import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { store } from "@/lib/storage";
import { fmtCurrency } from "@/lib/format";
import { TrendingUp, TrendingDown, Wallet, Scale } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { Link } from "wouter";
import { Receipt, BookOpen, FileBarChart } from "lucide-react";

export default function Accounting() {
  const accounts = store.accounts.list();
  const journal = store.journal.list();

  const revenue = accounts.filter((a) => a.type === "revenue").reduce((s, a) => s + a.balance, 0);
  const expenses = accounts.filter((a) => a.type === "expense").reduce((s, a) => s + a.balance, 0);
  const receivables = accounts.find((a) => a.code === "1030")?.balance || 0;
  const payables = accounts.find((a) => a.code === "2010")?.balance || 0;

  const monthlyData = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];
    return months.map((m, i) => ({
      month: m,
      الإيرادات: 380000 + i * 32000 + Math.round(Math.random() * 50000),
      المصروفات: 220000 + i * 18000 + Math.round(Math.random() * 28000),
    }));
  }, []);

  return (
    <AppShell
      title="الحسابات"
      subtitle="نظرة شاملة على الوضع المالي للشركة"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الحسابات" }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="إجمالي الإيرادات" value={fmtCurrency(revenue)} icon={TrendingUp} accent="primary" delta={{ value: "+14.2%", positive: true }} />
        <StatCard label="إجمالي المصروفات" value={fmtCurrency(expenses)} icon={TrendingDown} accent="muted" delta={{ value: "+6.8%", positive: false }} />
        <StatCard label="صافي الربح" value={fmtCurrency(revenue - expenses)} icon={Wallet} accent="accent" delta={{ value: "+22.4%", positive: true }} />
        <StatCard label="الذمم المدينة / الدائنة" value={fmtCurrency(receivables - payables)} hint={`مدين: ${fmtCurrency(receivables)} • دائن: ${fmtCurrency(payables)}`} icon={Scale} accent="primary" />
      </div>

      <div className="glass rounded-2xl p-5 mb-6">
        <div className="mb-4">
          <h3 className="text-base font-bold">حركة الإيرادات والمصروفات</h3>
          <p className="text-xs text-muted-foreground">آخر 6 أشهر</p>
        </div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={monthlyData}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} reversed />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} orientation="right" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="الإيرادات" fill="hsl(36 80% 60%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="المصروفات" fill="hsl(175 60% 45%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/accounting/journal", icon: Receipt, title: "قيود اليومية", desc: "إدخال وعرض القيود المحاسبية" },
          { href: "/accounting/ledger", icon: BookOpen, title: "دفتر الأستاذ", desc: "حركة الحسابات والأرصدة" },
          { href: "/accounting/reports", icon: FileBarChart, title: "التقارير المالية", desc: "ميزانية وأرباح وخسائر" },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href}>
              <a className="glass rounded-2xl p-6 block hover-elevate group transition-all">
                <div className="size-12 rounded-xl bg-primary/15 grid place-items-center text-primary mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-bold mb-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </a>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
