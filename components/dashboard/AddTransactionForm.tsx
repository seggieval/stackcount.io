"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

type FormDefaults = {
  id?: string;
  title?: string;
  amount?: string; // keep string for input control
  type?: "income" | "expense";
  category?: string;
  date?: string; // yyyy-mm-dd
};

export default function AddTransactionForm({
  companyId,
  className,
  defaultValues,
  onSuccess,
}: {
  companyId: string;
  className?: string;
  defaultValues?: FormDefaults;
  onSuccess?: () => void;
}) {
  const isEdit = Boolean(defaultValues?.id);

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [amount, setAmount] = useState(defaultValues?.amount ?? "");
  const [type, setType] = useState<"income" | "expense">(
    defaultValues?.type ?? "expense"
  );
  const [category, setCategory] = useState(defaultValues?.category ?? "");
  const [date, setDate] = useState(
    defaultValues?.date ?? new Date().toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);

  const endpoint = useMemo(() => {
    return `/api/companies/${companyId}/transactions`; // POST route
  }, [companyId, isEdit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        id: defaultValues?.id,
        title,
        amount, // server will parseFloat on PATCH; POST can accept string too
        type,
        category,
        date, // yyyy-mm-dd
        companyId,
      };

      const res = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`${isEdit ? "Update" : "Create"} failed`);
      }

      // reset only on create
      if (!isEdit) {
        setTitle("");
        setAmount("");
        setType("expense");
        setCategory("");
        setDate(new Date().toISOString().split("T")[0]);
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 max-w-xl ${className ?? ""}`}>
      <h2 className="text-2xl font-bold font-title mb-4">
        {isEdit ? "Edit Transaction" : "Add Transaction"}
      </h2>

      <Input
        placeholder="Title (e.g. Freelance work)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />

      <RadioGroup
        defaultValue={type}
        onValueChange={(val) => setType(val as "income" | "expense")}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="income" id="income" />
          <Label htmlFor="income">Income</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="expense" id="expense" />
          <Label htmlFor="expense">Expense</Label>
        </div>
      </RadioGroup>

      <Input
        placeholder="Category (e.g. Food, Transport)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <Button type="submit" className="w-full text-lg" disabled={submitting}>
        {submitting ? (isEdit ? "Saving..." : "Submitting...") : isEdit ? "Save" : "Submit"}
      </Button>
    </form>
  );
}
