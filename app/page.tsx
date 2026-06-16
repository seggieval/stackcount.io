"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import AnimatedTitle from "@/components/hero/AnimatedTitle";
import { Button } from "@/components/ui/button";
import { TrustedMarquee } from "@/components/hero/TrustedMarquee";
import AboutSection from "@/components/home/AboutSection";
import Pricing from "@/components/home/Pricing";
import { FeatureSection } from "@/components/home/Features";
import ContributeSection from "@/components/home/ContributeSection";
import Footer from "@/components/Footer";

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
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative flex flex-col justify-between min-h-[calc(100vh-var(--header-height))]">
        <div className="opacity-0 user-select-none"></div>
        <div className="container px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center lg:justify-between gap-6 py-12 md:py-16">
            <div className="flex flex-col items-start justify-center text-left max-w-2xl">
              <span className="font-title text-xl sm:text-2xl text-muted-foreground mb-2">
                Full-stack portfolio project · OpenAI GPT integrated
              </span>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-title leading-tight">
                Welcome to <br />
                <span className="lg:whitespace-nowrap"><AnimatedTitle /></span>
              </h1>

              <p className="mt-6 text-lg sm:text-xl font-code text-muted-foreground">
                A finance tracker I built to sharpen my full-stack skills — with a real
                OpenAI GPT API powering automated business insights. Track income, expenses,
                and profit across multiple companies. Free to use.
              </p>

              <Button className="mt-8 text-lg px-8 py-4 self-start" onClick={handleClick}>
                Get started free
              </Button>
            </div>
          </div>
        </div>

        <TrustedMarquee />
      </section>

      <FeatureSection />

      <AboutSection />

      <Pricing />

      <ContributeSection />

      <Footer />
    </>
  );
}
