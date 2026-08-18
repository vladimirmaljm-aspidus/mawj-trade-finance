export type TxType = "income" | "expense";
export type TransferMethod = "SEPA" | "SWIFT" | "LOCAL";
export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

export interface Profile {
  id: string;
  full_name: string;
  company_name: string;
  role: string;
  email: string;
  phone: string;
  vip: boolean;
  license_no: string;
  registered_office: string;
}

export interface Account {
  id: string;
  label: string;
  currency: "EUR" | "USD" | "AED" | "GBP" | "CHF";
  balance: number;
  iban: string;
  bic: string;
  is_primary: boolean;
}

export interface CardInfo {
  id: string;
  kind: "physical" | "virtual";
  label: string;
  holder: string;
  number: string;
  exp: string;
  frozen: boolean;
  daily_limit: number;
  monthly_limit: number;
}

export interface Beneficiary {
  id: string;
  name: string;
  full_name: string;
  initials: string;
  tone: "indigo" | "slate" | "amber" | "emerald" | "blue" | "purple";
  iban: string;
  country: string;
  method: TransferMethod;
}

export interface Transaction {
  id: string;
  type: TxType;
  counterparty: string;
  category: string;
  amount: number;
  currency: string;
  occurred_at: string; // ISO timestamp
  method: TransferMethod;
  reference: string;
  status: string;
  logo: string | null;
  color_tone: string;
  memo: string | null;
  account_id: string | null;
}

export interface FxRate {
  id: string;
  base: string;
  quote: string;
  rate: number;
  change_pct: number;
}

export interface LoginEvent {
  id: string;
  method: string;
  success: boolean;
  device: string | null;
  location: string | null;
  ip: string | null;
  created_at: string;
}

export type TabId = "home" | "cards" | "payments" | "fx" | "profile";

export type SubPageId =
  | "all-transactions"
  | "tx-details"
  | "receive"
  | "accounts"
  | "analytics"
  | "taxes"
  | "company-details"
  | "support"
  | "security"
  | "compliance";
