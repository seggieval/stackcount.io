"use client";

import { useEffect, useState } from "react";

export default function RefreshOnTransactionChange({ children }: { children: React.ReactNode }) {
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const handler = () => setNonce(n => n + 1);
    window.addEventListener("transactions:changed", handler);
    return () => window.removeEventListener("transactions:changed", handler);
  }, []);

  // Remount children when nonce changes
  return <div key={nonce}>{children}</div>;
}
