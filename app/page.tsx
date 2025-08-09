"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import AnimatedTitle from "@/components/AnimatedTitle";
import { Button } from "@/components/ui/button";
import { TrustedMarquee } from "@/components/TrustedMarquee";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  function handleClick() {
    if (session) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  }

  return (
    <section className="h-screen relative flex flex-col justify-between">
      <Header />
      <div className="flex flex-col-reverse lg:flex-row items-center lg:justify-between container px-4 gap-4 py-8">
        <div className="flex flex-col items-start justify-center text-left max-w-2xl">
          <span className="font-title text-xl sm:text-2xl text-muted-foreground mb-2">
            Say goodbye to accounting stress — forever.
          </span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-title leading-tight">
            Welcome to <br /><span className="lg:whitespace-nowrap"><AnimatedTitle /></span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl font-code text-muted-foreground">
            Your all-in-one AI platform for taxes, bookkeeping, and income management.
          </p>
          <Button className="mt-8 text-lg px-8 py-4 self-start" onClick={handleClick}>
            Get started now
          </Button>
        </div>
      </div>
      <TrustedMarquee />
    </section>
  );
}
