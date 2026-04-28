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
import { Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { store, uid } from "@/lib/storage";
import { fmtCurrency, fmtDate } from "@/lib/format";
import type { JournalEntry, JournalLine } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export default function AccountingJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => store.journal.list());
  const [open, setOpen] = useState(false);
  const accounts = store.accounts.list();

  const sorted = useMemo(() => [...entries].sort((a, b) => b.date.localeCompare(a.date)), [entries]);

  const addEntry = (e: JournalEntry) => {
    const next = [e, ...entries];
    setEntries(next);
    store.journal.save(next);
    setOpen(false);
  };

  return (
    <AppShell
      title="قيود اليومية"
      subtitle="إدخال وعرض القيود المحاسبية"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الحسابات", href: "/accounting" }, { label: "قيود اليومية" }]}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" />قيد جديد</Button></DialogTrigger>
          <NewEntryDialog onSubmit={addEntry} />
        </Dialog>
      }
    >
      <div className="glass rounded-2xl p-5">
        <div className="rounded-xl overflow-hidden border border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right">الرقم</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">البيان</TableHead>
                <TableHead className="text-right">عدد الأطراف</TableHead>
                <TableHead className="text-right">إجمالي مدين</TableHead>
                <TableHead className="text-right">إجمالي دائن</TableHead>
                <TableHead className="text-right">المرجع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((e, i) => {
                const debit = e.lines.reduce((s, l) => s + l.debit, 0);
                const credit = e.lines.reduce((s, l) => s + l.credit, 0);
                return (
                  <motion.tr
                    key={e.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/30"
                  >
                    <TableCell className="font-mono text-xs text-primary font-bold">{e.serial}</TableCell>
                    <TableCell className="text-xs tabular-nums">{fmtDate(e.date)}</TableCell>
                    <TableCell className="text-sm font-medium">{e.description}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{e.lines.length}</Badge></TableCell>
                    <TableCell className="tabular-nums text-xs font-semibold text-emerald-400">{fmtCurrency(debit)}</TableCell>
                    <TableCell className="tabular-nums text-xs font-semibold text-amber-400">{fmtCurrency(credit)}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{e.reference || "—"}</TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}

function NewEntryDialog({ onSubmit }: { onSubmit: (e: JournalEntry) => void }) {
  const accounts = store.accounts.list();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [desc, setDesc] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<JournalLine[]>([
    { account: accounts[0]?.code || "", debit: 0, credit: 0 },
    { account: accounts[1]?.code || "", debit: 0, credit: 0 },
  ]);

  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
  const balanced = totalDebit === totalCredit && totalDebit > 0;

  const setLine = (i: number, patch: Partial<JournalLine>) => {
    setLines((s) => s.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  };

  const addLine = () => setLines((s) => [...s, { account: accounts[0]?.code || "", debit: 0, credit: 0 }]);
  const removeLine = (i: number) => setLines((s) => s.filter((_, idx) => idx !== i));

  const submit = () => {
    if (!balanced) return;
    onSubmit({
      id: uid("je"),
      serial: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
      date,
      description: desc,
      reference,
      lines: lines.filter((l) => l.debit > 0 || l.credit > 0),
    });
  };

  return (
    <DialogContent className="glass-strong max-w-3xl">
      <DialogHeader>
        <DialogTitle>قيد محاسبي جديد</DialogTitle>
        <DialogDescription>أدخل أطراف القيد بحيث يساوي مجموع المدين مجموع الدائن</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">التاريخ</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">المرجع</Label>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="INV-2025-..." />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">البيان</Label>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="وصف العملية..." />
        </div>
      </div>
      <div className="rounded-xl border border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-right">الحساب</TableHead>
              <TableHead className="text-right">مدين</TableHead>
              <TableHead className="text-right">دائن</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {lines.map((l, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-border/30"
                >
                  <TableCell>
                    <Select value={l.account} onValueChange={(v) => setLine(i, { account: v })}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {accounts.map((a) => (
                          <SelectItem key={a.code} value={a.code}>
                            <span className="font-mono text-xs ml-2">{a.code}</span> {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={l.debit || ""} onChange={(e) => setLine(i, { debit: Number(e.target.value), credit: 0 })} className="h-9 tabular-nums" />
                  </TableCell>
                  <TableCell>
                    <Input type="number" value={l.credit || ""} onChange={(e) => setLine(i, { credit: Number(e.target.value), debit: 0 })} className="h-9 tabular-nums" />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeLine(i)} disabled={lines.length <= 2}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        <div className="px-3 py-2 border-t border-border/40 flex items-center justify-between bg-muted/20">
          <Button variant="ghost" size="sm" onClick={addLine} className="gap-1.5"><Plus className="size-3.5" />طرف جديد</Button>
          <div className="flex items-center gap-4 text-xs">
            <div>مدين: <span className="font-bold tabular-nums">{fmtCurrency(totalDebit)}</span></div>
            <div>دائن: <span className="font-bold tabular-nums">{fmtCurrency(totalCredit)}</span></div>
            {balanced ? (
              <Badge className="bg-emerald-500/15 text-emerald-400 border-0 gap-1"><CheckCircle2 className="size-3" />متوازن</Badge>
            ) : (
              <Badge variant="destructive" className="gap-1"><AlertCircle className="size-3" />غير متوازن</Badge>
            )}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={submit} disabled={!balanced || !desc}>حفظ القيد</Button>
      </DialogFooter>
    </DialogContent>
  );
}
