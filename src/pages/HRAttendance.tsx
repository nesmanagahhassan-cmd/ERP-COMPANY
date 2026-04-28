import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatCard } from "@/components/StatCard";
import { CalendarClock, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { store } from "@/lib/storage";
import { fmtDate } from "@/lib/format";
import { motion } from "framer-motion";

const STATUS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  present: { label: "حاضر", color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle2 },
  late: { label: "متأخر", color: "bg-amber-500/15 text-amber-400", icon: AlertCircle },
  absent: { label: "غائب", color: "bg-rose-500/15 text-rose-400", icon: XCircle },
  leave: { label: "إجازة", color: "bg-sky-500/15 text-sky-400", icon: Clock },
};

export default function HRAttendance() {
  const employees = store.employees.list();
  const [records] = useState(() => store.attendance.list());
  const [date, setDate] = useState<string>(records[0]?.date || new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("all");

  const empName = (id: string) => employees.find((e) => e.id === id)?.name ?? "—";
  const empDept = (id: string) => employees.find((e) => e.id === id)?.department ?? "—";

  const filtered = useMemo(() =>
    records
      .filter((r) => r.date === date)
      .filter((r) => status === "all" || r.status === status),
    [records, date, status]);

  const dayRecords = records.filter((r) => r.date === date);
  const stats = {
    present: dayRecords.filter((r) => r.status === "present").length,
    late: dayRecords.filter((r) => r.status === "late").length,
    absent: dayRecords.filter((r) => r.status === "absent").length,
    leave: dayRecords.filter((r) => r.status === "leave").length,
  };

  const dates = Array.from(new Set(records.map((r) => r.date))).sort().reverse();

  return (
    <AppShell
      title="الحضور والانصراف"
      subtitle="سجل دوام الموظفين"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الموارد البشرية", href: "/hr" }, { label: "الحضور" }]}
    >
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="حاضرون" value={stats.present} icon={CheckCircle2} accent="accent" />
        <StatCard label="متأخرون" value={stats.late} icon={AlertCircle} accent="primary" />
        <StatCard label="غائبون" value={stats.absent} icon={XCircle} accent="destructive" />
        <StatCard label="إجازة" value={stats.leave} icon={Clock} accent="muted" />
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">التاريخ</label>
            <Select value={date} onValueChange={setDate}>
              <SelectTrigger className="w-44 bg-background/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                {dates.map((d) => <SelectItem key={d} value={d}>{fmtDate(d)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">الحالة</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-36 bg-background/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                {Object.entries(STATUS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right">الموظف</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الحضور</TableHead>
                <TableHead className="text-right">الانصراف</TableHead>
                <TableHead className="text-right">ساعات العمل</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r, i) => {
                const meta = STATUS[r.status];
                const Icon = meta.icon;
                const hours = r.checkIn && r.checkOut ? calcHours(r.checkIn, r.checkOut) : "—";
                return (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/30"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary/15 grid place-items-center text-primary font-bold text-xs">
                          {empName(r.employeeId).slice(0, 2)}
                        </div>
                        <span className="font-medium text-sm">{empName(r.employeeId)}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{empDept(r.employeeId)}</Badge></TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">{r.checkIn || "—"}</TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">{r.checkOut || "—"}</TableCell>
                    <TableCell className="font-mono text-xs tabular-nums font-bold">{hours}</TableCell>
                    <TableCell>
                      <Badge className={`${meta.color} border-0 gap-1 text-[10px]`}>
                        <Icon className="size-3" />
                        {meta.label}
                      </Badge>
                    </TableCell>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    لا توجد سجلات حضور لهذا التاريخ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}

function calcHours(a: string, b: string) {
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  const mins = bh * 60 + bm - (ah * 60 + am);
  if (mins <= 0) return "—";
  return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, "0")}`;
}
