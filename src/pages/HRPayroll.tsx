import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/StatCard";
import { Wallet, TrendingUp, TrendingDown, Printer } from "lucide-react";
import { store } from "@/lib/storage";
import { fmtCurrency } from "@/lib/format";
import { motion } from "framer-motion";

export default function HRPayroll() {
  const employees = store.employees.list();
  const [payroll] = useState(() => store.payroll.list());
  const months = Array.from(new Set(payroll.map((p) => p.month))).sort().reverse();
  const [month, setMonth] = useState(months[0] || "");

  const empName = (id: string) => employees.find((e) => e.id === id)?.name ?? "—";
  const empDept = (id: string) => employees.find((e) => e.id === id)?.department ?? "—";

  const filtered = useMemo(() => payroll.filter((p) => p.month === month), [payroll, month]);

  const totalGross = filtered.reduce((s, p) => s + p.baseSalary + p.allowances, 0);
  const totalDed = filtered.reduce((s, p) => s + p.deductions, 0);
  const totalNet = filtered.reduce((s, p) => s + p.netSalary, 0);

  const monthLabel = (m: string) => {
    const [y, mo] = m.split("-");
    return new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "long" }).format(new Date(+y, +mo - 1));
  };

  return (
    <AppShell
      title="كشف المرتبات"
      subtitle="حساب وطباعة رواتب الموظفين الشهرية"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الموارد البشرية", href: "/hr" }, { label: "المرتبات" }]}
      actions={
        <Button variant="outline" className="gap-2" onClick={() => window.print()}><Printer className="size-4" />طباعة</Button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="إجمالي الرواتب" value={fmtCurrency(totalGross)} icon={TrendingUp} accent="primary" />
        <StatCard label="إجمالي الخصومات" value={fmtCurrency(totalDed)} icon={TrendingDown} accent="muted" />
        <StatCard label="صافي المدفوع" value={fmtCurrency(totalNet)} icon={Wallet} accent="accent" />
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">الشهر</label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-48 bg-background/30"><SelectValue /></SelectTrigger>
              <SelectContent>{months.map((m) => <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Badge variant="secondary">{filtered.length} موظف</Badge>
        </div>

        <div className="rounded-xl overflow-hidden border border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right">الموظف</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الراتب الأساسي</TableHead>
                <TableHead className="text-right">البدلات</TableHead>
                <TableHead className="text-right">الخصومات</TableHead>
                <TableHead className="text-right">الصافي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/30"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-primary/15 grid place-items-center text-primary font-bold text-xs">
                        {empName(p.employeeId).slice(0, 2)}
                      </div>
                      <span className="font-medium text-sm">{empName(p.employeeId)}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{empDept(p.employeeId)}</Badge></TableCell>
                  <TableCell className="tabular-nums text-xs">{fmtCurrency(p.baseSalary)}</TableCell>
                  <TableCell className="tabular-nums text-xs text-emerald-400">+{fmtCurrency(p.allowances)}</TableCell>
                  <TableCell className="tabular-nums text-xs text-rose-400">-{fmtCurrency(p.deductions)}</TableCell>
                  <TableCell className="tabular-nums text-sm font-bold gradient-text">{fmtCurrency(p.netSalary)}</TableCell>
                  <TableCell>
                    {p.status === "paid" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px]">مدفوع</Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[10px]">قيد الصرف</Badge>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
