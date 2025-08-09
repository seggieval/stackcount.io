import { signOut } from "next-auth/react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function signOutAndRedirect(router: AppRouterInstance, path = "/login") {
  await signOut({ redirect: false });
  // Defer navigation until after render finishes
  setTimeout(() => router.push(path), 0);
}