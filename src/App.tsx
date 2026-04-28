import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import InventoryTransactions from "@/pages/InventoryTransactions";
import InventoryDispatch from "@/pages/InventoryDispatch";
import Accounting from "@/pages/Accounting";
import AccountingJournal from "@/pages/AccountingJournal";
import AccountingLedger from "@/pages/AccountingLedger";
import AccountingReports from "@/pages/AccountingReports";
import HR from "@/pages/HR";
import HREmployees from "@/pages/HREmployees";
import HRAttendance from "@/pages/HRAttendance";
import HRLeaves from "@/pages/HRLeaves";
import HRPayroll from "@/pages/HRPayroll";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import DataEntry from "@/pages/DataEntry";

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ensureSeeded, store } from "@/lib/storage";
import { useCurrentUser, canAccess } from "@/lib/auth";
import { pullAll, pushAll, subscribeAll, enableSync } from "@/lib/firebase-sync";
import type { Role } from "@/lib/types";

const queryClient = new QueryClient();

function Protected({ children, module }: { children: React.ReactNode; module?: string }) {
  const user = useCurrentUser();
  if (!user) return <Redirect to="/login" />;
  if (module && !canAccess(user.role, module)) {
    return <Redirect to={user.role === "data-entry" ? "/data-entry" : "/dashboard"} />;
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/" component={() => <Redirect to="/dashboard" />} />
      <Route path="/dashboard">{() => <Protected module="dashboard"><Dashboard /></Protected>}</Route>

      <Route path="/inventory">{() => <Protected module="inventory"><Inventory /></Protected>}</Route>
      <Route path="/inventory/transactions">{() => <Protected module="inventory"><InventoryTransactions /></Protected>}</Route>
      <Route path="/inventory/dispatch">{() => <Protected module="inventory"><InventoryDispatch /></Protected>}</Route>

      <Route path="/accounting">{() => <Protected module="accounting"><Accounting /></Protected>}</Route>
      <Route path="/accounting/journal">{() => <Protected module="accounting"><AccountingJournal /></Protected>}</Route>
      <Route path="/accounting/ledger">{() => <Protected module="accounting"><AccountingLedger /></Protected>}</Route>
      <Route path="/accounting/reports">{() => <Protected module="accounting"><AccountingReports /></Protected>}</Route>

      <Route path="/hr">{() => <Protected module="hr"><HR /></Protected>}</Route>
      <Route path="/hr/employees">{() => <Protected module="hr"><HREmployees /></Protected>}</Route>
      <Route path="/hr/attendance">{() => <Protected module="hr"><HRAttendance /></Protected>}</Route>
      <Route path="/hr/leaves">{() => <Protected module="hr"><HRLeaves /></Protected>}</Route>
      <Route path="/hr/payroll">{() => <Protected module="hr"><HRPayroll /></Protected>}</Route>

      <Route path="/users">{() => <Protected module="users"><Users /></Protected>}</Route>
      <Route path="/reports">{() => <Protected module="reports"><Reports /></Protected>}</Route>
      <Route path="/settings">{() => <Protected module="settings"><Settings /></Protected>}</Route>
      <Route path="/data-entry">{() => <Protected module="data-entry"><DataEntry /></Protected>}</Route>

      <Route>{() => <Redirect to="/dashboard" />}</Route>
    </Switch>
  );
}

function BootScreen({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function App() {
  const [ready, setReady] = useState(false);
  const [bootMsg, setBootMsg] = useState("جاري الاتصال بالخادم...");

  useEffect(() => {
    const t = store.theme.get();
    document.documentElement.classList.toggle("light", t === "light");
    document.documentElement.classList.toggle("dark", t === "dark");

    (async () => {
      try {
        setBootMsg("جاري تحميل البيانات من السحابة...");
        const found = await pullAll();
        if (found) {
          localStorage.setItem("erp.seeded.v1", "yes");
        } else {
          setBootMsg("جاري تهيئة البيانات الأولية...");
          ensureSeeded();
          await pushAll();
        }
        enableSync();
        subscribeAll();
      } catch (err) {
        console.warn("Firebase sync unavailable, using local data only", err);
        ensureSeeded();
      } finally {
        setReady(true);
      }
    })();
  }, []);

  if (!ready) {
    return (
      <>
        <AnimatedBackground />
        <BootScreen message={bootMsg} />
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AnimatedBackground />
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
