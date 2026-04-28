import type {
  User, Product, StockMovement, DispatchPermit,
  JournalEntry, Account, Employee, AttendanceRecord,
  LeaveRequest, PayrollEntry, Notification,
} from "./types";

const today = new Date().toISOString().slice(0, 10);
const monthNow = new Date().toISOString().slice(0, 7);

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function seed() {
  const users: User[] = [
    { id: "u_admin", username: "admin", password: "admin123", role: "admin", name: "أحمد عبد الرحمن", createdAt: daysAgo(120) },
    { id: "u_inv", username: "warehouse", password: "warehouse123", role: "inventory", name: "محمود سيد", createdAt: daysAgo(60) },
    { id: "u_acc", username: "finance", password: "finance123", role: "accounting", name: "منى الشريف", createdAt: daysAgo(50) },
    { id: "u_hr", username: "hr", password: "hr123", role: "hr", name: "سلمى نبيل", createdAt: daysAgo(40) },
    { id: "u_de", username: "entry", password: "entry123", role: "data-entry", name: "كريم فؤاد", createdAt: daysAgo(20) },
    { id: "u_admin2", username: "ceo", password: "ceo123", role: "admin", name: "د. هشام الجمل", createdAt: daysAgo(180) },
  ];

  const products: Product[] = [
    { id: "p1", code: "EL-1001", name: "حاسوب محمول HP ProBook", category: "إلكترونيات", quantity: 28, minQuantity: 10, price: 18500, unit: "قطعة", status: "active" },
    { id: "p2", code: "EL-1002", name: "شاشة LG 27 بوصة", category: "إلكترونيات", quantity: 12, minQuantity: 8, price: 5400, unit: "قطعة", status: "active" },
    { id: "p3", code: "EL-1003", name: "طابعة كانون ليزر", category: "إلكترونيات", quantity: 6, minQuantity: 8, price: 3200, unit: "قطعة", status: "active" },
    { id: "p4", code: "FR-2001", name: "كرسي مكتبي طبي", category: "أثاث", quantity: 45, minQuantity: 20, price: 1850, unit: "قطعة", status: "active" },
    { id: "p5", code: "FR-2002", name: "مكتب تنفيذي خشبي", category: "أثاث", quantity: 18, minQuantity: 10, price: 6700, unit: "قطعة", status: "active" },
    { id: "p6", code: "ST-3001", name: "ورق تصوير A4", category: "قرطاسية", quantity: 320, minQuantity: 100, price: 145, unit: "رزمة", status: "active" },
    { id: "p7", code: "ST-3002", name: "أقلام جاف زرقاء", category: "قرطاسية", quantity: 850, minQuantity: 200, price: 8, unit: "قطعة", status: "active" },
    { id: "p8", code: "ST-3003", name: "ملفات بلاستيك", category: "قرطاسية", quantity: 4, minQuantity: 50, price: 25, unit: "قطعة", status: "active" },
    { id: "p9", code: "RM-4001", name: "حديد تسليح 16 ملم", category: "مواد خام", quantity: 2400, minQuantity: 500, price: 42, unit: "كجم", status: "active" },
    { id: "p10", code: "RM-4002", name: "أسمنت بورتلاندي", category: "مواد خام", quantity: 180, minQuantity: 100, price: 95, unit: "شيكارة", status: "active" },
    { id: "p11", code: "PK-5001", name: "كرتون تغليف كبير", category: "تغليف", quantity: 1250, minQuantity: 500, price: 12, unit: "قطعة", status: "active" },
    { id: "p12", code: "PK-5002", name: "شريط لاصق عريض", category: "تغليف", quantity: 95, minQuantity: 50, price: 18, unit: "لفة", status: "active" },
    { id: "p13", code: "TL-6001", name: "مفك كهربائي بوش", category: "عدد ومعدات", quantity: 14, minQuantity: 5, price: 2400, unit: "قطعة", status: "active" },
    { id: "p14", code: "TL-6002", name: "سلم ألومنيوم 5 درجات", category: "عدد ومعدات", quantity: 7, minQuantity: 3, price: 950, unit: "قطعة", status: "active" },
    { id: "p15", code: "EL-1004", name: "كاميرا مراقبة Hikvision", category: "إلكترونيات", quantity: 22, minQuantity: 10, price: 1750, unit: "قطعة", status: "active" },
    { id: "p16", code: "FR-2003", name: "خزانة معدنية 4 أدراج", category: "أثاث", quantity: 11, minQuantity: 5, price: 2800, unit: "قطعة", status: "active" },
  ];

  const movements: StockMovement[] = [
    { id: "m1", productId: "p1", type: "in", quantity: 10, date: daysAgo(15), reference: "PO-2025-104", notes: "توريد من الموزع الرئيسي" },
    { id: "m2", productId: "p2", type: "out", quantity: 4, date: daysAgo(10), reference: "DSP-001", notes: "إذن صرف لقسم تقنية المعلومات" },
    { id: "m3", productId: "p9", type: "in", quantity: 600, date: daysAgo(8), reference: "PO-2025-105", notes: "توريد حديد - مشروع المقطم" },
    { id: "m4", productId: "p6", type: "out", quantity: 25, date: daysAgo(5), reference: "DSP-002", notes: "ورق للإدارة المالية" },
    { id: "m5", productId: "p4", type: "in", quantity: 20, date: daysAgo(3), reference: "PO-2025-106", notes: "تجديد كراسي المكاتب" },
    { id: "m6", productId: "p7", type: "out", quantity: 50, date: daysAgo(2), reference: "DSP-003", notes: "صرف للأقسام" },
    { id: "m7", productId: "p15", type: "in", quantity: 12, date: daysAgo(1), reference: "PO-2025-107", notes: "ترقية نظام المراقبة" },
    { id: "m8", productId: "p3", type: "out", quantity: 2, date: today, reference: "DSP-004", notes: "طابعة لفرع الإسكندرية" },
  ];

  const permits: DispatchPermit[] = [
    {
      id: "dp1", serial: "DSP-001", requester: "محمد حسن", department: "تقنية المعلومات",
      items: [{ productId: "p2", quantity: 4 }, { productId: "p1", quantity: 2 }],
      date: daysAgo(10), approvedBy: "أحمد عبد الرحمن", status: "issued",
    },
    {
      id: "dp2", serial: "DSP-002", requester: "فاطمة الزهراء", department: "المالية",
      items: [{ productId: "p6", quantity: 25 }, { productId: "p7", quantity: 30 }],
      date: daysAgo(5), approvedBy: "أحمد عبد الرحمن", status: "issued",
    },
    {
      id: "dp3", serial: "DSP-003", requester: "خالد إبراهيم", department: "المبيعات",
      items: [{ productId: "p7", quantity: 50 }, { productId: "p11", quantity: 100 }],
      date: daysAgo(2), approvedBy: "أحمد عبد الرحمن", status: "issued",
    },
    {
      id: "dp4", serial: "DSP-004", requester: "سارة أحمد", department: "فرع الإسكندرية",
      items: [{ productId: "p3", quantity: 2 }],
      date: today, approvedBy: "د. هشام الجمل", status: "approved",
    },
    {
      id: "dp5", serial: "DSP-005", requester: "عمر خليل", department: "المخازن",
      items: [{ productId: "p13", quantity: 3 }],
      date: today, approvedBy: "—", status: "pending",
    },
  ];

  const accounts: Account[] = [
    { code: "1010", name: "النقدية بالخزينة", type: "asset", balance: 285000 },
    { code: "1020", name: "البنك الأهلي - حساب جاري", type: "asset", balance: 1450000 },
    { code: "1030", name: "العملاء", type: "asset", balance: 680000 },
    { code: "1040", name: "المخزون", type: "asset", balance: 2150000 },
    { code: "1050", name: "أصول ثابتة", type: "asset", balance: 3800000 },
    { code: "2010", name: "الموردون", type: "liability", balance: 420000 },
    { code: "2020", name: "قروض قصيرة الأجل", type: "liability", balance: 350000 },
    { code: "3010", name: "رأس المال", type: "equity", balance: 5000000 },
    { code: "3020", name: "الأرباح المحتجزة", type: "equity", balance: 1245000 },
    { code: "4010", name: "إيرادات المبيعات", type: "revenue", balance: 4850000 },
    { code: "4020", name: "إيرادات الخدمات", type: "revenue", balance: 920000 },
    { code: "5010", name: "تكلفة البضاعة المباعة", type: "expense", balance: 2100000 },
    { code: "5020", name: "الرواتب والأجور", type: "expense", balance: 1180000 },
    { code: "5030", name: "إيجارات", type: "expense", balance: 240000 },
    { code: "5040", name: "كهرباء ومرافق", type: "expense", balance: 95000 },
    { code: "5050", name: "تسويق وإعلان", type: "expense", balance: 180000 },
  ];

  const journal: JournalEntry[] = [
    { id: "j1", serial: "JE-0001", date: daysAgo(28), description: "تحصيل من العميل شركة الفجر", reference: "RC-1023", lines: [{ account: "1020", debit: 85000, credit: 0 }, { account: "1030", debit: 0, credit: 85000 }] },
    { id: "j2", serial: "JE-0002", date: daysAgo(25), description: "صرف رواتب الشهر السابق", reference: "PR-09", lines: [{ account: "5020", debit: 245000, credit: 0 }, { account: "1020", debit: 0, credit: 245000 }] },
    { id: "j3", serial: "JE-0003", date: daysAgo(22), description: "بيع آجل للعميل المهندسون المتحدون", reference: "INV-3401", lines: [{ account: "1030", debit: 142000, credit: 0 }, { account: "4010", debit: 0, credit: 142000 }] },
    { id: "j4", serial: "JE-0004", date: daysAgo(20), description: "شراء مخزون من المورد ألفا", reference: "PO-104", lines: [{ account: "1040", debit: 320000, credit: 0 }, { account: "2010", debit: 0, credit: 320000 }] },
    { id: "j5", serial: "JE-0005", date: daysAgo(18), description: "سداد فاتورة كهرباء", reference: "EXP-77", lines: [{ account: "5040", debit: 18500, credit: 0 }, { account: "1010", debit: 0, credit: 18500 }] },
    { id: "j6", serial: "JE-0006", date: daysAgo(15), description: "حملة تسويق رقمي", reference: "MKT-12", lines: [{ account: "5050", debit: 35000, credit: 0 }, { account: "1020", debit: 0, credit: 35000 }] },
    { id: "j7", serial: "JE-0007", date: daysAgo(12), description: "تحصيل دفعة مقدمة من عميل جديد", reference: "RC-1024", lines: [{ account: "1020", debit: 60000, credit: 0 }, { account: "4020", debit: 0, credit: 60000 }] },
    { id: "j8", serial: "JE-0008", date: daysAgo(10), description: "إيجار المقر الرئيسي", reference: "EXP-78", lines: [{ account: "5030", debit: 40000, credit: 0 }, { account: "1020", debit: 0, credit: 40000 }] },
    { id: "j9", serial: "JE-0009", date: daysAgo(8), description: "بيع نقدي - فرع الإسكندرية", reference: "INV-3402", lines: [{ account: "1010", debit: 28000, credit: 0 }, { account: "4010", debit: 0, credit: 28000 }] },
    { id: "j10", serial: "JE-0010", date: daysAgo(7), description: "تسوية مخزون شهري", reference: "ADJ-04", lines: [{ account: "5010", debit: 12500, credit: 0 }, { account: "1040", debit: 0, credit: 12500 }] },
    { id: "j11", serial: "JE-0011", date: daysAgo(5), description: "سداد دفعة للمورد بيتا", reference: "PAY-44", lines: [{ account: "2010", debit: 75000, credit: 0 }, { account: "1020", debit: 0, credit: 75000 }] },
    { id: "j12", serial: "JE-0012", date: daysAgo(3), description: "بيع آجل لشركة المنارة", reference: "INV-3403", lines: [{ account: "1030", debit: 218000, credit: 0 }, { account: "4010", debit: 0, credit: 218000 }] },
    { id: "j13", serial: "JE-0013", date: daysAgo(2), description: "شراء قرطاسية مكتبية", reference: "PO-108", lines: [{ account: "1040", debit: 8500, credit: 0 }, { account: "1010", debit: 0, credit: 8500 }] },
    { id: "j14", serial: "JE-0014", date: today, description: "تحصيل نقدي - عميل تجزئة", reference: "RC-1025", lines: [{ account: "1010", debit: 14500, credit: 0 }, { account: "4010", debit: 0, credit: 14500 }] },
    { id: "j15", serial: "JE-0015", date: today, description: "قيد عمولة مبيعات", reference: "ADJ-05", lines: [{ account: "5020", debit: 22000, credit: 0 }, { account: "2010", debit: 0, credit: 22000 }] },
  ];

  const employees: Employee[] = [
    { id: "e1", code: "EMP-001", name: "أحمد عبد الرحمن", department: "الإدارة العليا", position: "المدير التنفيذي", hireDate: "2018-03-15", salary: 38000, status: "active", email: "ahmed@orbit.sa", phone: "+201001234567" },
    { id: "e2", code: "EMP-002", name: "د. هشام الجمل", department: "الإدارة العليا", position: "رئيس مجلس الإدارة", hireDate: "2015-01-10", salary: 52000, status: "active", email: "hisham@orbit.sa", phone: "+201001234568" },
    { id: "e3", code: "EMP-003", name: "منى الشريف", department: "المحاسبة", position: "المدير المالي", hireDate: "2019-06-20", salary: 24000, status: "active", email: "mona@orbit.sa", phone: "+201001234569" },
    { id: "e4", code: "EMP-004", name: "سلمى نبيل", department: "الموارد البشرية", position: "مدير الموارد البشرية", hireDate: "2020-02-12", salary: 21000, status: "active", email: "salma@orbit.sa", phone: "+201001234570" },
    { id: "e5", code: "EMP-005", name: "محمود سيد", department: "المخازن", position: "أمين المخازن", hireDate: "2020-08-01", salary: 12000, status: "active", email: "mahmoud@orbit.sa", phone: "+201001234571" },
    { id: "e6", code: "EMP-006", name: "كريم فؤاد", department: "تقنية المعلومات", position: "مهندس برمجيات", hireDate: "2021-04-18", salary: 18000, status: "active", email: "karim@orbit.sa", phone: "+201001234572" },
    { id: "e7", code: "EMP-007", name: "نور الهدى عمر", department: "المبيعات", position: "مدير المبيعات", hireDate: "2019-11-05", salary: 22000, status: "active", email: "nour@orbit.sa", phone: "+201001234573" },
    { id: "e8", code: "EMP-008", name: "خالد إبراهيم", department: "المبيعات", position: "مندوب مبيعات أول", hireDate: "2022-01-20", salary: 9500, status: "active", email: "khaled@orbit.sa", phone: "+201001234574" },
    { id: "e9", code: "EMP-009", name: "فاطمة الزهراء", department: "المحاسبة", position: "محاسب أول", hireDate: "2021-09-12", salary: 11000, status: "active", email: "fatma@orbit.sa", phone: "+201001234575" },
    { id: "e10", code: "EMP-010", name: "محمد حسن", department: "تقنية المعلومات", position: "مدير قسم", hireDate: "2018-07-08", salary: 26000, status: "active", email: "mhassan@orbit.sa", phone: "+201001234576" },
    { id: "e11", code: "EMP-011", name: "سارة أحمد", department: "المبيعات", position: "مندوب مبيعات", hireDate: "2023-03-15", salary: 8500, status: "on-leave", email: "sara@orbit.sa", phone: "+201001234577" },
    { id: "e12", code: "EMP-012", name: "عمر خليل", department: "المخازن", position: "مساعد مخازن", hireDate: "2022-06-01", salary: 7500, status: "active", email: "omar@orbit.sa", phone: "+201001234578" },
  ];

  const attendance: AttendanceRecord[] = employees.map((e, i) => ({
    id: `a_${e.id}`,
    employeeId: e.id,
    date: today,
    checkIn: e.status === "on-leave" ? null : (i % 7 === 0 ? "09:32" : "08:" + String(45 + i).slice(-2)),
    checkOut: e.status === "on-leave" ? null : null,
    status: e.status === "on-leave" ? "leave" : (i % 7 === 0 ? "late" : "present"),
  }));

  const leaves: LeaveRequest[] = [
    { id: "l1", employeeId: "e11", type: "annual", startDate: daysAgo(2), endDate: daysAgo(-3), status: "approved", reason: "إجازة سنوية مخططة" },
    { id: "l2", employeeId: "e8", type: "sick", startDate: today, endDate: today, status: "pending", reason: "وعكة صحية مفاجئة" },
    { id: "l3", employeeId: "e6", type: "annual", startDate: daysAgo(-7), endDate: daysAgo(-12), status: "pending", reason: "سفر عائلي" },
    { id: "l4", employeeId: "e9", type: "emergency", startDate: daysAgo(-1), endDate: daysAgo(-1), status: "pending", reason: "ظرف عائلي طارئ" },
    { id: "l5", employeeId: "e12", type: "unpaid", startDate: daysAgo(-14), endDate: daysAgo(-19), status: "rejected", reason: "—" },
    { id: "l6", employeeId: "e7", type: "annual", startDate: daysAgo(-21), endDate: daysAgo(-26), status: "approved", reason: "إجازة سنوية" },
  ];

  const payroll: PayrollEntry[] = employees.map((e) => {
    const allowances = Math.round(e.salary * 0.18);
    const deductions = Math.round(e.salary * 0.11);
    return {
      id: `pay_${e.id}_${monthNow}`,
      employeeId: e.id,
      month: monthNow,
      baseSalary: e.salary,
      allowances,
      deductions,
      netSalary: e.salary + allowances - deductions,
    };
  });

  const notifications: Notification[] = [
    { id: "n1", title: "تنبيه مخزون منخفض", message: "الكمية الحالية لـ \"طابعة كانون ليزر\" أقل من الحد الأدنى", date: today, read: false, type: "warning" },
    { id: "n2", title: "تنبيه مخزون منخفض", message: "الكمية الحالية لـ \"ملفات بلاستيك\" أقل من الحد الأدنى بشكل حرج", date: today, read: false, type: "warning" },
    { id: "n3", title: "طلب إجازة جديد", message: "خالد إبراهيم تقدم بطلب إجازة مرضية", date: today, read: false, type: "info" },
    { id: "n4", title: "إذن صرف بانتظار الاعتماد", message: "إذن صرف DSP-005 بانتظار اعتمادك", date: today, read: false, type: "info" },
    { id: "n5", title: "تم اعتماد قيد", message: "تم اعتماد قيد رقم ADJ-05 بنجاح", date: today, read: true, type: "success" },
  ];

  return { users, products, movements, permits, accounts, journal, employees, attendance, leaves, payroll, notifications };
}
