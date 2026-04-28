import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilePlus, Boxes, ArrowDownUp, Save, CheckCircle2 } from "lucide-react";
import { store, uid } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";

export default function DataEntry() {
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const flash = (m: string) => {
    setSavedMsg(m);
    setTimeout(() => setSavedMsg(null), 2400);
  };

  return (
    <AppShell
      title="إدخال بيانات سريع"
      subtitle="إدخال أصناف وحركات مخزنية بسرعة"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "إدخال بيانات" }]}
    >
      <AnimatePresence>
        {savedMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-strong border border-emerald-500/40 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm text-emerald-400"
          >
            <CheckCircle2 className="size-4" />
            {savedMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs defaultValue="product" className="w-full">
        <TabsList className="bg-background/40 mb-4">
          <TabsTrigger value="product" className="gap-2"><Boxes className="size-4" />صنف جديد</TabsTrigger>
          <TabsTrigger value="movement" className="gap-2"><ArrowDownUp className="size-4" />حركة مخزنية</TabsTrigger>
          <TabsTrigger value="entry" className="gap-2"><FilePlus className="size-4" />قيد محاسبي بسيط</TabsTrigger>
        </TabsList>

        <TabsContent value="product"><QuickProduct onSave={(n) => flash(`تم حفظ الصنف "${n}" بنجاح`)} /></TabsContent>
        <TabsContent value="movement"><QuickMovement onSave={(n) => flash(`تم تسجيل الحركة "${n}" بنجاح`)} /></TabsContent>
        <TabsContent value="entry"><QuickEntry onSave={(n) => flash(`تم حفظ القيد "${n}" بنجاح`)} /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

function QuickProduct({ onSave }: { onSave: (n: string) => void }) {
  const [form, setForm] = useState({ code: "", name: "", category: "إلكترونيات", quantity: 0, minQuantity: 0, price: 0, unit: "قطعة" });
  const submit = () => {
    const ps = store.products.list();
    ps.unshift({
      id: uid("p"),
      code: form.code || `NEW-${Math.floor(Math.random() * 9000)}`,
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
      price: Number(form.price),
      unit: form.unit,
      status: "active",
    });
    store.products.save(ps);
    onSave(form.name);
    setForm({ code: "", name: "", category: "إلكترونيات", quantity: 0, minQuantity: 0, price: 0, unit: "قطعة" });
  };
  return (
    <div className="glass rounded-2xl p-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">الكود</Label>
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="EL-1010" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الفئة</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["إلكترونيات", "أثاث", "قرطاسية", "مواد خام", "تغليف", "عدد ومعدات"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">اسم الصنف</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="..." />
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
      <Button onClick={submit} disabled={!form.name} className="mt-4 gap-2"><Save className="size-4" />حفظ الصنف</Button>
    </div>
  );
}

function QuickMovement({ onSave }: { onSave: (n: string) => void }) {
  const products = store.products.list();
  const [form, setForm] = useState({ type: "in" as "in" | "out", productId: products[0]?.id || "", quantity: 1, reference: "", date: new Date().toISOString().slice(0, 10) });
  const submit = () => {
    const ms = store.movements.list();
    ms.unshift({
      id: uid("m"),
      productId: form.productId,
      type: form.type,
      quantity: Number(form.quantity),
      date: form.date,
      reference: form.reference || `REF-${Math.floor(Math.random() * 9000)}`,
      notes: "",
    });
    store.movements.save(ms);
    const ps = store.products.list();
    const idx = ps.findIndex((p) => p.id === form.productId);
    if (idx >= 0) {
      ps[idx].quantity += form.type === "in" ? Number(form.quantity) : -Number(form.quantity);
      store.products.save(ps);
    }
    const pname = products.find((p) => p.id === form.productId)?.name || "";
    onSave(`${form.type === "in" ? "وارد" : "صادر"} - ${pname}`);
    setForm({ ...form, quantity: 1, reference: "" });
  };
  return (
    <div className="glass rounded-2xl p-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">نوع الحركة</Label>
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "in" | "out" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="in">وارد</SelectItem>
              <SelectItem value="out">صادر</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">التاريخ</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">الصنف</Label>
          <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{products.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الكمية</Label>
          <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">المرجع</Label>
          <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
        </div>
      </div>
      <Button onClick={submit} className="mt-4 gap-2"><Save className="size-4" />تسجيل الحركة</Button>
    </div>
  );
}

function QuickEntry({ onSave }: { onSave: (n: string) => void }) {
  const accounts = store.accounts.list();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    debitAccount: accounts[0]?.code || "",
    creditAccount: accounts[1]?.code || "",
    amount: 0,
    reference: "",
  });
  const submit = () => {
    const js = store.journal.list();
    js.unshift({
      id: uid("je"),
      serial: `JE-${Math.floor(1000 + Math.random() * 9000)}`,
      date: form.date,
      description: form.description,
      reference: form.reference,
      lines: [
        { account: form.debitAccount, debit: Number(form.amount), credit: 0 },
        { account: form.creditAccount, debit: 0, credit: Number(form.amount) },
      ],
    });
    store.journal.save(js);
    onSave(form.description);
    setForm({ ...form, description: "", amount: 0, reference: "" });
  };
  return (
    <div className="glass rounded-2xl p-6 max-w-3xl">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">التاريخ</Label>
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">المرجع</Label>
          <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">البيان</Label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الحساب المدين</Label>
          <Select value={form.debitAccount} onValueChange={(v) => setForm({ ...form, debitAccount: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{accounts.map((a) => <SelectItem key={a.code} value={a.code}>{a.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">الحساب الدائن</Label>
          <Select value={form.creditAccount} onValueChange={(v) => setForm({ ...form, creditAccount: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{accounts.map((a) => <SelectItem key={a.code} value={a.code}>{a.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">المبلغ</Label>
          <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        </div>
      </div>
      <Button onClick={submit} disabled={!form.description || !form.amount} className="mt-4 gap-2"><Save className="size-4" />حفظ القيد</Button>
    </div>
  );
}
