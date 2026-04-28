import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, FileSpreadsheet } from "lucide-react";
import { store } from "@/lib/storage";
import { fmtCurrency } from "@/lib/format";
import { motion } from "framer-motion";

export default function AccountingReports() {
  const accounts = store.accounts.list();

  const assets = accounts.filter((a) => a.type === "asset");
  const liabilities = accounts.filter((a) => a.type === "liability");
  const equity = accounts.filter((a) => a.type === "equity");
  const revenues = accounts.filter((a) => a.type === "revenue");
  const expenses = accounts.filter((a) => a.type === "expense");

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiab = liabilities.reduce((s, a) => s + a.balance, 0);
  const totalEquity = equity.reduce((s, a) => s + a.balance, 0);
  const totalRev = revenues.reduce((s, a) => s + a.balance, 0);
  const totalExp = expenses.reduce((s, a) => s + a.balance, 0);
  const netIncome = totalRev - totalExp;

  return (
    <AppShell
      title="التقارير المالية"
      subtitle="ميزانية عمومية وقائمة دخل وميزان مراجعة"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الحسابات", href: "/accounting" }, { label: "التقارير" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => window.print()}>
            <Printer className="size-4" /> طباعة
          </Button>
          <Button className="gap-2"><FileSpreadsheet className="size-4" /> تصدير</Button>
        </div>
      }
    >
      <Tabs defaultValue="balance" className="w-full">
        <TabsList className="bg-background/40 mb-4">
          <TabsTrigger value="balance">الميزانية العمومية</TabsTrigger>
          <TabsTrigger value="income">قائمة الدخل</TabsTrigger>
          <TabsTrigger value="trial">ميزان المراجعة</TabsTrigger>
        </TabsList>

        <TabsContent value="balance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ReportCard title="الأصول" rows={assets} total={totalAssets} accent="primary" />
            <div className="space-y-4">
              <ReportCard title="الخصوم" rows={liabilities} total={totalLiab} accent="amber" />
              <ReportCard title="حقوق الملكية" rows={equity} total={totalEquity} accent="accent" />
              <div className="glass-strong rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="font-bold">إجمالي الخصوم وحقوق الملكية</span>
                  <span className="text-xl font-bold tabular-nums gradient-text">
                    {fmtCurrency(totalLiab + totalEquity)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="income">
          <div className="glass rounded-2xl p-6 max-w-2xl">
            <h3 className="text-lg font-bold mb-1">قائمة الدخل</h3>
            <p className="text-xs text-muted-foreground mb-4">للفترة المنتهية في {new Date().toLocaleDateString("ar-EG")}</p>

            <div className="space-y-1 mb-4">
              <SectionTitle>الإيرادات</SectionTitle>
              {revenues.map((a) => (
                <Row key={a.code} code={a.code} name={a.name} amount={a.balance} />
              ))}
              <SectionTotal label="إجمالي الإيرادات" amount={totalRev} accent="positive" />
            </div>

            <div className="space-y-1 mb-4">
              <SectionTitle>المصروفات</SectionTitle>
              {expenses.map((a) => (
                <Row key={a.code} code={a.code} name={a.name} amount={a.balance} />
              ))}
              <SectionTotal label="إجمالي المصروفات" amount={totalExp} accent="negative" />
            </div>

            <div className="border-t-2 border-primary pt-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg">صافي الربح</span>
                <span className="text-2xl font-bold tabular-nums gradient-text">{fmtCurrency(netIncome)}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trial">
          <div className="glass rounded-2xl p-5">
            <h3 className="text-lg font-bold mb-4">ميزان المراجعة</h3>
            <div className="rounded-xl overflow-hidden border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 text-xs">
                    <th className="text-right p-3">الكود</th>
                    <th className="text-right p-3">اسم الحساب</th>
                    <th className="text-right p-3">النوع</th>
                    <th className="text-right p-3">مدين</th>
                    <th className="text-right p-3">دائن</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a, i) => {
                    const isDebit = a.type === "asset" || a.type === "expense";
                    return (
                      <motion.tr
                        key={a.code}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/30"
                      >
                        <td className="p-3 font-mono text-xs text-primary">{a.code}</td>
                        <td className="p-3 font-medium text-sm">{a.name}</td>
                        <td className="p-3 text-xs text-muted-foreground">{TYPE_LABEL[a.type]}</td>
                        <td className="p-3 tabular-nums text-emerald-400 font-semibold">{isDebit ? fmtCurrency(a.balance) : "—"}</td>
                        <td className="p-3 tabular-nums text-amber-400 font-semibold">{!isDebit ? fmtCurrency(a.balance) : "—"}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-primary/10 font-bold">
                    <td className="p-3" colSpan={3}>الإجمالي</td>
                    <td className="p-3 tabular-nums text-emerald-400">{fmtCurrency(totalAssets + totalExp)}</td>
                    <td className="p-3 tabular-nums text-amber-400">{fmtCurrency(totalLiab + totalEquity + totalRev)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

const TYPE_LABEL: Record<string, string> = {
  asset: "أصول", liability: "خصوم", equity: "حقوق ملكية", revenue: "إيرادات", expense: "مصروفات",
};

function ReportCard({ title, rows, total, accent }: {
  title: string;
  rows: { code: string; name: string; balance: number }[];
  total: number;
  accent: "primary" | "amber" | "accent";
}) {
  const totalColor = accent === "primary" ? "text-primary" : accent === "amber" ? "text-amber-400" : "text-accent";
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-bold mb-3">{title}</h3>
      <div className="space-y-1">
        {rows.map((r) => (
          <Row key={r.code} code={r.code} name={r.name} amount={r.balance} />
        ))}
      </div>
      <div className="border-t border-border/40 pt-3 mt-3 flex items-center justify-between">
        <span className="font-semibold text-sm">إجمالي {title}</span>
        <span className={`font-bold tabular-nums ${totalColor}`}>{fmtCurrency(total)}</span>
      </div>
    </div>
  );
}

function Row({ code, name, amount }: { code: string; name: string; amount: number }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-muted/30">
      <span className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">{code}</span>
        <span>{name}</span>
      </span>
      <span className="tabular-nums">{fmtCurrency(amount)}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-2 pb-1">{children}</div>;
}

function SectionTotal({ label, amount, accent }: { label: string; amount: number; accent?: "positive" | "negative" }) {
  return (
    <div className={`flex items-center justify-between font-semibold border-t border-border/40 pt-2 mt-1 ${
      accent === "positive" ? "text-emerald-400" : accent === "negative" ? "text-amber-400" : ""
    }`}>
      <span className="text-sm">{label}</span>
      <span className="tabular-nums">{fmtCurrency(amount)}</span>
    </div>
  );
}
