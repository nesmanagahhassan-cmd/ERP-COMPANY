import { useState } from "react";
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
import { Plus, Trash2, Shield, ShieldCheck } from "lucide-react";
import { store, uid } from "@/lib/storage";
import { ROLE_LABEL, useCurrentUser } from "@/lib/auth";
import type { User, Role } from "@/lib/types";
import { fmtDate } from "@/lib/format";
import { motion } from "framer-motion";

export default function Users() {
  const me = useCurrentUser();
  const [users, setUsers] = useState<User[]>(() => store.users.list());
  const [open, setOpen] = useState(false);

  const isAdmin = me?.role === "admin";

  const add = (u: Partial<User>) => {
    const nu: User = {
      id: uid("u"),
      username: u.username!,
      password: u.password!,
      name: u.name!,
      role: u.role as Role,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const next = [nu, ...users];
    setUsers(next);
    store.users.save(next);
    setOpen(false);
  };

  const remove = (id: string) => {
    if (id === me?.id) return;
    const next = users.filter((u) => u.id !== id);
    setUsers(next);
    store.users.save(next);
  };

  return (
    <AppShell
      title="إدارة المستخدمين"
      subtitle="حسابات الدخول وصلاحيات الأقسام"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "المستخدمون" }]}
      actions={
        isAdmin ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="size-4" />مستخدم جديد</Button></DialogTrigger>
            <UserDialog onSubmit={add} />
          </Dialog>
        ) : null
      }
    >
      {!isAdmin && (
        <div className="glass-subtle border border-amber-500/30 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <Shield className="size-5 text-amber-400" />
          <div className="text-sm">إدارة المستخدمين متاحة فقط للمدير. يمكنك مشاهدة القائمة دون التعديل.</div>
        </div>
      )}

      <div className="glass rounded-2xl p-5">
        <div className="rounded-xl overflow-hidden border border-border/40">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right">المستخدم</TableHead>
                <TableHead className="text-right">اسم الدخول</TableHead>
                <TableHead className="text-right">الصلاحية</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/30"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="size-9 rounded-lg bg-primary/15 grid place-items-center text-primary font-bold text-xs">
                        {u.name.slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{u.name}</div>
                        {u.id === me?.id && <div className="text-[10px] text-primary">(أنت)</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{u.username}</TableCell>
                  <TableCell>
                    <Badge className="text-[10px] gap-1" variant={u.role === "admin" ? "default" : "secondary"}>
                      {u.role === "admin" && <ShieldCheck className="size-3" />}
                      {ROLE_LABEL[u.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">{fmtDate(u.createdAt)}</TableCell>
                  <TableCell>
                    {isAdmin && u.id !== me?.id && (
                      <Button variant="ghost" size="icon" onClick={() => remove(u.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
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

function UserDialog({ onSubmit }: { onSubmit: (u: Partial<User>) => void }) {
  const [form, setForm] = useState<Partial<User>>({ username: "", password: "", name: "", role: "data-entry" });
  return (
    <DialogContent className="glass-strong">
      <DialogHeader>
        <DialogTitle>إضافة مستخدم جديد</DialogTitle>
        <DialogDescription>سيتمكن المستخدم من الدخول بالصلاحية المحددة</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">الاسم الكامل</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">اسم الدخول</Label>
          <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">كلمة المرور</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs">الصلاحية</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={() => onSubmit(form)} disabled={!form.name || !form.username || !form.password}>إنشاء المستخدم</Button>
      </DialogFooter>
    </DialogContent>
  );
}
