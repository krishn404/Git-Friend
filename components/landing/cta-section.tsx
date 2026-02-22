'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { AnimatedSection } from './animated-section'
import { fadeInUp } from './constants'

export function CtaSection() {
  return (
    <section className="border-t border-neutral-200 dark:border-neutral-800 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mx-auto max-w-2xl text-center">
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl"
          >
            Get Started Now
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mb-8 text-lg text-neutral-600 dark:text-neutral-400"
          >
            Ask your first Git question or generate a README from your repository.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/ai-chat"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 px-8 py-4 text-base font-medium transition-all hover:shadow-xl"
            >
              Launch Application
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  )
}
