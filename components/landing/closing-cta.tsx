'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function ClosingCta() {
  return (
    <section className="py-20 sm:py-32 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="mb-4 text-4xl sm:text-5xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 text-balance">
            Your repo is waiting to be understood
          </h2>
          
          <p className="mb-8 text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Start using GitFriend to chat with your repositories and generate beautiful documentation today.
          </p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/ai-chat"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-950 px-8 py-3 text-base font-semibold transition-all hover:shadow-lg shadow-md"
            >
              Start for free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
