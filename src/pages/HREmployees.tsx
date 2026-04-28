import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { store, uid } from "@/lib/storage";
import { fmtCurrency, fmtDate } from "@/lib/format";
import type { Employee } from "@/lib/types";
import { motion } from "framer-motion";

export default function HREmployees() {
  const [employees, setEmployees] = useState<Employee[]>(() => store.employees.list());
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("all");
  const [open, setOpen] = useState(false);

  const departments = useMemo(() => Array.from(new Set(employees.map((e) => e.department))), [employees]);

  const filtered = useMemo(
    () => employees.filter((e) =>
      (dept === "all" || e.department === dept) &&
      (q === "" || e.name.includes(q) || e.code.toLowerCase().includes(q.toLowerCase()))
    ), [employees, q, dept]);

  const add = (e: Partial<Employee>) => {
    const ne: Employee = {
      id: uid("e"),
      code: e.code || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name: e.name || "",
      department: e.department || "تكنولوجيا المعلومات",
      position: e.position || "",
      email: e.email || "",
      phone: e.phone || "",
      hireDate: e.hireDate || new Date().toISOString().slice(0, 10),
      salary: Number(e.salary) || 0,
      status: "active",
    };
    const next = [ne, ...employees];
    setEmployees(next);
    store.employees.save(next);
    setOpen(false);
  };

  return (
    <AppShell
      title="بيانات الموظفين"
      subtitle="عرض وإدارة معلومات الموظفين"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الموارد البشرية", href: "/hr" }, { label: "الموظفون" }]}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" />إضافة موظف</Button></DialogTrigger>
          <EmployeeDialog onSubmit={add} />
        </Dialog>
      }
    >
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="بحث بالاسم أو الكود..." value={q} onChange={(e) => setQ(e.target.value)} className="pr-10 bg-background/30" />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-44 bg-background/30"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأقسام</SelectItem>
              {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl overflow-hidden border border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">المسمى الوظيفي</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">التواصل</TableHead>
                <TableHead className="text-right">تاريخ التعيين</TableHead>
                <TableHead className="text-right">الراتب</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e, i) => (
                <motion.tr
                  key={e.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/30"
                >
                  <TableCell className="font-mono text-xs text-primary">{e.code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-primary/15 grid place-items-center text-primary font-bold text-xs">
                        {e.name.slice(0, 2)}
                      </div>
                      <span className="font-medium text-sm">{e.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{e.position}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-[10px]">{e.department}</Badge></TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1"><Mail className="size-2.5" />{e.email}</div>
                      <div className="flex items-center gap-1"><Phone className="size-2.5" />{e.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">{fmtDate(e.hireDate)}</TableCell>
                  <TableCell className="tabular-nums font-bold text-xs">{fmtCurrency(e.salary)}</TableCell>
                  <TableCell>
                    {e.status === "active" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px]">نشط</Badge>
                    ) : e.status === "on-leave" ? (
                      <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[10px]">في إجازة</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">منتهية</Badge>
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

function EmployeeDialog({ onSubmit }: { onSubmit: (e: Partial<Employee>) => void }) {
  const [form, setForm] = useState<Partial<Employee>>({
    name: "", department: "تكنولوجيا المعلومات", position: "", email: "", phone: "", hireDate: new Date().toISOString().slice(0, 10), salary: 0,
  });
  return (
    <DialogContent className="glass-strong">
      <DialogHeader>
        <DialogTitle>إضافة موظف جديد</DialogTitle>
        <DialogDescription>أدخل بيانات الموظف الكاملة</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">الاسم الكامل</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="محمد أحمد..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">القسم</Label>
          <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["تكنولوجيا المعلومات", "المبيعات", "التسويق", "المحاسبة", "الموارد البشرية", "العمليات", "خدمة العملاء"].map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">المسمى الوظيفي</Label>
          <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="مطور برمجيات..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">البريد الإلكتروني</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">رقم الهاتف</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">تاريخ التعيين</Label>
          <Input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الراتب الأساسي</Label>
          <Input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(form)} disabled={!form.name}>حفظ الموظف</Button>
      </DialogFooter>
    </DialogContent>
  );
}
