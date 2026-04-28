import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, CheckCircle2, XCircle, Hourglass, Plane } from "lucide-react";
import { store, uid } from "@/lib/storage";
import { fmtDate } from "@/lib/format";
import type { LeaveRequest } from "@/lib/types";
import { motion } from "framer-motion";

const TYPE_LABEL: Record<string, string> = {
  annual: "إجازة سنوية", sick: "إجازة مرضية", emergency: "إجازة طارئة", unpaid: "إجازة بدون أجر",
};

export default function HRLeaves() {
  const employees = store.employees.list();
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => store.leaves.list());
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [open, setOpen] = useState(false);

  const empName = (id: string) => employees.find((e) => e.id === id)?.name ?? "—";

  const filtered = useMemo(() =>
    [...leaves].filter((l) => tab === "all" || l.status === tab).sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [leaves, tab]);

  const setStatus = (id: string, st: LeaveRequest["status"]) => {
    const next = leaves.map((l) => (l.id === id ? { ...l, status: st } : l));
    setLeaves(next);
    store.leaves.save(next);
  };

  const add = (l: Partial<LeaveRequest>) => {
    const days = Math.max(1, Math.ceil((+new Date(l.endDate!) - +new Date(l.startDate!)) / 86400000) + 1);
    const nl: LeaveRequest = {
      id: uid("lv"),
      employeeId: l.employeeId!,
      type: (l.type as LeaveRequest["type"]) || "annual",
      startDate: l.startDate!,
      endDate: l.endDate!,
      days,
      reason: l.reason || "",
      status: "pending",
    };
    const next = [nl, ...leaves];
    setLeaves(next);
    store.leaves.save(next);
    setOpen(false);
  };

  return (
    <AppShell
      title="طلبات الإجازات"
      subtitle="عرض واعتماد إجازات الموظفين"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الموارد البشرية", href: "/hr" }, { label: "الإجازات" }]}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" />طلب إجازة</Button></DialogTrigger>
          <LeaveDialog onSubmit={add} />
        </Dialog>
      }
    >
      <div className="glass rounded-2xl p-5">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "pending" | "approved" | "rejected")} className="mb-4">
          <TabsList className="bg-background/40">
            <TabsTrigger value="all">الكل ({leaves.length})</TabsTrigger>
            <TabsTrigger value="pending">قيد المراجعة ({leaves.filter((l) => l.status === "pending").length})</TabsTrigger>
            <TabsTrigger value="approved">معتمدة ({leaves.filter((l) => l.status === "approved").length})</TabsTrigger>
            <TabsTrigger value="rejected">مرفوضة ({leaves.filter((l) => l.status === "rejected").length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((l, i) => (
            <motion.div
              key={l.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-subtle rounded-2xl p-5 hover-elevate"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Plane className="size-3.5 text-primary" />
                    <Badge variant="secondary" className="text-[10px]">{TYPE_LABEL[l.type]}</Badge>
                  </div>
                  <div className="font-semibold text-sm">{empName(l.employeeId)}</div>
                </div>
                <StatusBadge status={l.status} />
              </div>
              <div className="space-y-1.5 text-xs mb-3">
                <div className="flex justify-between"><span className="text-muted-foreground">من</span><span className="tabular-nums">{fmtDate(l.startDate)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">إلى</span><span className="tabular-nums">{fmtDate(l.endDate)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">عدد الأيام</span><span className="font-bold">{l.days ?? Math.ceil((+new Date(l.endDate) - +new Date(l.startDate)) / 86400000) + 1}</span></div>
              </div>
              {l.reason && (
                <div className="text-xs text-muted-foreground bg-muted/30 rounded-md px-2 py-1.5 mb-3">
                  {l.reason}
                </div>
              )}
              {l.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1.5 h-8" onClick={() => setStatus(l.id, "approved")}>
                    <CheckCircle2 className="size-3.5" /> اعتماد
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5 h-8 text-destructive border-destructive/40" onClick={() => setStatus(l.id, "rejected")}>
                    <XCircle className="size-3.5" /> رفض
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: LeaveRequest["status"] }) {
  if (status === "approved") return <Badge className="bg-emerald-500/15 text-emerald-400 border-0 text-[10px] gap-1"><CheckCircle2 className="size-3" />معتمدة</Badge>;
  if (status === "rejected") return <Badge className="bg-rose-500/15 text-rose-400 border-0 text-[10px] gap-1"><XCircle className="size-3" />مرفوضة</Badge>;
  return <Badge className="bg-amber-500/15 text-amber-400 border-0 text-[10px] gap-1"><Hourglass className="size-3" />قيد المراجعة</Badge>;
}

function LeaveDialog({ onSubmit }: { onSubmit: (l: Partial<LeaveRequest>) => void }) {
  const employees = store.employees.list();
  const [form, setForm] = useState<Partial<LeaveRequest>>({
    employeeId: employees[0]?.id, type: "annual", startDate: "", endDate: "", reason: "",
  });
  return (
    <DialogContent className="glass-strong">
      <DialogHeader>
        <DialogTitle>طلب إجازة جديدة</DialogTitle>
        <DialogDescription>سيتم إرسال الطلب لمدير القسم للاعتماد</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">الموظف</Label>
          <Select value={form.employeeId} onValueChange={(v) => setForm({ ...form, employeeId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">نوع الإجازة</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as LeaveRequest["type"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">من تاريخ</Label>
          <Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">إلى تاريخ</Label>
          <Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">السبب</Label>
          <Input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="..." />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(form)} disabled={!form.startDate || !form.endDate}>إرسال الطلب</Button>
      </DialogFooter>
    </DialogContent>
  );
}
