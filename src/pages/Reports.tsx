import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, FileSpreadsheet, FileText } from "lucide-react";
import { store } from "@/lib/storage";
import { fmtCurrency, fmtNumber } from "@/lib/format";
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["hsl(36 80% 60%)", "hsl(175 60% 45%)", "hsl(270 55% 65%)", "hsl(195 70% 55%)", "hsl(340 65% 60%)", "hsl(120 50% 55%)"];

export default function Reports() {
  const products = store.products.list();
  const employees = store.employees.list();
  const journal = store.journal.list();
  const movements = store.movements.list();

  const inventoryByCat = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    for (const p of products) {
      if (!map[p.category]) map[p.category] = { count: 0, value: 0 };
      map[p.category].count += p.quantity;
      map[p.category].value += p.quantity * p.price;
    }
    return Object.entries(map).map(([name, v]) => ({ name, ...v }));
  }, [products]);

  const empByDept = useMemo(() => {
    const map: Record<string, { count: number; salary: number }> = {};
    for (const e of employees) {
      if (!map[e.department]) map[e.department] = { count: 0, salary: 0 };
      map[e.department].count += 1;
      map[e.department].salary += e.salary;
    }
    return Object.entries(map).map(([name, v]) => ({ name, ...v }));
  }, [employees]);

  const revSeries = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"];
    return months.map((m, i) => ({
      month: m,
      الإيرادات: 380000 + i * 32000 + Math.round(Math.random() * 50000),
      المصروفات: 220000 + i * 18000 + Math.round(Math.random() * 28000),
    }));
  }, []);

  const movementSummary = useMemo(() => {
    const inn = movements.filter((m) => m.type === "in").reduce((s, m) => s + m.quantity, 0);
    const out = movements.filter((m) => m.type === "out").reduce((s, m) => s + m.quantity, 0);
    return { inn, out };
  }, [movements]);

  return (
    <AppShell
      title="التقارير الشاملة"
      subtitle="تقارير تفصيلية عن جميع نشاطات الشركة"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "التقارير" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="size-4" /> طباعة
          </Button>
          <Button className="gap-2"><FileSpreadsheet className="size-4" />تصدير</Button>
        </div>
      }
    >
      <Tabs defaultValue="inventory" className="w-full">
        <TabsList className="bg-background/40 mb-4">
          <TabsTrigger value="inventory">تقرير المخازن</TabsTrigger>
          <TabsTrigger value="financial">تقرير مالي</TabsTrigger>
          <TabsTrigger value="hr">تقرير الموظفين</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="glass rounded-2xl p-5">
              <h3 className="font-bold mb-1">قيمة المخزون حسب الفئة</h3>
              <p className="text-xs text-muted-foreground mb-4">قيمة الأصناف الإجمالية</p>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={inventoryByCat}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} reversed />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} orientation="right" />
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" fill="hsl(36 80% 60%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <h3 className="font-bold mb-1">حركة المخزون</h3>
              <p className="text-xs text-muted-foreground mb-4">إجمالي الوارد والصادر</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="glass-subtle rounded-xl p-4">
                  <div className="text-xs text-muted-foreground">إجمالي الوارد</div>
                  <div className="text-2xl font-bold tabular-nums text-emerald-400">{fmtNumber(movementSummary.inn)}</div>
                </div>
                <div className="glass-subtle rounded-xl p-4">
                  <div className="text-xs text-muted-foreground">إجمالي الصادر</div>
                  <div className="text-2xl font-bold tabular-nums text-amber-400">{fmtNumber(movementSummary.out)}</div>
                </div>
              </div>
              <div className="h-44">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "وارد", value: movementSummary.inn },
                        { name: "صادر", value: movementSummary.out },
                      ]}
                      dataKey="value" innerRadius={40} outerRadius={70}
                    >
                      <Cell fill="hsl(150 60% 45%)" />
                      <Cell fill="hsl(36 80% 60%)" />
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold mb-3">تفصيل المخزون حسب الفئة</h3>
            <div className="rounded-xl overflow-hidden border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs">
                    <th className="text-right p-3">الفئة</th>
                    <th className="text-right p-3">عدد الكمية</th>
                    <th className="text-right p-3">القيمة الإجمالية</th>
                    <th className="text-right p-3">النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryByCat.map((c, i) => {
                    const total = inventoryByCat.reduce((s, x) => s + x.value, 0);
                    const pct = ((c.value / total) * 100).toFixed(1);
                    return (
                      <motion.tr
                        key={c.name}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border/30"
                      >
                        <td className="p-3 font-medium">{c.name}</td>
                        <td className="p-3 tabular-nums">{fmtNumber(c.count)}</td>
                        <td className="p-3 tabular-nums font-semibold">{fmtCurrency(c.value)}</td>
                        <td className="p-3"><Badge variant="secondary" className="text-[10px] tabular-nums">{pct}%</Badge></td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold mb-1">الإيرادات والمصروفات (آخر 6 أشهر)</h3>
            <div className="h-80 mt-4">
              <ResponsiveContainer>
                <AreaChart data={revSeries}>
                  <defs>
                    <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(36 80% 60%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(36 80% 60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g-exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(175 60% 45%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(175 60% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} reversed />
                  <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} orientation="right" />
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="الإيرادات" stroke="hsl(36 80% 60%)" strokeWidth={2.5} fill="url(#g-rev)" />
                  <Area type="monotone" dataKey="المصروفات" stroke="hsl(175 60% 45%)" strokeWidth={2.5} fill="url(#g-exp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hr">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold mb-3">الأقسام والرواتب</h3>
            <div className="rounded-xl overflow-hidden border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs">
                    <th className="text-right p-3">القسم</th>
                    <th className="text-right p-3">عدد الموظفين</th>
                    <th className="text-right p-3">إجمالي الرواتب</th>
                    <th className="text-right p-3">متوسط الراتب</th>
                  </tr>
                </thead>
                <tbody>
                  {empByDept.map((d, i) => (
                    <motion.tr
                      key={d.name}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border/30"
                    >
                      <td className="p-3 font-medium">{d.name}</td>
                      <td className="p-3 tabular-nums">{fmtNumber(d.count)}</td>
                      <td className="p-3 tabular-nums font-semibold">{fmtCurrency(d.salary)}</td>
                      <td className="p-3 tabular-nums text-muted-foreground">{fmtCurrency(Math.round(d.salary / d.count))}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
