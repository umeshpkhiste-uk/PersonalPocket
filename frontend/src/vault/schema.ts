// Record model, per-type field schema, display helpers and sample data.

import { genId } from "@/src/utils/format";

export type Category = "credentials" | "banking" | "investments" | "loans";

export interface VaultRecord {
  id: string;
  subtype?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface VaultData {
  credentials: VaultRecord[];
  banking: VaultRecord[];
  investments: VaultRecord[];
  loans: VaultRecord[];
}

export type FieldType = "text" | "number" | "secret" | "date" | "select" | "multiline";

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  optional?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

// User-defined fields added on top of a record's fixed schema fields.
// Stored on the record under the "customFields" key.
export interface CustomField {
  key: string;
  label: string;
  value: string;
}

export interface SubtypeDef {
  value: string;
  label: string;
  icon: string;
}

export const CATEGORY_META: Record<
  Category,
  { title: string; singular: string; icon: string }
> = {
  credentials: { title: "Credentials", singular: "Credential", icon: "key-outline" },
  banking: { title: "Banking", singular: "Bank Record", icon: "business-outline" },
  investments: { title: "Investments", singular: "Investment", icon: "trending-up-outline" },
  loans: { title: "Loans", singular: "Loan", icon: "cash-outline" },
};

export const SUBTYPES: Record<Category, SubtypeDef[]> = {
  credentials: [],
  banking: [
    { value: "account", label: "Accounts", icon: "wallet-outline" },
    { value: "fd", label: "FDs", icon: "lock-closed-outline" },
    { value: "rd", label: "RDs", icon: "repeat-outline" },
    { value: "other", label: "Other", icon: "ellipsis-horizontal-circle-outline" },
  ],
  investments: [
    { value: "mutual_fund", label: "Mutual Funds", icon: "pie-chart-outline" },
    { value: "sip", label: "SIPs", icon: "calendar-outline" },
    { value: "swp", label: "SWPs", icon: "cash-outline" },
    { value: "shares", label: "Shares", icon: "bar-chart-outline" },
    { value: "other", label: "Other", icon: "ellipsis-horizontal-circle-outline" },
  ],
  loans: [
    { value: "home", label: "Home", icon: "home-outline" },
    { value: "vehicle", label: "Vehicle", icon: "car-outline" },
    { value: "personal", label: "Personal", icon: "person-outline" },
    { value: "education", label: "Education", icon: "school-outline" },
    { value: "other", label: "Other", icon: "ellipsis-horizontal-circle-outline" },
  ],
};

export function subtypeLabel(category: Category, value?: string): string {
  const match = SUBTYPES[category].find((s) => s.value === value);
  return match?.label ?? "";
}

const FREQUENCY_OPTIONS = [
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Half-Yearly", value: "Half-Yearly" },
  { label: "Yearly", value: "Yearly" },
  { label: "Weekly", value: "Weekly" },
];

const NOTES: FieldDef = {
  key: "notes",
  label: "Notes",
  type: "multiline",
  optional: true,
  placeholder: "Add any extra details worth remembering",
};

export function getFields(category: Category, subtype?: string): FieldDef[] {
  if (category === "credentials") {
    return [
      { key: "serviceName", label: "Service or Institution", type: "text", placeholder: "e.g. HDFC NetBanking" },
      { key: "username", label: "Email or Username", type: "text", optional: true, placeholder: "name@email.com" },
      { key: "password", label: "Password", type: "secret", optional: true, placeholder: "Enter password" },
      { key: "password2", label: "Secondary Password", type: "secret", optional: true, placeholder: "Enter secondary password" },
      { key: "mpin", label: "MPIN", type: "secret", optional: true, placeholder: "4–6 digit MPIN" },
      { key: "tpin", label: "TPIN", type: "secret", optional: true, placeholder: "Transaction PIN" },
      { key: "pattern", label: "Mobile Lock Pattern", type: "secret", optional: true, placeholder: "Describe your unlock pattern" },
      NOTES,
    ];
  }

  if (category === "banking") {
    if (subtype === "account") {
      return [
        { key: "institution", label: "Bank / Institution", type: "text", placeholder: "e.g. State Bank" },
        {
          key: "accountType",
          label: "Account Type",
          type: "select",
          options: [
            { label: "Savings", value: "Savings" },
            { label: "Current", value: "Current" },
          ],
        },
        { key: "accountNumber", label: "Account Number", type: "secret", optional: true, placeholder: "Enter account number" },
        { key: "holderName", label: "Account Holder", type: "text", optional: true, placeholder: "Full name as per bank records" },
        { key: "ifsc", label: "IFSC / Branch Code", type: "text", optional: true, placeholder: "e.g. SBIN0001234" },
        { key: "nominee", label: "Nominee", type: "text", optional: true, placeholder: "Nominee's full name" },
        NOTES,
      ];
    }
    if (subtype === "fd" || subtype === "rd") {
      const principalLabel = subtype === "rd" ? "Monthly Deposit" : "Principal Amount";
      return [
        { key: "institution", label: "Bank / Institution", type: "text", placeholder: "e.g. State Bank" },
        { key: "referenceNumber", label: "Reference Number", type: "secret", optional: true, placeholder: `${subtype === "rd" ? "RD" : "FD"} account / receipt number` },
        { key: "holderName", label: "Holder Name", type: "text", optional: true, placeholder: "Full name as per bank records" },
        { key: "principal", label: principalLabel, type: "number", optional: true, placeholder: "Enter amount" },
        { key: "interestRate", label: "Interest Rate (%)", type: "number", optional: true, placeholder: "e.g. 7.5" },
        { key: "startDate", label: "Start Date", type: "date", optional: true },
        { key: "maturityDate", label: "Maturity Date", type: "date", optional: true },
        { key: "tenure", label: "Tenure", type: "text", optional: true, placeholder: "e.g. 24 months" },
        { key: "nominee", label: "Nominee", type: "text", optional: true, placeholder: "Nominee's full name" },
        NOTES,
      ];
    }
    // other deposit
    return [
      { key: "institution", label: "Institution", type: "text", placeholder: "e.g. Post Office" },
      { key: "referenceNumber", label: "Reference Number", type: "secret", optional: true, placeholder: "Account / certificate number" },
      { key: "holderName", label: "Holder Name", type: "text", optional: true, placeholder: "Full name as per records" },
      { key: "principal", label: "Amount", type: "number", optional: true, placeholder: "Enter amount" },
      { key: "interestRate", label: "Interest Rate (%)", type: "number", optional: true, placeholder: "e.g. 7.5" },
      { key: "startDate", label: "Start Date", type: "date", optional: true },
      { key: "maturityDate", label: "Maturity Date", type: "date", optional: true },
      { key: "nominee", label: "Nominee", type: "text", optional: true, placeholder: "Nominee's full name" },
      NOTES,
    ];
  }

  if (category === "investments") {
    if (subtype === "shares") {
      return [
        { key: "broker", label: "Broker", type: "text", placeholder: "e.g. Zerodha" },
        { key: "instrument", label: "Stock / Instrument", type: "text", optional: true, placeholder: "e.g. RELIANCE, TCS" },
        { key: "reference", label: "Demat / Ref Number", type: "secret", optional: true, placeholder: "Demat account number" },
        { key: "units", label: "Quantity", type: "number", optional: true, placeholder: "Number of shares held" },
        { key: "amount", label: "Invested Value", type: "number", optional: true, placeholder: "Total amount invested" },
        { key: "currentValue", label: "Current Value", type: "number", optional: true, placeholder: "Current market value" },
        { key: "startDate", label: "Purchase Date", type: "date", optional: true },
        NOTES,
      ];
    }
    const fields: FieldDef[] = [
      { key: "provider", label: "Provider / AMC", type: "text", placeholder: "e.g. Axis Mutual Fund" },
      { key: "scheme", label: "Scheme / Instrument", type: "text", optional: true, placeholder: "e.g. Axis Bluechip Fund" },
      { key: "reference", label: "Folio / Ref Number", type: "secret", optional: true, placeholder: "Folio number" },
      {
        key: "amount",
        label: subtype === "swp" ? "Withdrawal Amount" : "Amount",
        type: "number",
        optional: true,
        placeholder: subtype === "swp" ? "Amount withdrawn per cycle" : "Enter amount",
      },
    ];
    if (subtype === "mutual_fund")
      fields.push({ key: "units", label: "Units", type: "number", optional: true, placeholder: "Units held" });
    if (subtype === "sip" || subtype === "swp")
      fields.push({ key: "frequency", label: "Frequency", type: "select", options: FREQUENCY_OPTIONS });
    fields.push({ key: "startDate", label: "Start Date", type: "date", optional: true });
    fields.push({ key: "currentValue", label: "Current Value", type: "number", optional: true, placeholder: "Current market value" });
    fields.push(NOTES);
    return fields;
  }

  // loans
  return [
    { key: "lender", label: "Lender", type: "text", placeholder: "e.g. HDFC Bank" },
    { key: "reference", label: "Loan Reference", type: "secret", optional: true, placeholder: "Loan account number" },
    { key: "principal", label: "Principal Amount", type: "number", optional: true, placeholder: "Total loan amount" },
    { key: "outstanding", label: "Outstanding Amount", type: "number", optional: true, placeholder: "Remaining amount to pay" },
    { key: "interestRate", label: "Interest Rate (%)", type: "number", optional: true, placeholder: "e.g. 9.5" },
    { key: "emi", label: "EMI Amount", type: "number", optional: true, placeholder: "Monthly EMI amount" },
    { key: "frequency", label: "Payment Frequency", type: "select", optional: true, options: FREQUENCY_OPTIONS },
    { key: "startDate", label: "Start Date", type: "date", optional: true },
    { key: "endDate", label: "Expected End Date", type: "date", optional: true },
    { key: "nextPaymentDate", label: "Next Payment Date", type: "date", optional: true },
    NOTES,
  ];
}

export function requiredKey(category: Category): string {
  if (category === "credentials") return "serviceName";
  if (category === "banking") return "institution";
  if (category === "investments") return "provider"; // shares uses broker; handled in form
  return "lender";
}

export interface RecordSummary {
  title: string;
  subtitle: string;
  amount?: number;
  amountLabel?: string;
  negative?: boolean;
}

export function getSummary(category: Category, rec: VaultRecord): RecordSummary {
  if (category === "credentials") {
    return { title: rec.serviceName || "Untitled", subtitle: rec.username || "No username" };
  }
  if (category === "banking") {
    if (rec.subtype === "account") {
      const masked = rec.accountNumber ? "•••• " + String(rec.accountNumber).slice(-4) : "Savings / Current";
      return {
        title: rec.institution || "Bank",
        subtitle: `${rec.accountType || "Account"} · ${masked}`,
        amount: toNum(rec.balance),
        amountLabel: "Balance",
      };
    }
    return {
      title: rec.institution || "Institution",
      subtitle: subtypeLabel("banking", rec.subtype),
      amount: toNum(rec.principal),
      amountLabel: rec.subtype === "rd" ? "Monthly" : "Principal",
    };
  }
  if (category === "investments") {
    const title = rec.broker || rec.provider || "Investment";
    return {
      title,
      subtitle: rec.scheme || rec.instrument || subtypeLabel("investments", rec.subtype),
      amount: toNum(rec.currentValue) ?? toNum(rec.amount),
      amountLabel: rec.currentValue ? "Value" : "Amount",
    };
  }
  return {
    title: rec.lender || "Lender",
    subtitle: subtypeLabel("loans", rec.subtype),
    amount: toNum(rec.outstanding) ?? toNum(rec.principal),
    amountLabel: "Outstanding",
    negative: true,
  };
}

function toNum(v: any): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "string" ? parseFloat(v) : v;
  return isNaN(n) ? undefined : n;
}

