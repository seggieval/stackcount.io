"use client"
import React from "react"
import {
  FaUserTie,
  FaBriefcase,
  FaBalanceScale,
  FaCalculator,
  FaGlobe,
  FaRegBuilding,
} from "react-icons/fa"

const TRUSTED_STATEMENTS = [
  { text: "Trusted by 12,000+ accountants", icon: FaGlobe },
  { text: "AI-powered accuracy you can rely on", icon: FaCalculator },
  { text: "Tax season handled in seconds", icon: FaBalanceScale },
  { text: "Built by CPAs and engineers", icon: FaUserTie },
  { text: "Security first. Always.", icon: FaBriefcase },
  { text: "Join top-performing firms today", icon: FaRegBuilding },
]

const REPEAT_COUNT = 8

export const TrustedMarquee = () => {
  const marqueeItems = Array(REPEAT_COUNT).fill(TRUSTED_STATEMENTS).flat()

  return (
    <section
      className="w-full bg-primary py-10 hoveracc"
      aria-label="Trusted by top accountants and firms"
    >
      <div className="px-4 overflow-x-hidden relative">
        <ul
          className="animate-marquee whitespace-nowrap min-w-[200vw] group items-center flex"
          aria-hidden="true"
        >
          {marqueeItems.map(({ text, icon: Icon }, i) => (
            <li
              key={i}
              className="mx-12 text-lg text-whitetext font-code font-semibold flex items-center gap-2 flex-shrink-0 select-none"
              style={{ lineHeight: "1.25rem" }}
            >
              <Icon className="text-xl" aria-hidden="true" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: scroll 80s linear infinite;
          will-change: transform;
        }
        .hoveracc:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
