"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AddTransactionForm from "@/components/dashboard/AddTransactionForm";

type Props = {
  defaultType?: "income" | "expense";
  label?: string;
  className?: string;
};

export default function QuickAddTransaction({ defaultType, label = "Add transaction", className }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { companyId } = useParams() as { companyId: string };

  const notifyChildren = () => {
    // Lets client components (charts/tables) react immediately
    window.dispatchEvent(new CustomEvent("transactions:changed"));
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className={className + " gap-2"}>
        <IconPlus className="h-4 w-4" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Quick add transaction</DialogTitle>
          </DialogHeader>

          <AddTransactionForm
            companyId={companyId}
            defaultType={defaultType}
            onSuccess={() => {
              setOpen(false);
              notifyChildren();  // instant client refresh
              router.refresh();  // server components/kpis refetch
            }}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
