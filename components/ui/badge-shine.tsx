import type React from "react"
const BadgeShine = ({ children }: { children: React.ReactNode }) => {
  return (
    <span className="inline-flex h-full animate-background-shine cursor-pointer items-center justify-center rounded-full border border-gray-800 bg-[linear-gradient(110deg,#000,45%,#4D4B4B,55%,#000)] bg-[length:250%_100%] px-3 py-1 text-xs font-medium text-gray-300">
      {children}
    </span>
  )
}

export default BadgeShine
