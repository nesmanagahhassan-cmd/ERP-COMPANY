import type {
  User, Product, StockMovement, DispatchPermit,
  JournalEntry, Account, Employee, AttendanceRecord,
  LeaveRequest, PayrollEntry, Notification,
} from "./types";
import { seed } from "./mock-data";
import { schedulePush, type CollectionKey } from "./firebase-sync";

const KEYS = {
  users: "erp.users",
  products: "erp.products",
  movements: "erp.movements",
  permits: "erp.permits",
  journal: "erp.journal",
  accounts: "erp.accounts",
  employees: "erp.employees",
  attendance: "erp.attendance",
  leaves: "erp.leaves",
  payroll: "erp.payroll",
  notifications: "erp.notifications",
  session: "erp.session",
  theme: "erp.theme",
  seeded: "erp.seeded.v1",
} as const;

export type StoreKey = keyof typeof KEYS;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function syncedWrite<T>(key: string, syncKey: CollectionKey, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
  schedulePush(syncKey, value);
}

export function ensureSeeded() {
  if (localStorage.getItem(KEYS.seeded) === "yes") return;
  const data = seed();
  write(KEYS.users, data.users);
  write(KEYS.products, data.products);
  write(KEYS.movements, data.movements);
  write(KEYS.permits, data.permits);
  write(KEYS.journal, data.journal);
  write(KEYS.accounts, data.accounts);
  write(KEYS.employees, data.employees);
  write(KEYS.attendance, data.attendance);
  write(KEYS.leaves, data.leaves);
  write(KEYS.payroll, data.payroll);
  write(KEYS.notifications, data.notifications);
  localStorage.setItem(KEYS.seeded, "yes");
}

export function resetSeed() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  ensureSeeded();
  const collections: CollectionKey[] = [
    "users", "products", "movements", "permits", "journal", "accounts",
    "employees", "attendance", "leaves", "payroll", "notifications",
  ];
  collections.forEach((k) => {
    const raw = localStorage.getItem(`erp.${k}`);
    if (raw) schedulePush(k, JSON.parse(raw));
  });
}

export const store = {
  users: {
    list: () => read<User[]>(KEYS.users, []),
    save: (v: User[]) => syncedWrite(KEYS.users, "users", v),
  },
  products: {
    list: () => read<Product[]>(KEYS.products, []),
    save: (v: Product[]) => syncedWrite(KEYS.products, "products", v),
  },
  movements: {
    list: () => read<StockMovement[]>(KEYS.movements, []),
    save: (v: StockMovement[]) => syncedWrite(KEYS.movements, "movements", v),
  },
  permits: {
    list: () => read<DispatchPermit[]>(KEYS.permits, []),
    save: (v: DispatchPermit[]) => syncedWrite(KEYS.permits, "permits", v),
  },
  journal: {
    list: () => read<JournalEntry[]>(KEYS.journal, []),
    save: (v: JournalEntry[]) => syncedWrite(KEYS.journal, "journal", v),
  },
  accounts: {
    list: () => read<Account[]>(KEYS.accounts, []),
    save: (v: Account[]) => syncedWrite(KEYS.accounts, "accounts", v),
  },
  employees: {
    list: () => read<Employee[]>(KEYS.employees, []),
    save: (v: Employee[]) => syncedWrite(KEYS.employees, "employees", v),
  },
  attendance: {
    list: () => read<AttendanceRecord[]>(KEYS.attendance, []),
    save: (v: AttendanceRecord[]) => syncedWrite(KEYS.attendance, "attendance", v),
  },
  leaves: {
    list: () => read<LeaveRequest[]>(KEYS.leaves, []),
    save: (v: LeaveRequest[]) => syncedWrite(KEYS.leaves, "leaves", v),
  },
  payroll: {
    list: () => read<PayrollEntry[]>(KEYS.payroll, []),
    save: (v: PayrollEntry[]) => syncedWrite(KEYS.payroll, "payroll", v),
  },
  notifications: {
    list: () => read<Notification[]>(KEYS.notifications, []),
    save: (v: Notification[]) => syncedWrite(KEYS.notifications, "notifications", v),
  },
  session: {
    get: () => read<{ userId: string } | null>(KEYS.session, null),
    set: (v: { userId: string } | null) => write(KEYS.session, v),
    clear: () => localStorage.removeItem(KEYS.session),
  },
  theme: {
    get: () => read<"dark" | "light">(KEYS.theme, "dark"),
    set: (v: "dark" | "light") => write(KEYS.theme, v),
  },
};

export function uid(prefix = "id"): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
