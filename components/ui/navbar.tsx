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
    { name: "AI Chat", path: "/ai-chat" },
    { name: "Generate README", path: "/generate-readme" },
    { name: "Git Mojis", path: "/git-mojis" },
  ]

  if (isChatRoute) {
    return (
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/95">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <Image
            src="/icon.png"
            alt="GitFriend Logo"
            width={24}
            height={24}
            className="invert dark:invert-0"
          />
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
          backdropFilter: "none",
          boxShadow: "none",
          width: "100%",
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          "relative z-[60] mx-auto hidden w-full max-w-none flex-row items-center justify-between self-start border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-6 py-3 lg:flex",
        )}
      >
        <div className="flex items-center z-10 gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/icon.png"
              alt="GitFriend Logo"
              width={24}
              height={24}
              className="invert dark:invert-0"
            />
            <span className="font-semibold text-neutral-900 dark:text-neutral-50 text-sm">GitFriend</span>
          </Link>
      </div>

        <motion.div className="absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-8 text-sm font-medium transition duration-200 lg:flex pointer-events-none">
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className={cn(
                "relative px-1 py-2 text-neutral-600 dark:text-neutral-400 pointer-events-auto transition-colors hover:text-neutral-900 dark:hover:text-neutral-50",
                pathname === route.path && "text-neutral-900 dark:text-neutral-50 font-semibold",
              )}
            >
              {route.name}
            </Link>
          ))}
        </motion.div>

        <div className="flex items-center z-10 gap-3">
          <ThemeToggle />
          <UserAuthButton />
        </div>
      </motion.div>

      {/* Mobile navigation */}
      <motion.div
        animate={{
          backdropFilter: "none",
          boxShadow: "none",
          width: "100%",
          paddingRight: "16px",
          paddingLeft: "16px",
          borderRadius: "0px",
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 50,
        }}
        className={cn(
          "relative z-50 mx-auto flex w-full max-w-none flex-col items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-0 py-3 lg:hidden",
        )}
      >
        <div className="flex w-full flex-row items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/icon.png"
              alt="GitFriend Logo"
              width={24}
              height={24}
              className="invert dark:invert-0"
            />
            <span className="font-semibold text-neutral-900 dark:text-neutral-50">GitFriend</span>
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
            className="absolute inset-x-0 top-14 z-50 flex w-full flex-col items-start justify-start gap-1 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 backdrop-blur-lg px-4 py-4 shadow-lg mx-4 right-4 left-4 top-16"
          >
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={cn(
                  "block w-full px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === route.path ? "bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-semibold" : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50",
                )}
                onClick={() => setIsOpen(false)}
              >
                {route.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 w-full mt-2 flex items-center gap-3 px-4">
              <ThemeToggle />
              <UserAuthButton />
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
