import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { store } from "@/lib/storage";
import { fmtCurrency, fmtNumber } from "@/lib/format";
import {
  Boxes, Wallet, Users as UsersIcon, ClipboardList, TrendingUp, AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { useMemo } from "react";

export default function Dashboard() {
  const products = store.products.list();
  const employees = store.employees.list();
  const journal = store.journal.list();
  const permits = store.permits.list();

  const inventoryValue = useMemo(
    () => products.reduce((s, p) => s + p.price * p.quantity, 0),
    [products]
  );
  const lowStock = useMemo(
    () => products.filter((p) => p.quantity <= p.minQuantity).length,
    [products]
  );
  const activeEmployees = employees.filter((e) => e.status === "active").length;
  const activeOrders = permits.filter((p) => p.status !== "issued").length;

  const revenue = useMemo(() => {
    return journal.reduce((s, e) => {
      const r = e.lines.reduce((a, l) => a + (l.account.startsWith("4") ? l.credit - l.debit : 0), 0);
      return s + r;
    }, 0);
  }, [journal]);

  const expenses = useMemo(() => {
    return journal.reduce((s, e) => {
      const r = e.lines.reduce((a, l) => a + (l.account.startsWith("5") ? l.debit - l.credit : 0), 0);
      return s + r;
    }, 0);
  }, [journal]);

  const revenueSeries = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];
    return months.map((m, i) => ({
      month: m,
      الإيرادات: 320000 + i * 45000 + Math.round(Math.random() * 60000),
      المصروفات: 180000 + i * 22000 + Math.round(Math.random() * 30000),
    }));
  }, []);

  const inventoryByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) {
      map[p.category] = (map[p.category] || 0) + p.quantity;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [products]);

  const empByDept = useMemo(() => {
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

  const recentActivity = [
    ...journal.slice(-5).reverse().map((j) => ({
      icon: Wallet, label: j.description, time: j.date, type: "قيد محاسبي",
    })),
    ...permits.slice(-3).reverse().map((p) => ({
      icon: ClipboardList, label: `إذن صرف ${p.serial} لـ ${p.requester}`, time: p.date, type: "أذون مخازن",
    })),
  ].slice(0, 8);

  return (
    <AppShell
      title="لوحة التحكم التنفيذية"
      subtitle="نظرة شاملة على أداء الشركة في الوقت الحالي"
      breadcrumbs={[{ label: "الرئيسية" }, { label: "لوحة التحكم" }]}
    >
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="قيمة المخزون الحالي"
          value={fmtCurrency(inventoryValue)}
          hint={`${products.length} صنف نشط`}
          icon={Boxes}
          delta={{ value: "+8.4%", positive: true }}
          accent="primary"
        />
        <StatCard
          label="صافي الإيرادات (آخر 30 يومًا)"
          value={fmtCurrency(revenue - expenses)}
          hint={`الإيرادات: ${fmtCurrency(revenue)}`}
          icon={TrendingUp}
          delta={{ value: "+12.6%", positive: true }}
          accent="accent"
        />
        <StatCard
          label="عدد الموظفين النشطين"
          value={fmtNumber(activeEmployees)}
          hint={`${employees.length - activeEmployees} في إجازة / منتهية`}
          icon={UsersIcon}
          accent="muted"
        />
        <StatCard
          label="أذون صرف بانتظار التنفيذ"
          value={fmtNumber(activeOrders)}
          hint={`${lowStock} صنف وصل للحد الأدنى`}
          icon={lowStock > 0 ? AlertTriangle : ClipboardList}
          accent={lowStock > 0 ? "destructive" : "primary"}
        />
      </div>

      {/* Revenue chart + Inventory pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold">الإيرادات والمصروفات</h3>
              <p className="text-xs text-muted-foreground">آخر 6 أشهر</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="grad-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(36 80% 60%)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(36 80% 60%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(175 60% 45%)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(175 60% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} reversed />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} orientation="right" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="الإيرادات" stroke="hsl(36 80% 60%)" strokeWidth={2.5} fill="url(#grad-rev)" />
                <Area type="monotone" dataKey="المصروفات" stroke="hsl(175 60% 45%)" strokeWidth={2.5} fill="url(#grad-exp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="text-base font-bold mb-1">المخزون حسب الفئة</h3>
          <p className="text-xs text-muted-foreground mb-4">إجمالي الكميات المتاحة</p>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={inventoryByCategory} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {inventoryByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--background))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {inventoryByCategory.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span>{c.name}</span>
                </div>
                <span className="tabular-nums font-semibold">{fmtNumber(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departments + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 xl:col-span-1">
          <h3 className="text-base font-bold mb-1">الموظفون حسب القسم</h3>
          <p className="text-xs text-muted-foreground mb-4">التوزيع الحالي</p>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={empByDept} layout="vertical" margin={{ right: 24, left: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} width={110} orientation="right" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="hsl(36 80% 60%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 xl:col-span-2">
          <h3 className="text-base font-bold mb-1">آخر النشاطات</h3>
          <p className="text-xs text-muted-foreground mb-4">عمليات تمت في الأيام السابقة</p>
          <div className="space-y-2">
            {recentActivity.map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass-subtle hover-elevate">
                  <div className="size-9 rounded-lg bg-primary/15 grid place-items-center text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.label}</div>
                    <div className="text-[10px] text-muted-foreground">{a.type}</div>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums shrink-0">{a.time}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
