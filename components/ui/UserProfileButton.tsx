"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfileButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Skeleton className="h-10 w-10 rounded-full" />;

  const image = session?.user?.image;
  const name = session?.user?.name;

  return (
    <div className="flex items-center gap-2">
      {image ? (
        <Image
          src={image}
          alt={name || "User"}
          width={36}
          height={36}
          className="rounded-full object-cover"
        />
      ) : (
        <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
          {name?.[0] || "U"}
        </div>
      )}
      <span className="text-sm">{name}</span>
    </div>
  );
}
