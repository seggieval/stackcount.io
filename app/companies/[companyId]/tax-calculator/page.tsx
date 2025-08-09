"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
};

// 👇 State tax % (simplified)
const STATE_TAX_MAP: Record<string, number> = {
  California: 0.09,
  Texas: 0.00,
  Florida: 0.00,
  Massachusetts: 0.05,
  NewYork: 0.06,
};

// 👇 Income type presets
const INCOME_TYPES = [
  { label: "W-2 Job", value: "w2", rate: 0.10 },
  { label: "Self-Employed", value: "sole", rate: 0.153 },
  { label: "LLC / S-Corp", value: "llc", rate: 0.10 },
  { label: "Freelance / 1099", value: "freelance", rate: 0.153 },
  { label: "Capital Gains", value: "capital", rate: 0.15 },
  { label: "Rental Income", value: "rental", rate: 0.12 },
];

export default function TaxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { companyId } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [state, setState] = useState("");
  const [incomeType, setIncomeType] = useState("sole");
  const [customDeduction, setCustomDeduction] = useState("");
  const [locationFallback, setLocationFallback] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") {
      fetchTransactions();
      fetchUserLocation();
    }
  }, [status]);

  async function fetchTransactions() {
    const res = await fetch(`/api/companies/${companyId}/dashboard`);
    const data = await res.json();
    setTransactions(data);
  }

  async function fetchUserLocation() {
    if (!navigator.geolocation) {
      setLocationFallback(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
      const data = await res.json();
      const detectedState = data?.address?.state;
      if (detectedState && STATE_TAX_MAP[detectedState]) {
        setState(detectedState);
      } else {
        setLocationFallback(true);
      }
    }, () => {
      setLocationFallback(true);
    });
  }

  // Core tax logic
  const incomeTotal = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const expensesTotal = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const deductible = parseFloat(customDeduction) || 0;

  const taxableIncome = Math.max(0, incomeTotal - deductible);
  const incomeObj = INCOME_TYPES.find(i => i.value === incomeType);
  const baseRate = incomeObj?.rate || 0.1;
  const stateRate = STATE_TAX_MAP[state] || 0.05;

  const totalTaxRate = baseRate + stateRate;
  const estimatedTax = taxableIncome * totalTaxRate;
  const netAfterTax = taxableIncome - estimatedTax;

  return (
    <Card className="p-4 m-2 md:p-6 max-w-fit md:m-6 gap-4">
      <h1 className="text-3xl font-title mb-0 font-bold">Tax Estimator</h1>

      <div className="grid gap-4 max-w-xl">

        <div>
          <Label className="mb-1">Detected State</Label>
          {locationFallback ? (
            <Select onValueChange={setState} defaultValue={state}>
              <SelectTrigger>
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(STATE_TAX_MAP).map((st) => (
                  <SelectItem key={st} value={st}>{st}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input value={state} readOnly />
          )}
        </div>

        <div>
          <Label className="mb-1">Income Type</Label>
          <Select onValueChange={setIncomeType} defaultValue={incomeType}>
            <SelectTrigger>
              <SelectValue placeholder="Select income type" />
            </SelectTrigger>
            <SelectContent>
              {INCOME_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-1">Deduction (if applicable)</Label>
          <Input
            type="number"
            value={customDeduction}
            onChange={(e) => setCustomDeduction(e.target.value)}
            placeholder="e.g. 1500"
          />
          <p className="text-xs text-muted-foreground italic mt-1">
            Enter amount you plan to deduct from your income as an expense (e.g. equipment, rent).
          </p>
        </div>

        <Separator />

        <div className="mt-0 space-y-2">
          <h2 className="font-bold mb-0 text-lg">Summary</h2>
          <p className="text-muted-foreground">
            Total Income: <span className="font-bold text-green-600">${incomeTotal.toFixed(2)}</span>
          </p>
          <p className="text-muted-foreground">
            Deduction: <span className="font-bold text-yellow-600">-${deductible.toFixed(2)}</span>
          </p>
          <p className="text-muted-foreground">
            Taxable Income: <span className="font-bold">${taxableIncome.toFixed(2)}</span>
          </p>
          <p className="text-muted-foreground">
            Estimated Tax ({(totalTaxRate * 100).toFixed(1)}%):
            <span className="font-bold text-red-600"> ${estimatedTax.toFixed(2)}</span>
          </p>
          <p className="text-muted-foreground">
            Net After Tax: <span className="font-bold text-green-700">${netAfterTax.toFixed(2)}</span>
          </p>
        </div>

      </div>
    </Card>
  );
}
