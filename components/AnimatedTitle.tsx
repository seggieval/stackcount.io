"use client";

import { useEffect, useState } from "react";

const roles = [
  "Your AI Accounting Team_",
  "Automated Tax Expert_",
  "Your 24/7 Finance Bot_",
  "Smart Bookkeeping Assistant_",
  "Stress-Free Tax Season_",
  "Audit-Ready in Seconds_",
];

export default function AnimatedTitle() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isWaitingToType, setIsWaitingToType] = useState(true); // New state: wait before typing

  useEffect(() => {
    const currentRole = roles[index];
    let speed = isDeleting ? 50 : 100;

    if (isPaused) {
      // Pause after full typing, before deleting
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 1000);
      return () => clearTimeout(pauseTimeout);
    }

    if (isWaitingToType) {
      // Pause before starting to type new word
      const waitTimeout = setTimeout(() => {
        setIsWaitingToType(false);
      }, 1000);
      return () => clearTimeout(waitTimeout);
    }

    const timeout = setTimeout(() => {
      if (isDeleting) {
        setText((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);

        if (charIndex === 0) {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % roles.length);
          setIsWaitingToType(true); // trigger pause before next typing
        }
      } else {
        setText(currentRole.slice(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);

        if (charIndex + 1 === currentRole.length) {
          setIsPaused(true);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, index, isPaused, isWaitingToType]);

  return (
    <span className="text-primary inline-block w-fit text-left">
      {text}
      <span className={(isPaused || isWaitingToType) ? "blink" : ""}>|</span>
    </span>
  );
}



