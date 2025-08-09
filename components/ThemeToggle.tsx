"use client"

import { useEffect, useState } from "react"
import { FaSun, FaMoon } from "react-icons/fa"

export default function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const shouldUseDark = saved !== "light" // Default to dark if no preference

    setDarkMode(shouldUseDark)
    document.documentElement.classList.toggle("dark", shouldUseDark)
  }, [])

  const toggleTheme = () => {
    const nextMode = !darkMode
    setDarkMode(nextMode)
    document.documentElement.classList.toggle("dark", nextMode)
    localStorage.setItem("theme", nextMode ? "dark" : "light")
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-14 h-8 flex items-center rounded-full 
        bg-primary transition-colors duration-300
        focus:outline-none
      `}
      aria-label="Toggle Theme"
    >
      <span
        className={`
          absolute top-1 left-1 w-6 h-6 flex items-center justify-center 
          rounded-full bg-whitetext transition-all duration-300 transform
          ${darkMode ? "translate-x-6" : "translate-x-0"}
        `}
      >
        {darkMode ? (
          <FaMoon className="text-sm text-black" />
        ) : (
          <FaSun className="text-sm text-yellow-500" />
        )}
      </span>
    </button>
  )
}
