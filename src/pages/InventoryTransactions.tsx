import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ArrowDown, ArrowUp } from "lucide-react";
import { store, uid } from "@/lib/storage";
import { fmtDate, fmtNumber } from "@/lib/format";
import type { StockMovement } from "@/lib/types";
import { motion } from "framer-motion";

export default function InventoryTransactions() {
  const products = store.products.list();
  const [movements, setMovements] = useState<StockMovement[]>(() => store.movements.list());
  const [tab, setTab] = useState<"all" | "in" | "out">("all");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() =>
    [...movements]
      .filter((m) => tab === "all" || m.type === tab)
      .sort((a, b) => b.date.localeCompare(a.date)),
    [movements, tab]);

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? "—";

  const submit = (data: Partial<StockMovement>) => {
    const m: StockMovement = {
      id: uid("m"),
      productId: data.productId!,
      type: (data.type as "in" | "out") || "in",
      quantity: Number(data.quantity) || 0,
      date: data.date || new Date().toISOString().slice(0, 10),
      reference: data.reference || `REF-${Math.floor(Math.random() * 9000)}`,
      notes: data.notes || "",
    };
    const next = [m, ...movements];
    setMovements(next);
    store.movements.save(next);
    // update product quantity
    const ps = store.products.list();
    const idx = ps.findIndex((p) => p.id === m.productId);
    if (idx >= 0) {
      ps[idx].quantity += m.type === "in" ? m.quantity : -m.quantity;
      store.products.save(ps);
    }
    setOpen(false);
  };

  return (
    <AppShell
      title="الوارد والصادر"
      subtitle="حركة دخول وخروج البضائع من المخزن"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "المخازن", href: "/inventory" }, { label: "الوارد والصادر" }]}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="size-4" />تسجيل حركة</Button>
          </DialogTrigger>
          <MovementDialog onSubmit={submit} />
        </Dialog>
      }
    >
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "in" | "out")}>
            <TabsList className="bg-background/40">
              <TabsTrigger value="all">الكل ({movements.length})</TabsTrigger>
              <TabsTrigger value="in" className="gap-1.5"><ArrowDown className="size-3" />وارد</TabsTrigger>
              <TabsTrigger value="out" className="gap-1.5"><ArrowUp className="size-3" />صادر</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="rounded-xl overflow-hidden border border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الصنف</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">المرجع</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/30"
                >
                  <TableCell className="text-xs tabular-nums">{fmtDate(m.date)}</TableCell>
                  <TableCell>
                    {m.type === "in" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-400 border-0 gap-1"><ArrowDown className="size-3" />وارد</Badge>
                    ) : (
                      <Badge className="bg-amber-500/15 text-amber-400 border-0 gap-1"><ArrowUp className="size-3" />صادر</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{productName(m.productId)}</TableCell>
                  <TableCell className="tabular-nums font-bold">{fmtNumber(m.quantity)}</TableCell>
                  <TableCell className="font-mono text-xs text-primary">{m.reference}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{m.notes}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}

function MovementDialog({ onSubmit }: { onSubmit: (d: Partial<StockMovement>) => void }) {
  const products = store.products.list();
  const [form, setForm] = useState<Partial<StockMovement>>({
    type: "in",
    productId: products[0]?.id,
    quantity: 1,
    date: new Date().toISOString().slice(0, 10),
    reference: "",
    notes: "",
  });
  return (
    <DialogContent className="glass-strong">
      <DialogHeader>
        <DialogTitle>تسجيل حركة مخزون</DialogTitle>
        <DialogDescription>إدخال أو خروج كمية من المخازن</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label className="text-xs">نوع الحركة</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "in" | "out" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="in">وارد (إضافة)</SelectItem>
              <SelectItem value="out">صادر (خصم)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label className="text-xs">التاريخ</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">الصنف</Label>
          <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name} <span className="text-xs text-muted-foreground mr-1">({p.code})</span></SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الكمية</Label>
          <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">رقم المرجع</Label>
          <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="PO-2025-..." />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">ملاحظات</Label>
          <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(form)} disabled={!form.productId || !form.quantity}>تسجيل الحركة</Button>
      </DialogFooter>
    </DialogContent>
  );
}
