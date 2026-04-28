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
import { Plus, Search, AlertTriangle, Package, TrendingDown } from "lucide-react";
import { store, uid } from "@/lib/storage";
import { fmtCurrency, fmtNumber } from "@/lib/format";
import { StatCard } from "@/components/StatCard";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>(() => store.products.list());
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [open, setOpen] = useState(false);

  const categories = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);
  const filtered = useMemo(() =>
    products.filter((p) =>
      (cat === "all" || p.category === cat) &&
      (q === "" || p.name.includes(q) || p.code.toLowerCase().includes(q.toLowerCase()))
    ), [products, q, cat]);

  const total = products.length;
  const lowStock = products.filter((p) => p.quantity <= p.minQuantity).length;
  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);

  const addProduct = (data: Partial<Product>) => {
    const np: Product = {
      id: uid("p"),
      code: data.code || `NEW-${Math.floor(Math.random() * 9000)}`,
      name: data.name || "",
      category: data.category || "إلكترونيات",
      quantity: Number(data.quantity) || 0,
      minQuantity: Number(data.minQuantity) || 0,
      price: Number(data.price) || 0,
      unit: data.unit || "قطعة",
      status: "active",
    };
    const next = [np, ...products];
    setProducts(next);
    store.products.save(next);
    setOpen(false);
  };

  return (
    <AppShell
      title="إدارة المخازن"
      subtitle="جرد وكميات وحركة الأصناف"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "المخازن" }, { label: "الأصناف" }]}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="size-4" />إضافة صنف</Button>
          </DialogTrigger>
          <ProductDialog onSubmit={addProduct} />
        </Dialog>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="إجمالي الأصناف" value={fmtNumber(total)} icon={Package} accent="primary" />
        <StatCard label="قيمة المخزون" value={fmtCurrency(totalValue)} icon={Package} accent="accent" />
        <StatCard
          label="أصناف وصلت للحد الأدنى"
          value={fmtNumber(lowStock)}
          icon={lowStock > 0 ? AlertTriangle : TrendingDown}
          accent={lowStock > 0 ? "destructive" : "muted"}
        />
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو الكود..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pr-10 bg-background/30"
            />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-44 bg-background/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-xl overflow-hidden border border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">اسم الصنف</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">الكمية</TableHead>
                <TableHead className="text-right">الحد الأدنى</TableHead>
                <TableHead className="text-right">سعر الوحدة</TableHead>
                <TableHead className="text-right">القيمة الإجمالية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, i) => {
                const low = p.quantity <= p.minQuantity;
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-primary">{p.code}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{p.category}</Badge></TableCell>
                    <TableCell className="tabular-nums">
                      <span className={low ? "text-destructive font-bold" : ""}>{fmtNumber(p.quantity)}</span>
                      <span className="text-muted-foreground text-xs mr-1">{p.unit}</span>
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground text-xs">{fmtNumber(p.minQuantity)}</TableCell>
                    <TableCell className="tabular-nums text-xs">{fmtCurrency(p.price)}</TableCell>
                    <TableCell className="tabular-nums font-semibold text-xs">{fmtCurrency(p.price * p.quantity)}</TableCell>
                    <TableCell>
                      {low ? (
                        <Badge variant="destructive" className="text-[10px] gap-1">
                          <AlertTriangle className="size-2.5" /> منخفض
                        </Badge>
                      ) : (
                        <Badge className="text-[10px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 border-0">متوفر</Badge>
                      )}
                    </TableCell>
                  </motion.tr>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                    لا توجد أصناف تطابق البحث
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

function ProductDialog({ onSubmit }: { onSubmit: (d: Partial<Product>) => void }) {
  const [form, setForm] = useState<Partial<Product>>({
    code: "", name: "", category: "إلكترونيات", quantity: 0, minQuantity: 0, price: 0, unit: "قطعة",
  });
  return (
    <DialogContent className="glass-strong">
      <DialogHeader>
        <DialogTitle>إضافة صنف جديد</DialogTitle>
        <DialogDescription>أدخل بيانات الصنف ليتم إضافته لقائمة المخازن</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">الكود</Label>
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="EL-1010" />
        </div>
        <div className="space-y-1.5 col-span-2 sm:col-span-1">
          <Label className="text-xs">الفئة</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["إلكترونيات", "أثاث", "قرطاسية", "مواد خام", "تغليف", "عدد ومعدات"].map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">اسم الصنف</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="حاسوب محمول..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الكمية الحالية</Label>
          <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الحد الأدنى</Label>
          <Input type="number" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">سعر الوحدة</Label>
          <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">وحدة القياس</Label>
          <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(form)} disabled={!form.name}>حفظ الصنف</Button>
      </DialogFooter>
    </DialogContent>
  );
}
