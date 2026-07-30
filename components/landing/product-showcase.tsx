'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function ProductShowcase() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Dotted grid background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-neutral-50 to-white dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950" />
      <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-10">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Product mockup card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative mb-12"
        >
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 overflow-hidden shadow-xl">
            {/* Mockup content - using a placeholder with gradient */}
            <div className="aspect-video bg-gradient-to-br from-neutral-100 dark:from-neutral-800 to-neutral-200 dark:to-neutral-900 flex items-center justify-center">
              <div className="text-center">
                <div className="text-neutral-400 dark:text-neutral-600 text-sm font-medium mb-2">Chat Interface Preview</div>
                <div className="w-64 h-40 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 mx-auto" />
              </div>
            </div>
          </div>

          {/* Floating feature callout card overlapping bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="absolute left-4 right-4 sm:left-6 sm:right-auto sm:w-96 -bottom-8 sm:-bottom-12"
          >
            <div className="rounded-xl border border-neutral-900 dark:border-neutral-200 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-950 p-5 sm:p-6 shadow-2xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-base">README Generator</h3>
                  <p className="text-sm mt-1 opacity-90">Turn any repo into clean, ready-to-ship docs in seconds</p>
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1.5 text-xs font-medium mt-3 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    Learn more <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Spacer for floating card */}
        <div className="h-20 sm:h-28" />
      </div>
    </section>
  )
}