// ---------------------------------------------------------------------------
// Sample data — GENERIC and clearly fake. Never real credentials.
// ---------------------------------------------------------------------------
function stamp(daysAgo = 0): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString();
}

export function buildSampleData(): VaultData {
  const now = stamp(2);
  return {
    credentials: [
      {
        id: genId(), createdAt: now, updatedAt: now,
        serviceName: "Sample NetBanking", username: "demo.user@example.com",
        password: "Demo@Pass123", mpin: "0000", tpin: "1111",
        notes: "Sample record — replace with your own.",
      },
      {
        id: genId(), createdAt: now, updatedAt: now,
        serviceName: "Demo Email", username: "demo.user@example.com",
        password: "Sample#Email9", password2: "Backup#Code0",
      },
      {
        id: genId(), createdAt: now, updatedAt: now,
        serviceName: "Example Wallet", username: "9999900000",
        mpin: "4321", pattern: "L-shape (sample)",
      },
    ],
    banking: [
      {
        id: genId(), subtype: "account", createdAt: now, updatedAt: now,
        institution: "Sample Bank", accountType: "Savings",
        accountNumber: "000011112222", holderName: "Demo User",
        balance: 128450, ifsc: "SMPL0000123", nominee: "Family Member",
      },
      {
        id: genId(), subtype: "fd", createdAt: now, updatedAt: now,
        institution: "Sample Bank", referenceNumber: "FD-DEMO-5567",
        principal: 200000, interestRate: 7.1, startDate: stamp(120),
        maturityDate: stamp(-600), tenure: "24 months", nominee: "Family Member",
      },
      {
        id: genId(), subtype: "rd", createdAt: now, updatedAt: now,
        institution: "Example Co-op", referenceNumber: "RD-DEMO-8890",
        principal: 5000, interestRate: 6.5, startDate: stamp(90),
        maturityDate: stamp(-450), tenure: "18 months",
      },
    ],
    investments: [
      {
        id: genId(), subtype: "mutual_fund", createdAt: now, updatedAt: now,
        provider: "Sample AMC", scheme: "Demo Bluechip Fund",
        reference: "FOLIO-00099", amount: 50000, units: 1234.56, currentValue: 61200,
      },
      {
        id: genId(), subtype: "sip", createdAt: now, updatedAt: now,
        provider: "Example Mutual", scheme: "Demo Index SIP",
        reference: "FOLIO-00123", amount: 5000, frequency: "Monthly",
        startDate: stamp(300), currentValue: 72400,
      },
      {
        id: genId(), subtype: "shares", createdAt: now, updatedAt: now,
        broker: "Sample Broker", instrument: "DEMO Ltd", reference: "DEMAT-7788",
        units: 40, amount: 48000, currentValue: 52600,
      },
    ],
    loans: [
      {
        id: genId(), subtype: "home", createdAt: now, updatedAt: now,
        lender: "Sample Housing Finance", reference: "HL-DEMO-4455",
        principal: 3500000, outstanding: 2810000, interestRate: 8.6,
        emi: 31500, frequency: "Monthly", startDate: stamp(700),
        endDate: stamp(-4000), nextPaymentDate: stamp(-12),
      },
      {
        id: genId(), subtype: "vehicle", createdAt: now, updatedAt: now,
        lender: "Example Auto Loans", reference: "VL-DEMO-2211",
        principal: 800000, outstanding: 420000, interestRate: 9.4,
        emi: 15800, frequency: "Monthly", nextPaymentDate: stamp(-5),
      },
    ],
  };
}

export function emptyData(): VaultData {
  return { credentials: [], banking: [], investments: [], loans: [] };
}
