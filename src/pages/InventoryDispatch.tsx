import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Plus, FileText, CheckCircle2, Clock, Hourglass } from "lucide-react";
import { store } from "@/lib/storage";
import { fmtDate } from "@/lib/format";
import { motion } from "framer-motion";
import { Logo } from "@/components/Logo";

export default function InventoryDispatch() {
  const [permits] = useState(() => store.permits.list());
  const products = store.products.list();
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? "—";
  const productCode = (id: string) => products.find((p) => p.id === id)?.code ?? "—";

  return (
    <AppShell
      title="أذون الصرف"
      subtitle="إصدار وطباعة وثائق صرف البضائع"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "المخازن", href: "/inventory" }, { label: "أذون الصرف" }]}
      actions={
        <Button className="gap-2"><Plus className="size-4" />إنشاء إذن جديد</Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {permits.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-6 relative overflow-hidden hover-elevate"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="size-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">إذن صرف</span>
                </div>
                <div className="font-mono text-xl font-bold tracking-tight">{p.serial}</div>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">الطالب</span>
                <span className="font-semibold text-xs">{p.requester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">القسم</span>
                <Badge variant="secondary" className="text-[10px]">{p.department}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">التاريخ</span>
                <span className="text-xs tabular-nums">{fmtDate(p.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-xs">المعتمد</span>
                <span className="text-xs">{p.approvedBy}</span>
              </div>
            </div>

            <div className="border-t border-border/40 pt-3 mb-4">
              <div className="text-[10px] font-semibold text-muted-foreground mb-2">الأصناف ({p.items.length})</div>
              <div className="space-y-1.5 max-h-32 overflow-auto">
                {p.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs glass-subtle rounded-md px-2 py-1.5">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{productName(item.productId)}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{productCode(item.productId)}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] tabular-nums">×{item.quantity}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => window.print()}>
                <Printer className="size-3.5" />
                طباعة
              </Button>
              {p.status === "pending" && (
                <Button size="sm" className="gap-1.5">
                  <CheckCircle2 className="size-3.5" />
                  اعتماد
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Printable single permit (visible on print) */}
      <div className="hidden print:block mt-8">
        {permits.slice(0, 1).map((p) => (
          <div key={p.id} className="bg-white text-black p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <Logo size={48} />
              <div className="text-right">
                <div className="text-xs">إذن صرف رقم</div>
                <div className="text-2xl font-bold">{p.serial}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 my-6 text-sm">
              <div><strong>الطالب:</strong> {p.requester}</div>
              <div><strong>القسم:</strong> {p.department}</div>
              <div><strong>التاريخ:</strong> {fmtDate(p.date)}</div>
              <div><strong>المعتمد:</strong> {p.approvedBy}</div>
            </div>
            <table className="w-full border border-black text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2">م</th>
                  <th className="border border-black p-2">الكود</th>
                  <th className="border border-black p-2">الصنف</th>
                  <th className="border border-black p-2">الكمية</th>
                </tr>
              </thead>
              <tbody>
                {p.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="border border-black p-2 text-center">{idx + 1}</td>
                    <td className="border border-black p-2">{productCode(it.productId)}</td>
                    <td className="border border-black p-2">{productName(it.productId)}</td>
                    <td className="border border-black p-2 text-center">{it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-12 grid grid-cols-3 gap-8 text-xs text-center">
              <div><div className="border-t border-black pt-2 mt-12">توقيع الطالب</div></div>
              <div><div className="border-t border-black pt-2 mt-12">توقيع أمين المخزن</div></div>
              <div><div className="border-t border-black pt-2 mt-12">توقيع المدير</div></div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "issued" }) {
  if (status === "issued") {
    return <Badge className="bg-emerald-500/15 text-emerald-400 border-0 gap-1 text-[10px]"><CheckCircle2 className="size-3" />تم الصرف</Badge>;
  }
  if (status === "approved") {
    return <Badge className="bg-sky-500/15 text-sky-400 border-0 gap-1 text-[10px]"><Clock className="size-3" />معتمد</Badge>;
  }
  return <Badge className="bg-amber-500/15 text-amber-400 border-0 gap-1 text-[10px]"><Hourglass className="size-3" />بانتظار الاعتماد</Badge>;
}
