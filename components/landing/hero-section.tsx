'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from './constants'
import AiChatDemo from '@/components/ui/chat'

export function HeroSection() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 -z-10 opacity-[0.02] dark:opacity-[0.05]">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
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
          {/* Subtle badge */}
          <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
            <a
              href="https://vercel.com/open-source-program"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground hover:border-foreground/30 transition-colors"
            >
              <svg
                viewBox="0 0 76 65"
                className="h-3 w-3 fill-current text-foreground"
                aria-hidden="true"
              >
                <path d="M38 0L75.5 65H0.5L38 0Z" />
              </svg>
              <span>Backed by Vercel</span>
            </a>
          </motion.div>

          {/* Main heading - minimal, no gradients */}
          <motion.h1
            variants={fadeInUp}
            className="mb-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance"
          >
            Ask AI About Git & GitHub
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeInUp}
            className="mb-10 text-lg leading-relaxed text-muted-foreground max-w-2xl"
          >
            Chat with AI about Git commands, troubleshoot issues, learn GitHub workflows. Get instant guidance without leaving this page.
          </motion.p>

          {/* CTA buttons - minimal, monochrome */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/ai-chat"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-6 py-3 text-sm font-medium transition-all hover:scale-105 hover:shadow-lg hover:-translate-y-0.5"
            >
              Start Chatting
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              suppressHydrationWarning
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-foreground px-6 py-3 text-sm font-medium transition-all hover:bg-muted hover:border-foreground/50"
            >
              Learn More
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div
            variants={fadeInUp}
            className="mt-14 flex flex-wrap justify-center gap-10 sm:gap-16"
          >
            <div>
              <p className="text-2xl font-semibold text-foreground">Instant</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">AI Responses</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">No Code</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Needed</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">Learn</p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">At Your Pace</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Chat demo preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <AiChatDemo />
        </motion.div>
      </div>
    </section>
  )
}
