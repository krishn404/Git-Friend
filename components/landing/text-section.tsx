'use client'

import { motion } from 'framer-motion'
import { MessageCircle, Zap } from 'lucide-react'

export function TextSection() {
  return (
    <section className="py-20 sm:py-32 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Floating card - left */}
          <motion.div
            initial={{ opacity: 0, x: -20, y: 20 }}
            whileInView={{ opacity: 1, x: -40, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="absolute left-0 top-20 -z-10 lg:z-0 lg:left-0 w-40 h-32"
          >
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Instant Help</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">Get Git answers in seconds</p>
            </div>
          </motion.div>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto lg:mx-0 lg:ml-32"
          >
            <p className="text-lg sm:text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-6 text-balance">
              Documentation isn&apos;t just a formality. It&apos;s how people trust your code.
            </p>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              GitFriend is the AI chat built for Git and GitHub. Repo-aware answers. Instant README generation. All in one place.
            </p>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              It&apos;s fast. It&apos;s accurate. It fits your workflow.
            </p>

            <p className="text-base sm:text-lg text-neutral-900 dark:text-neutral-100 font-medium">
              Because your repo deserves better than a blank README.
            </p>
          </motion.div>

          {/* Floating card - right */}
          <motion.div
            initial={{ opacity: 0, x: 20, y: 20 }}
            whileInView={{ opacity: 1, x: 40, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="absolute right-0 bottom-0 -z-10 lg:z-0 lg:right-0 w-40 h-32"
          >
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">Speed</span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-500">Streaming responses built for devs</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
