"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { IconChartBar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

import { STATE_TAX_MAP, INCOME_TYPES } from "@/lib/tax/constants";


type Transaction = {
  id: string;
  amount: number; // positive number
  type: "income" | "expense";
};

type ApiTransactions =
  | Transaction[]
  | { transactions?: Transaction[]; data?: Transaction[] }
  | any;

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

// Normalize names like "NewYork" -> "New York", lowercase safe compare
const normalizeState = (name?: string): string | undefined => {
  if (!name) return undefined;
  const clean = name.replace(/\s+/g, " ").trim().toLowerCase();
  const entry = Object.keys(STATE_TAX_MAP).find(
    st => st.toLowerCase() === clean || st.replace(/\s+/g, "").toLowerCase() === clean.replace(/\s+/g, "")
  );
  return entry ?? undefined;
};


export default function TaxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { companyId } = useParams<{ companyId: string }>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [txError, setTxError] = useState<string | null>(null);

  const [state, setState] = useState<string>("");
  const [incomeType, setIncomeType] = useState<string>("sole");
  const [customDeduction, setCustomDeduction] = useState<string>("");

  const [detectingLocation, setDetectingLocation] = useState(true);
  const [locationFallback, setLocationFallback] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchTransactions();
    detectUserLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, companyId]);

  async function fetchTransactions() {
    setLoadingTx(true);
    setTxError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/dashboard`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw: ApiTransactions = await res.json();

      const items: Transaction[] =
        Array.isArray(raw) ? raw
          : Array.isArray(raw?.transactions) ? raw.transactions
            : Array.isArray(raw?.data) ? raw.data
              : [];

      // Defensive filter/shape
      const safe = items.filter(
        (t): t is Transaction =>
          t && typeof t.amount === "number" && (t.type === "income" || t.type === "expense")
      );
      setTransactions(safe);
    } catch (e: any) {
      setTxError(e?.message ?? "Failed to load transactions");
      setTransactions([]);
    } finally {
      setLoadingTx(false);
    }
  }

  async function detectUserLocation() {
    setDetectingLocation(true);
    setLocationFallback(false);

    if (!navigator.geolocation) {
      setLocationFallback(true);
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const detected = normalizeState(data?.address?.state || data?.address?.region);
          if (detected && detected in STATE_TAX_MAP) {
            setState(detected);
          } else {
            setLocationFallback(true);
          }
        } catch {
          setLocationFallback(true);
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        setLocationFallback(true);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  // ---- Core calculations
  const { incomeTotal, expensesTotal } = useMemo(() => {
    const income = transactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : 0), 0);
    const expense = transactions.reduce((acc, t) => acc + (t.type === "expense" ? t.amount : 0), 0);
    return { incomeTotal: income, expensesTotal: expense };
  }, [transactions]);

  const deductible = useMemo(() => {
    const val = parseFloat(customDeduction);
    return Number.isFinite(val) ? Math.max(0, val) : 0;
  }, [customDeduction]);

  const taxableIncome = Math.max(0, incomeTotal - deductible);

  const incomeObj = INCOME_TYPES.find((i) => i.value === incomeType);
  const baseRate = incomeObj?.rate ?? 0.10;
  const stateRate = (state && STATE_TAX_MAP[state]) || 0.05;

  const baseTax = taxableIncome * baseRate;
  const stateTax = taxableIncome * stateRate;
  const estimatedTax = baseTax + stateTax;
  const netAfterTax = taxableIncome - estimatedTax;

  const quarterlyEstimatedPayment = estimatedTax / 4;

  const hasTx = transactions.length > 0;

  return (
    <div className="m-2 md:m-6">
      <h2 className="text-xl font-title font-semibold flex items-center gap-2 mb-3">
        <IconChartBar className="size-5" />
        Tax Estimator
      </h2>

      <Card className="gap-4 max-w-2xl p-4 md:p-6">
        <div className="grid gap-4">
          {/* State */}
          <div>
            <Label className="mb-1 block">State</Label>
            <div className="flex gap-2 items-center">
              <Select value={state} onValueChange={setState}>
                <SelectTrigger>
                  <SelectValue placeholder={detectingLocation ? "Detecting…" : "Select your state"} />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(STATE_TAX_MAP).map((st) => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className={cn("text-xs text-muted-foreground", !locationFallback && "hidden")}>
                (Manual selection)
              </span>
              {!locationFallback && detectingLocation && (
                <span className="text-xs text-muted-foreground">Trying to detect…</span>
              )}
            </div>
          </div>

          {/* Income type */}
          <div>
            <Label className="mb-1 block">Income Type</Label>
            <Select value={incomeType} onValueChange={setIncomeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select income type" />
              </SelectTrigger>
              <SelectContent>
                {INCOME_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              Super simplified rates for quick planning—**not** tax advice.
            </p>
          </div>

          {/* Deduction */}
          <div>
            <Label htmlFor="deduction" className="mb-1 block">
              Deduction (optional)
            </Label>
            <Input
              id="deduction"
              type="number"
              inputMode="decimal"
              min="0"
              value={customDeduction}
              onChange={(e) => setCustomDeduction(e.target.value)}
              placeholder="e.g. 1500"
            />
            <p className="text-xs text-muted-foreground italic mt-1">
              Enter deductible expenses (equipment, rent, mileage, etc.).
            </p>
          </div>

          <Separator />

          {/* Data status */}
          <div className="text-sm">
            {loadingTx ? (
              <p className="text-muted-foreground">Loading transactions…</p>
            ) : txError ? (
              <p className="text-destructive">Couldn’t load transactions: {txError}</p>
            ) : !hasTx ? (
              <p className="text-muted-foreground">
                No transactions yet. Add income/expenses to see estimates.
              </p>
            ) : null}
          </div>

          {/* Summary */}
          <div className="mt-0 space-y-1">
            <h3 className="font-bold text-lg">Summary</h3>
            <p className="text-muted-foreground">
              Total Income: <span className="font-bold text-green-600">{currency.format(incomeTotal)}</span>
            </p>
            <p className="text-muted-foreground">
              Deduction: <span className="font-bold text-yellow-600">-{currency.format(deductible)}</span>
            </p>
            <p className="text-muted-foreground">
              Taxable Income: <span className="font-bold">{currency.format(taxableIncome)}</span>
            </p>
            <p className="text-muted-foreground">
              Base Tax ({(baseRate * 100).toFixed(1)}%):{" "}
              <span className="font-bold">{currency.format(baseTax)}</span>
            </p>
            <p className="text-muted-foreground">
              State Tax ({(stateRate * 100).toFixed(1)}%):{" "}
              <span className="font-bold">{currency.format(stateTax)}</span>
            </p>
            <p className="text-muted-foreground">
              Estimated Total Tax ({((baseRate + stateRate) * 100).toFixed(1)}%):{" "}
              <span className="font-bold text-red-600">{currency.format(estimatedTax)}</span>
            </p>
            <p className="text-muted-foreground">
              Net After Tax:{" "}
              <span className="font-bold text-green-700">{currency.format(netAfterTax)}</span>
            </p>
            <p className="text-muted-foreground">
              Est. Quarterly Payment:{" "}
              <span className="font-bold">{currency.format(quarterlyEstimatedPayment)}</span>
            </p>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground">
            ⚠️ This is an educational estimate, not tax advice. Real brackets, credits, standard
            deduction, SE adjustments, and entity-specific rules are not modeled here.
          </p>
        </div>
      </Card>
    </div>
  );
}
