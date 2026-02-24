"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAuthButton } from "@/components/auth/user-auth-button"
import { cn } from "@/lib/utils"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Image from "next/image"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const { scrollY } = useScroll({
    target: mounted ? ref : undefined,
    offset: ["start start", "end start"],
  })

  const isChatRoute = pathname === "/chat"

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  })

  const routes = [
    { name: "Home", path: "/" },
    { name: "Chat", path: "/chat" },
    { name: "Generate README", path: "/generate-readme" },
    { name: "Git Mojis", path: "/git-mojis" },
  ]

  if (isChatRoute) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/95">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Image src="/gitfriend-icon.png" alt="GitFriend Logo" width={24} height={24} />
            <span className="hidden text-xs sm:inline">Git Friend</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserAuthButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div ref={ref} className="fixed inset-x-0 top-0 z-50 w-full">
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          boxShadow: visible
            ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
            : "none",
          width: visible ? "40%" : "100%",
          y: visible ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        style={{
          minWidth: "800px",
        }}
        className={cn(
          "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-2 lg:flex dark:bg-transparent",
          visible && "bg-white/80 dark:bg-neutral-950/80",
        )}
      >
        <div className="flex items-center z-10">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/gitfriend-icon.png" alt="GitFriend Logo" width={28} height={28} />
          </Link>
        </div>

        <motion.div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-zinc-600 transition duration-200 hover:text-zinc-800 lg:flex lg:space-x-2 pointer-events-none">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "relative px-4 py-2 text-neutral-600 dark:text-neutral-300 pointer-events-auto",
                pathname === route.path && "text-primary",
              )}
            >
              {route.name}
            </Link>
          ))}
        </motion.div>

        <div className={`flex items-center z-10 ${visible ? "gap-1" : "gap-4"}`}>
          <ThemeToggle />
          <UserAuthButton />
        </div>
      </motion.div>

      {/* Mobile navigation */}
      <motion.div
        animate={{
          backdropFilter: visible ? "blur(10px)" : "none",
          boxShadow: visible
            ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
            : "none",
          width: visible ? "90%" : "100%",
          paddingRight: visible ? "12px" : "0px",
          paddingLeft: visible ? "12px" : "0px",
          borderRadius: visible ? "4px" : "2rem",
          y: visible ? 20 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
          visible && "bg-white/80 dark:bg-neutral-950/80",
        )}
      >
        <div className="flex w-full flex-row items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-lg">GitFriend</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-lg bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg px-4 py-8 shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]"
          >
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "block w-full px-3 py-2 rounded-md text-base font-medium transition-colors",
                  pathname === route.path ? "bg-primary/10 text-primary" : "hover:bg-muted",
                )}
                onClick={() => setIsOpen(false)}
              >
                {route.name}
              </Link>
            ))}
            <div className="pt-2 flex items-center gap-2">
              <ThemeToggle />
              <UserAuthButton />
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
