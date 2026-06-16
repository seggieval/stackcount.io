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
  { text: "OpenAI GPT API integrated", icon: FaCalculator },
  { text: "Full-stack Next.js 15 + React 19", icon: FaGlobe },
  { text: "Income, expense & profit tracking", icon: FaBalanceScale },
  { text: "Built by Kiril Sierykov — portfolio project", icon: FaUserTie },
  { text: "Google OAuth & secure authentication", icon: FaBriefcase },
  { text: "Multi-company workspaces", icon: FaRegBuilding },
]

const REPEAT_COUNT = 8

export const TrustedMarquee = () => {
  const marqueeItems = Array(REPEAT_COUNT).fill(TRUSTED_STATEMENTS).flat()

  return (
    <section
      className="w-full bg-primary py-10 hoveracc"
      aria-label="Project highlights"
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
