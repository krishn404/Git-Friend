import type React from "react"
const TextAnimatedGradient = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <span
      className={`inline-flex animate-text-gradient bg-gradient-to-r from-foreground via-foreground/60 to-foreground bg-[200%_auto] bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  )
}

export default TextAnimatedGradient
