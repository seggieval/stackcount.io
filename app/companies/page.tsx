"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

type Company = {
  id: string;
  name: string;
};

export default function CompanySelectorPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchCompanies();
  }, [status]);

  async function fetchCompanies() {
    const res = await fetch("/api/companies");
    const data = await res.json();
    setCompanies(data);
  }

  async function createCompany(e: React.FormEvent) {
    e.preventDefault();
    setError(""); // clear before trying

    if (!newCompanyName.trim()) return;

    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCompanyName }),
    });

    if (res.status === 400) {
      setError("You already have a company with that name.");
      return;
    }

    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }

    const company = await res.json();
    router.push(`/companies/${company.id}/dashboard`);
  }


  async function deleteCompany(id: string) {
    const res = await fetch("/api/companies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setCompanies(companies.filter((c) => c.id !== id));
    } else {
      const error = await res.text();
      console.error("Failed to delete company:", error);
    }
  }

  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto py-20 px-4">
        <h1 className="text-3xl font-title mb-6">Select or Create a Company</h1>

        <form onSubmit={createCompany} className="flex gap-2 mb-6 max-w-full">
          <div className="flex-1">
            <Input
              placeholder="Company name (e.g. Amazon LLC)"
              value={newCompanyName}
              onChange={(e) => {
                setNewCompanyName(e.target.value);
                setError(""); // reset on typing
              }}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
          <Button type="submit">Create</Button>
        </form>


        <ul className="space-y-2">
          {companies.map((c) => (
            <li
              key={c.id}
              className="p-4 border rounded hover:bg-muted cursor-pointer flex items-center justify-between"
              onClick={() => router.push(`/companies/${c.id}/dashboard`)}
            >
              <div className="font-medium">{c.name}</div>
              <Button
                className="bg-transparent text-xs px-2 py-1 border border-destructive text-destructive rounded hover:bg-destructive/10"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCompany(c.id);
                }}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
