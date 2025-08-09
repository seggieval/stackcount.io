"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import AddTransactionForm from "@/components/dashboard/AddTransactionForm";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconPlus,
  IconSearch
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox"
import { InputWithSearchIcon } from "@/components/ui/input";
import { useDebounce } from "@/lib/use-debounce";


type Transaction = {
  id: string;
  title: string;
  date: string;      // ISO string
  type: "income" | "expense";
  category: string;
  amount: number;
};

export default function TransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { companyId } = useParams<{ companyId: string }>();

  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // pagination (client-side)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [total, setTotal] = useState(0);

  // filter and order state
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [order, setOrder] = useState<"latest" | "oldest">("latest");

  const paginatedData = data; // backend already gives the right page of data
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  // edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allOnPage = paginatedData.length > 0 && paginatedData.every(tx => selected.has(tx.id));
  const someOnPage = paginatedData.some(tx => selected.has(tx.id));

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300); // 300–400ms feels nice

  async function fetchTransactions() {
    if (!companyId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: filter,
        sort: order,
        page: String(page + 1), // API is 1-based
        pageSize: String(pageSize),
      });
      const res = await fetch(
        `/api/companies/${companyId}/transactions?${params.toString()}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      setData(json.data);
      setTotal(json.total);
    } catch (e) {
      console.error("Failed to fetch transactions", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // On mount, initialize from URL
    const urlFilter = searchParams.get("type") as "all" | "income" | "expense" | null;
    const urlSort = searchParams.get("sort") as "latest" | "oldest" | null;
    const urlPage = parseInt(searchParams.get("page") || "1", 10) - 1; // UI state is 0-based
    const urlPageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    if (urlFilter) setFilter(urlFilter);
    if (urlSort) setOrder(urlSort);
    if (!isNaN(urlPage) && urlPage >= 0) setPage(urlPage);
    if (!isNaN(urlPageSize) && urlPageSize > 0) setPageSize(urlPageSize);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({
      type: filter,
      sort: order,
      page: String(page + 1), // convert back to 1-based for URL
      pageSize: String(pageSize),
    });
    router.replace(`?${params.toString()}`);
    fetchTransactions();
  }, [companyId, filter, order, page, pageSize]);

  const filteredData = useMemo(() => {
    if (!debouncedSearch.trim()) return paginatedData;
    const term = debouncedSearch.toLowerCase();
    return paginatedData.filter(
      (tx) =>
        tx.title.toLowerCase().includes(term) ||
        tx.category.toLowerCase().includes(term) ||
        tx.amount.toString().includes(term)
    );
  }, [debouncedSearch, paginatedData]);


  return (
    <div className="p-2 md:p-6 space-y-6">
      {/* Top bar: filter placeholder + create */}
      <div className="flex gap-3 flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="flex flex-col sm:flex-row gap-3 order-1 md:order-0">
          {/* Search input */}
          <InputWithSearchIcon
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64"
          />

          {/* Filter by type */}
          <Select
            value={filter}
            onValueChange={(v) => {
              setFilter(v as "all" | "income" | "expense");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px]!">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Incomes</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort order */}
          <Select
            value={order}
            onValueChange={(v) => {
              setOrder(v as "latest" | "oldest");
              setPage(0);
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Sort order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>


        {/* CREATE */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="h-[-webkit-fill-available] py-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <IconPlus className="mr-2 h-4 w-4" />
              <span className="inline">Create transaction</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-center text-3xl font-title">
                Create New Transaction
              </DialogTitle>
            </DialogHeader>

            {companyId && (
              <AddTransactionForm
                companyId={companyId}
                onSuccess={() => {
                  fetchTransactions();
                  setIsCreateOpen(false); // close after submit
                }}
              />
            )}

            <DialogClose className="absolute right-2 top-2 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-muted h-8 w-8">
              ✕
            </DialogClose>
          </DialogContent>
        </Dialog>

      </div>

      {/* Table */}
      <div className="pt-2">
        <Card className="border overflow-hidden p-0 bg-card text-card-foreground shadow-md">
          <Table className="rounded-lg overflow-hidden">
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="px-4 py-2">
                  <Checkbox
                    checked={allOnPage}
                    // shadcn Checkbox gives boolean | "indeterminate"
                    onCheckedChange={(checked) => {
                      setSelected(prev => {
                        const next = new Set(prev);
                        if (checked === true) {
                          // add all on current page
                          paginatedData.forEach(tx => next.add(tx.id));
                        } else {
                          // remove all on current page
                          paginatedData.forEach(tx => next.delete(tx.id));
                        }
                        return next;
                      });
                    }}
                    // show indeterminate when some but not all on page
                    ref={(el) => {
                      if (!el) return;
                      el.indeterminate = !allOnPage && someOnPage;
                    }}
                    className="shadow-sm"
                  />
                </TableHead>
                <TableHead className="px-4 py-2">Date</TableHead>
                <TableHead className="px-4 py-2">Title</TableHead>
                <TableHead className="px-4 py-2">Category</TableHead>
                <TableHead className="px-4 py-2">Type</TableHead>
                <TableHead className="px-4 py-2 text-right">Amount</TableHead>
                <TableHead className="px-4 py-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                        size="icon"
                      >
                        <IconDotsVertical />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">

                      {/* DELETE calls your DELETE route */}
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={async () => {
                          try {
                            const ids = Array.from(selected);
                            if (ids.length === 0) return;

                            const res = await fetch(`/api/companies/${companyId}/transactions`, {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ ids }),
                            });
                            if (!res.ok) throw new Error("Bulk delete failed");

                            // Optimistic UI
                            setData(prev => prev.filter(t => !ids.includes(t.id)));
                            setSelected(new Set());
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                      >
                        Delete selected
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((tx, i) => (
                  <TableRow
                    key={tx.id}
                    className="bg-background hover:bg-muted"
                  >
                    <TableCell className="px-4 py-3">
                      <Checkbox
                        checked={selected.has(tx.id)}
                        onCheckedChange={(checked) => {
                          setSelected(prev => {
                            const next = new Set(prev);
                            if (checked === true) next.add(tx.id);
                            else next.delete(tx.id);
                            return next;
                          });
                        }}
                        className="shadow-sm"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-foreground/80">
                      {tx.date?.slice(0, 10)}
                    </TableCell>
                    <TableCell className="px-4 py-3">{tx.title}</TableCell>
                    <TableCell className="px-4 py-3 capitalize">{tx.category}</TableCell>
                    <TableCell className="px-4 py-3 uppercase tracking-wide text-xs text-muted-foreground">
                      {tx.type}
                    </TableCell>
                    <TableCell
                      className={`px-4 py-3 text-right font-mono font-bold ${tx.type === "expense"
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                        }`}
                    >
                      ${tx.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                            size="icon"
                          >
                            <IconDotsVertical />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36">
                          {/* EDIT opens dialog with form defaults */}
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingTx(tx);
                              setIsEditOpen(true);
                            }}
                          >
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          {/* DELETE calls your DELETE route */}
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={async () => {
                              try {
                                const res = await fetch(`/api/companies/${companyId}/transactions`, {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: tx.id }),
                                });
                                if (!res.ok) throw new Error("Delete failed");
                                setData((prev) => prev.filter((t) => t.id !== tx.id));
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Pagination */}
        <div className="flex flex-col lg:flex-row items-center justify-between px-4 py-4 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-[-webkit-fill-available] md:w-auto">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => {
                setPageSize(Number(val));
                setPage(0);
              }}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 20, 50].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Page <strong>{page + 1}</strong> of <strong>{pageCount}</strong>
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hidden lg:flex"
                onClick={() => setPage(0)}
                disabled={page === 0}
              >
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hidden lg:flex"
                onClick={() => setPage(pageCount - 1)}
                disabled={page >= pageCount - 1}
              >
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT dialog reusing the same form */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-3xl font-title">
              Edit Transaction
            </DialogTitle>
          </DialogHeader>

          {editingTx && companyId && (
            <AddTransactionForm
              companyId={companyId}
              defaultValues={{
                id: editingTx.id,
                title: editingTx.title,
                amount: String(editingTx.amount),
                category: editingTx.category,
                type: editingTx.type,
                date: editingTx.date?.slice(0, 10),
              }}
              onSuccess={async () => {
                setIsEditOpen(false);
                // update the row locally OR refetch
                await fetchTransactions();
              }}
            />
          )}

          <DialogClose className="absolute right-2 top-2 h-8 w-8 rounded opacity-70 hover:opacity-100">
            ✕
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
