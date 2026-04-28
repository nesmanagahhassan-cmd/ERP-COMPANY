import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { store } from "@/lib/storage";
import { fmtCurrency, fmtNumber } from "@/lib/format";
import { Users as UsersIcon, UserCheck, Plane, Wallet } from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from "recharts";
import { Link } from "wouter";
import { UserCog, CalendarClock, FileBarChart } from "lucide-react";

export default function HR() {
  const employees = store.employees.list();
  const leaves = store.leaves.list();
  const payroll = store.payroll.list();

  const active = employees.filter((e) => e.status === "active").length;
  const onLeave = leaves.filter((l) => l.status === "approved").length;
  const totalPayroll = payroll.reduce((s, p) => s + (p.baseSalary + p.allowances - p.deductions), 0);

  const byDept = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of employees) {
      if (e.status === "active") map[e.department] = (map[e.department] || 0) + 1;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const COLORS = [
    "hsl(36 80% 60%)", "hsl(175 60% 45%)", "hsl(270 55% 65%)",
    "hsl(195 70% 55%)", "hsl(340 65% 60%)", "hsl(120 50% 55%)",
  ];

  return (
    <AppShell
      title="الموارد البشرية"
      subtitle="إدارة شؤون الموظفين والحضور والمرتبات"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الموارد البشرية" }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="إجمالي الموظفين" value={fmtNumber(employees.length)} icon={UsersIcon} accent="primary" />
        <StatCard label="موظفون نشطون" value={fmtNumber(active)} icon={UserCheck} accent="accent" />
        <StatCard label="إجازات معتمدة" value={fmtNumber(onLeave)} icon={Plane} accent="muted" />
        <StatCard label="إجمالي المرتبات الشهرية" value={fmtCurrency(totalPayroll)} icon={Wallet} accent="primary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5 xl:col-span-1">
          <h3 className="text-base font-bold mb-1">التوزيع حسب القسم</h3>
          <p className="text-xs text-muted-foreground mb-4">الموظفون النشطون</p>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byDept} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {byDept.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 xl:col-span-2">
          <h3 className="text-base font-bold mb-1">آخر الموظفين المضافين</h3>
          <p className="text-xs text-muted-foreground mb-4">أحدث 5 موظفين</p>
          <div className="space-y-2">
            {employees.slice(0, 5).map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-subtle hover-elevate">
                <div className="size-10 rounded-lg bg-primary/15 grid place-items-center text-primary font-bold text-sm">
                  {e.name.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{e.name}</div>
                  <div className="text-xs text-muted-foreground">{e.position} • {e.department}</div>
                </div>
                <div className="text-xs tabular-nums font-bold">{fmtCurrency(e.salary)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/hr/employees", icon: UserCog, title: "بيانات الموظفين", desc: "ملفات وبيانات الموظفين" },
          { href: "/hr/attendance", icon: CalendarClock, title: "الحضور والانصراف", desc: "تسجيل ساعات العمل" },
          { href: "/hr/payroll", icon: FileBarChart, title: "كشوف المرتبات", desc: "حساب الرواتب وطباعتها" },
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
