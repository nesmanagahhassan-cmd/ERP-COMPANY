import { useEffect, useState } from "react";
import { store } from "./storage";
import type { Role, User } from "./types";

export const ROLE_LABEL: Record<Role, string> = {
  admin: "مدير النظام",
  inventory: "مسؤول المخازن",
  accounting: "مسؤول الحسابات",
  hr: "مسؤول الموارد البشرية",
  "data-entry": "مدخل بيانات",
};

export const ROLE_ACCESS: Record<Role, string[]> = {
  admin: ["dashboard", "inventory", "accounting", "hr", "users", "reports", "settings", "data-entry"],
  inventory: ["dashboard", "inventory", "reports", "settings"],
  accounting: ["dashboard", "accounting", "reports", "settings"],
  hr: ["dashboard", "hr", "reports", "settings"],
  "data-entry": ["data-entry", "settings"],
};

export function canAccess(role: Role | undefined, module: string): boolean {
  if (!role) return false;
  return ROLE_ACCESS[role].includes(module);
}

export function login(username: string, password: string): User | null {
  const users = store.users.list();
  const u = users.find((x) => x.username === username && x.password === password);
  if (!u) return null;
  store.session.set({ userId: u.id });
  return u;
}

export function logout() {
  store.session.clear();
}

export function getCurrentUser(): User | null {
  const s = store.session.get();
  if (!s) return null;
  return store.users.list().find((u) => u.id === s.userId) ?? null;
}

export function useCurrentUser(): User | null {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  useEffect(() => {
    const handler = () => setUser(getCurrentUser());
    window.addEventListener("storage", handler);
    window.addEventListener("erp:auth", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("erp:auth", handler);
    };
  }, []);
  return user;
}

export function emitAuthChange() {
  window.dispatchEvent(new Event("erp:auth"));
}
