'use client'

import Link from 'next/link'
import { ArrowRight, MessageCircle, FileText, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { staggerContainer, fadeInUp } from './constants'

export function HeroSection() {
  return (
    <section className="relative pt-32 sm:pt-40 pb-0 overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900" />
        <svg className="h-full w-full opacity-20 dark:opacity-5" xmlns="http://www.w3.org/2000/svg">
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
          {/* Announcement pill */}
          <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100/50 dark:bg-neutral-900/50 px-4 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Introducing Repo Chat
              </span>
              <a
                href="#features"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors flex items-center gap-1"
              >
                Read more <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={fadeInUp}
            className="mb-4 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 text-balance"
          >
            Chat with your repo
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            className="mb-8 text-lg sm:text-xl leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-2xl"
          >
            GitFriend reads your GitHub repos and turns questions into answers, and messy codebases into clean, ready-to-ship READMEs.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/ai-chat"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-950 px-6 py-3 text-sm font-semibold transition-all hover:shadow-lg shadow-md"
              >
                Start for free
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/ai-chat"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 px-6 py-3 text-sm font-semibold transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                Try the chat
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature pill tabs */}
          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {[
              { icon: MessageCircle, label: 'AI Chat' },
              { icon: FileText, label: 'README Generator' },
              { icon: Zap, label: 'Repo Insights' },
            ].map((feature, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 backdrop-blur-sm"
              >
                <feature.icon className="h-4 w-4" />
                {feature.label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
