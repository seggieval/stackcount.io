"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { IconClock } from '@tabler/icons-react';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Props {
  companyId: string;
}

export function TableComponent({ companyId }: Props) {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/companies/${companyId}/dashboard?limit=5`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Fetch error:", errorText);
          return;
        }

        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchTransactions();
  }, [companyId]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your recent activity</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Last 5 activities
          </span>
          <span className="@[540px]/card:hidden">Last 5 activities</span>
        </CardDescription>
      </CardHeader>

      <Table>
        <TableCaption className={`${transactions.length === 0 ? "hidden" : ""}`}>
          <Button><Link href={`/companies/${companyId}/transactions`}>View all transactions</Link></Button>
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {transactions.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={4}
                className="h-40 text-muted-foreground text-center p-0"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <IconClock className="text-muted-foreground" />
                  <p className="text-xl pb-4">No transactions yet.</p>
                  <Button><Link href={`/companies/${companyId}/transactions`}>View all transactions</Link></Button>
                </div>
                
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx, index) => (
              <TableRow key={tx.id}>
                <TableCell className="font-medium">
                  {tx.id.slice(0, 4)}...{tx.id.slice(-4)}
                </TableCell>
                <TableCell>{tx.category}</TableCell>
                <TableCell>{tx.type === "income" ? "Income" : "Expense"}</TableCell>
                <TableCell className={`text-right ${tx.type === "income" ? "text-green-700" : "text-red-600"}`}>{tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
