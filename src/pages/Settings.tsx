import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Palette, Database, Bell, RotateCcw, Save } from "lucide-react";
import { resetSeed, store } from "@/lib/storage";
import { useCurrentUser } from "@/lib/auth";

export default function Settings() {
  const me = useCurrentUser();
  const [theme, setTheme] = useState(store.theme.get());
  const [companyName, setCompanyName] = useState("شركة Orbit للحلول التقنية");
  const [taxId, setTaxId] = useState("100-200-300");
  const [currency, setCurrency] = useState("EGP");

  const applyTheme = (t: "dark" | "light") => {
    setTheme(t);
    document.documentElement.classList.toggle("light", t === "light");
    document.documentElement.classList.toggle("dark", t === "dark");
    store.theme.set(t);
  };

  const reset = () => {
    if (confirm("هل أنت متأكد من إعادة ضبط البيانات التجريبية؟ سيتم حذف جميع التعديلات.")) {
      resetSeed();
      window.location.reload();
    }
  };

  return (
    <AppShell
      title="الإعدادات"
      subtitle="تخصيص النظام وبيانات الشركة"
      breadcrumbs={[{ label: "الرئيسية", href: "/dashboard" }, { label: "الإعدادات" }]}
    >
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="bg-background/40 mb-4">
          <TabsTrigger value="company" className="gap-2"><Building2 className="size-4" />بيانات الشركة</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2"><Palette className="size-4" />المظهر</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="size-4" />الإشعارات</TabsTrigger>
          <TabsTrigger value="data" className="gap-2"><Database className="size-4" />البيانات</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <div className="glass rounded-2xl p-6 max-w-2xl">
            <h3 className="font-bold mb-4 text-lg">بيانات الشركة</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">اسم الشركة</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">الرقم الضريبي</Label>
                  <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">العملة الافتراضية</Label>
                  <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">العنوان</Label>
                <Input defaultValue="القاهرة، مصر — التجمع الخامس" />
              </div>
              <Button className="gap-2"><Save className="size-4" />حفظ التغييرات</Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="appearance">
          <div className="glass rounded-2xl p-6 max-w-2xl">
            <h3 className="font-bold mb-4 text-lg">المظهر العام</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs mb-2 block">السمة</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => applyTheme("dark")}
                    className={`glass-subtle rounded-xl p-4 text-right hover-elevate ${theme === "dark" ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className="size-10 rounded-lg bg-slate-900 mb-2"></div>
                    <div className="font-semibold text-sm">السمة الداكنة</div>
                    <div className="text-xs text-muted-foreground">للاستخدام الليلي والبيئات قليلة الإضاءة</div>
                  </button>
                  <button
                    onClick={() => applyTheme("light")}
                    className={`glass-subtle rounded-xl p-4 text-right hover-elevate ${theme === "light" ? "ring-2 ring-primary" : ""}`}
                  >
                    <div className="size-10 rounded-lg bg-amber-50 border border-amber-200 mb-2"></div>
                    <div className="font-semibold text-sm">السمة الفاتحة</div>
                    <div className="text-xs text-muted-foreground">للاستخدام النهاري والمكاتب</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="glass rounded-2xl p-6 max-w-2xl">
            <h3 className="font-bold mb-4 text-lg">إعدادات الإشعارات</h3>
            <div className="space-y-3">
              {[
                { label: "إشعارات أذون الصرف الجديدة", on: true },
                { label: "تنبيه عند وصول الأصناف للحد الأدنى", on: true },
                { label: "إشعار عند طلبات الإجازات", on: true },
                { label: "تذكير الرواتب الشهرية", on: false },
                { label: "تنبيهات نهاية الفترة المحاسبية", on: true },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between glass-subtle rounded-xl p-4">
                  <span className="text-sm font-medium">{n.label}</span>
                  <Switch defaultChecked={n.on} />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="glass rounded-2xl p-6 max-w-2xl">
            <h3 className="font-bold mb-4 text-lg">إدارة البيانات</h3>
            <div className="space-y-4">
              <div className="glass-subtle rounded-xl p-4">
                <div className="font-semibold text-sm mb-1">المستخدم الحالي</div>
                <div className="text-xs text-muted-foreground">{me?.name} ({me?.username})</div>
              </div>
              <div className="border border-destructive/30 bg-destructive/5 rounded-xl p-4">
                <div className="font-semibold text-sm text-destructive mb-1">إعادة ضبط البيانات</div>
                <div className="text-xs text-muted-foreground mb-3">
                  سيتم حذف جميع التعديلات وإعادة تحميل البيانات التجريبية الافتراضية.
                </div>
                <Button variant="destructive" onClick={reset} className="gap-2">
                  <RotateCcw className="size-4" />
                  إعادة ضبط البيانات التجريبية
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
