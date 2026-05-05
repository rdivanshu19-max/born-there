// Approximate USD conversion rates and local currency for each supported country.
// These are display-only, refreshed periodically.
export interface CurrencyInfo {
  code: string;
  symbol: string;
  perUsd: number; // 1 USD = perUsd local
}

export const CURRENCY_BY_ISO2: Record<string, CurrencyInfo> = {
  US: { code: "USD", symbol: "$",   perUsd: 1 },
  IN: { code: "INR", symbol: "₹",   perUsd: 83 },
  NO: { code: "NOK", symbol: "kr",  perUsd: 10.6 },
  NG: { code: "NGN", symbol: "₦",   perUsd: 1500 },
  BR: { code: "BRL", symbol: "R$",  perUsd: 5.1 },
  JP: { code: "JPY", symbol: "¥",   perUsd: 150 },
  DE: { code: "EUR", symbol: "€",   perUsd: 0.92 },
  ZA: { code: "ZAR", symbol: "R",   perUsd: 18.5 },
  BD: { code: "BDT", symbol: "৳",   perUsd: 110 },
  AU: { code: "AUD", symbol: "A$",  perUsd: 1.5 },
  CA: { code: "CAD", symbol: "C$",  perUsd: 1.36 },
  PK: { code: "PKR", symbol: "₨",   perUsd: 280 },
  ID: { code: "IDR", symbol: "Rp",  perUsd: 15800 },
  GB: { code: "GBP", symbol: "£",   perUsd: 0.79 },
  FR: { code: "EUR", symbol: "€",   perUsd: 0.92 },
  CN: { code: "CNY", symbol: "¥",   perUsd: 7.2 },
  MX: { code: "MXN", symbol: "Mex$", perUsd: 17 },
  ET: { code: "ETB", symbol: "Br",  perUsd: 56 },
  AR: { code: "ARS", symbol: "$",   perUsd: 950 },
  EG: { code: "EGP", symbol: "E£",  perUsd: 48 },
  PH: { code: "PHP", symbol: "₱",   perUsd: 56 },
  VN: { code: "VND", symbol: "₫",   perUsd: 24500 },
  KE: { code: "KES", symbol: "KSh", perUsd: 130 },
  TR: { code: "TRY", symbol: "₺",   perUsd: 32 },
  CO: { code: "COP", symbol: "$",   perUsd: 4000 },
  UA: { code: "UAH", symbol: "₴",   perUsd: 40 },
  SA: { code: "SAR", symbol: "﷼",   perUsd: 3.75 },
  IR: { code: "IRR", symbol: "﷼",   perUsd: 42000 },
  TH: { code: "THB", symbol: "฿",   perUsd: 36 },
  MY: { code: "MYR", symbol: "RM",  perUsd: 4.7 },
  GH: { code: "GHS", symbol: "₵",   perUsd: 14 },
  TZ: { code: "TZS", symbol: "TSh", perUsd: 2500 },
  PE: { code: "PEN", symbol: "S/.", perUsd: 3.7 },
  VE: { code: "VES", symbol: "Bs.", perUsd: 36 },
  RO: { code: "RON", symbol: "lei", perUsd: 4.6 },
  CZ: { code: "CZK", symbol: "Kč",  perUsd: 23 },
  SE: { code: "SEK", symbol: "kr",  perUsd: 10.5 },
  FI: { code: "EUR", symbol: "€",   perUsd: 0.92 },
  DK: { code: "DKK", symbol: "kr",  perUsd: 6.85 },
  NL: { code: "EUR", symbol: "€",   perUsd: 0.92 },
  NZ: { code: "NZD", symbol: "NZ$", perUsd: 1.65 },
  SG: { code: "SGD", symbol: "S$",  perUsd: 1.34 },
  AE: { code: "AED", symbol: "د.إ", perUsd: 3.67 },
  QA: { code: "QAR", symbol: "QR",  perUsd: 3.64 },
  NP: { code: "NPR", symbol: "रु",  perUsd: 133 },
  LK: { code: "LKR", symbol: "Rs",  perUsd: 300 },
  MM: { code: "MMK", symbol: "K",   perUsd: 2100 },
  AF: { code: "AFN", symbol: "؋",   perUsd: 70 },
  HT: { code: "HTG", symbol: "G",   perUsd: 132 },
  BO: { code: "BOB", symbol: "Bs",  perUsd: 6.9 },
};

export function getCurrency(iso2: string): CurrencyInfo {
  return CURRENCY_BY_ISO2[iso2] ?? { code: "USD", symbol: "$", perUsd: 1 };
}

export function fromLocalToUsd(amountLocal: number, iso2: string): number {
  const c = getCurrency(iso2);
  return amountLocal / c.perUsd;
}

export function fromUsdToLocal(amountUsd: number, iso2: string): number {
  const c = getCurrency(iso2);
  return amountUsd * c.perUsd;
}

export function formatLocal(amountLocal: number, iso2: string): string {
  const c = getCurrency(iso2);
  const rounded = amountLocal >= 1000
    ? Math.round(amountLocal).toLocaleString()
    : amountLocal.toFixed(amountLocal < 10 ? 2 : 0);
  return `${c.symbol}${rounded}`;
}

export function formatUsd(amountUsd: number): string {
  return `$${Math.round(amountUsd).toLocaleString()}`;
}
