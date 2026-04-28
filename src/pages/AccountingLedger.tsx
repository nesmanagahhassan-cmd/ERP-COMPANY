import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { store } from "@/lib/storage";
import { fmtCurrency, fmtDate } from "@/lib/format";
import { motion } from "framer-motion";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  asset: "أصول",
  liability: "خصوم",
  equity: "حقوق ملكية",
  revenue: "إيرادات",
  expense: "مصروفات",
};

export default function AccountingLedger() {
  const accounts = store.accounts.list();
  const journal = store.journal.list();
  const [selected, setSelected] = useState<string>(accounts[0]?.code || "");

  const account = accounts.find((a) => a.code === selected);

  const transactions = useMemo(() => {
    const txs: { date: string; serial: string; description: string; debit: number; credit: number; balance: number }[] = [];
    let runningBalance = account?.balance || 0;
    // start from balance, work backwards by collecting all matching lines
    const matches = journal
      .flatMap((e) => e.lines.map((l) => ({ entry: e, line: l })))
      .filter(({ line }) => line.account === selected)
      .sort((a, b) => a.entry.date.localeCompare(b.entry.date));

    let bal = 0;
    for (const { entry, line } of matches) {
      if (account?.type === "asset" || account?.type === "expense") {
        bal += line.debit - line.credit;
      } else {
        bal += line.credit - line.debit;
      }
      txs.push({
        date: entry.date,
        serial: entry.serial,
        description: entry.description,
        debit: line.debit,
        credit: line.credit,
        balance: bal,
      });
    }
    return txs.reverse();
  }, [selected, journal, account]);

  const totalDebit = transactions.reduce((s, t) => s + t.debit, 0);
  const totalCredit = transactions.reduce((s, t) => s + t.credit, 0);

  return (
    <AppShell
      title="دفتر الأستاذ"
      subtitle="حركة الحسابات الفردية وأرصدتها"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الحسابات", href: "/accounting" }, { label: "دفتر الأستاذ" }]}
    >
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">اختر الحساب</label>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="bg-background/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.code} value={a.code}>
                    <span className="font-mono text-xs ml-2">{a.code}</span> {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {account && (
            <div className="flex gap-3">
              <div className="glass-subtle rounded-xl px-4 py-2.5">
                <div className="text-[10px] text-muted-foreground">النوع</div>
                <Badge variant="secondary" className="mt-0.5">{TYPE_LABEL[account.type]}</Badge>
              </div>
              <div className="glass-subtle rounded-xl px-4 py-2.5">
                <div className="text-[10px] text-muted-foreground">الرصيد الافتتاحي</div>
                <div className="font-bold tabular-nums text-sm">{fmtCurrency(account.balance)}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/15 grid place-items-center text-emerald-400">
              <ArrowDownCircle className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">إجمالي المدين</div>
              <div className="text-xl font-bold tabular-nums">{fmtCurrency(totalDebit)}</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/15 grid place-items-center text-amber-400">
              <ArrowUpCircle className="size-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">إجمالي الدائن</div>
              <div className="text-xl font-bold tabular-nums">{fmtCurrency(totalCredit)}</div>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <div className="text-xs text-muted-foreground">الرصيد الحالي</div>
          <div className="text-2xl font-bold tabular-nums gradient-text">
            {fmtCurrency((account?.balance || 0) + (account?.type === "asset" || account?.type === "expense" ? totalDebit - totalCredit : totalCredit - totalDebit))}
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="rounded-xl overflow-hidden border border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">رقم القيد</TableHead>
                <TableHead className="text-right">البيان</TableHead>
                <TableHead className="text-right">مدين</TableHead>
                <TableHead className="text-right">دائن</TableHead>
                <TableHead className="text-right">الرصيد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/30"
                >
                  <TableCell className="text-xs tabular-nums">{fmtDate(t.date)}</TableCell>
                  <TableCell className="font-mono text-xs text-primary font-bold">{t.serial}</TableCell>
                  <TableCell className="text-sm">{t.description}</TableCell>
                  <TableCell className="tabular-nums text-xs text-emerald-400 font-semibold">{t.debit ? fmtCurrency(t.debit) : "—"}</TableCell>
                  <TableCell className="tabular-nums text-xs text-amber-400 font-semibold">{t.credit ? fmtCurrency(t.credit) : "—"}</TableCell>
                  <TableCell className="tabular-nums text-xs font-bold">{fmtCurrency(t.balance)}</TableCell>
                </motion.tr>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    لا توجد حركات على هذا الحساب
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
