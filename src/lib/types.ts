export type Role = "admin" | "inventory" | "accounting" | "hr" | "data-entry";

export interface User {
  id: string;
  username: string;
  password: string;
  role: Role;
  name: string;
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  price: number;
  unit: string;
  status: "active" | "inactive";
}

export interface StockMovement {
  id: string;
  productId: string;
  type: "in" | "out";
  quantity: number;
  date: string;
  reference: string;
  notes: string;
}

export interface DispatchPermit {
  id: string;
  serial: string;
  requester: string;
  department: string;
  items: { productId: string; quantity: number }[];
  date: string;
  approvedBy: string;
  status: "pending" | "approved" | "issued";
}

export interface JournalLine {
  account: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  serial: string;
  date: string;
  description: string;
  lines: JournalLine[];
  reference: string;
}

export interface Account {
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  department: string;
  position: string;
  hireDate: string;
  salary: number;
  status: "active" | "terminated" | "on-leave";
  email: string;
  phone: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: "present" | "absent" | "late" | "leave";
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "annual" | "sick" | "emergency" | "unpaid";
  startDate: string;
  endDate: string;
  days?: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
}

export interface PayrollEntry {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status?: "paid" | "pending";
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: "info" | "warning" | "success";
}
