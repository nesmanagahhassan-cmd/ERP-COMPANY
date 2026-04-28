export function fmtCurrency(n: number, currency = "ج.م"): string {
  return new Intl.NumberFormat("ar-EG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n) + " " + currency;
}

export function fmtNumber(n: number): string {
  return new Intl.NumberFormat("ar-EG").format(n);
}

export function fmtDate(date: string): string {
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric", month: "short", day: "numeric",
    }).format(d);
  } catch { return date; }
}

export function fmtDateTime(date: string): string {
  try {
    const d = new Date(date);
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(d);
  } catch { return date; }
}

export function fmtMonth(yyyymm: string): string {
  try {
    const [y, m] = yyyymm.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" }).format(d);
  } catch { return yyyymm; }
}
