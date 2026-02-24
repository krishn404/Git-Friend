'use client'

import Link from 'next/link'
import { GitBranch, ArrowRight, } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from './constants'
import AiChatDemo from '@/components/ui/chat'


export function HeroSection() {
  return (
    <section className="relative pt-20 sm:pt-28 pb-12 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <svg className="h-full w-full opacity-30 dark:opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="flex flex-col items-center text-center"
        >
<motion.div variants={fadeInUp} className="mb-4 flex justify-center">
  <a
    href="https://vercel.com/open-source-program"
    target="_blank"
    rel="noopener noreferrer"
    className="relative group inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 cursor-pointer"
  >
    <svg
      viewBox="0 0 76 65"
      className="h-3 w-3 fill-current text-black dark:text-white"
      aria-hidden="true"
    >
      <path d="M38 0L75.5 65H0.5L38 0Z" />
    </svg>

    <span>Backed by Vercel</span>

    <div className="pointer-events-none absolute top-full z-10 mt-2 w-max max-w-xs opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      <div className="rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-sm">
        <img
          alt="Vercel OSS Program"
          src="https://vercel.com/oss/program-badge.svg"
          className="h-6 w-auto"
        />
      </div>
    </div>
  </a>
</motion.div>
          <motion.h1
            variants={fadeInUp}
            className="mb-6 text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl lg:text-6xl text-balance"
          >
            <span className="bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-600 dark:from-neutral-50 dark:via-neutral-200 dark:to-neutral-300 bg-clip-text text-transparent">
              Ask AI About
            </span>
            <br />
            <span className="text-neutral-900 dark:text-neutral-50">Git & GitHub</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mb-8 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl"
          >
            Chat with AI about Git commands, troubleshoot issues, learn GitHub workflows. Get instant guidance without leaving this page.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/ai-chat"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 px-6 py-3 text-sm font-medium transition-all hover:shadow-xl hover:shadow-neutral-900/20"
              >
                Start Chatting
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              suppressHydrationWarning
              className="inline-flex items-center justify-center rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-900 dark:text-neutral-50 px-6 py-3 text-sm font-medium transition-all hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            >
              Learn More
            </button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-12 flex flex-wrap justify-center gap-8 sm:gap-12"
          >
            <div>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Instant</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">AI Responses</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">No Code</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Automation</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Learn</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">At Your Pace</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-16 max-w-6xl mx-auto">
          <AiChatDemo />
        </div>
      </div>
    </section>
  )
}
