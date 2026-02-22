'use client'

import { motion } from 'framer-motion'
import { Code2, Zap } from 'lucide-react'
import { AnimatedSection } from './animated-section'
import { fadeInUp } from './constants'

export function ReadmeSection() {
  return (
    <section className="border-t border-neutral-200 dark:border-neutral-800 py-20 sm:py-32 bg-neutral-50 dark:bg-neutral-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mx-auto max-w-2xl text-center mb-16">
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl"
          >
            Generate README in Seconds
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-neutral-600 dark:text-neutral-400"
          >
            Paste a repository link and get professional documentation instantly.
          </motion.p>
        </AnimatedSection>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 lg:grid-cols-2 items-center"
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 sm:p-8"
            >
              <div className="mb-4 inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-3">
                <Code2 className="h-6 w-6 text-neutral-900 dark:text-neutral-50" strokeWidth={2} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-50">Step 1: Paste URL</h3>
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                Enter your GitHub repository link. Works with public or private repos (if authenticated).
              </p>
              <div className="rounded-lg bg-neutral-100 dark:bg-neutral-800 p-3 text-xs font-mono text-neutral-700 dark:text-neutral-300">
                https://github.com/username/project
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6 sm:p-8"
            >
              <div className="mb-4 inline-flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-3">
                <Zap className="h-6 w-6 text-neutral-900 dark:text-neutral-50" strokeWidth={2} />
              </div>
              <h3 className="mb-3 text-xl font-semibold text-neutral-900 dark:text-neutral-50">Step 2: Click Generate</h3>
              <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                One click. That&apos;s it. The AI analyzes your repository and creates documentation.
              </p>
              <button className="rounded-lg bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80">
                Generate README
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 overflow-hidden"
          >
            <div className="bg-neutral-100 dark:bg-neutral-800 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">README.md</p>
            </div>
            <div className="p-6 sm:p-8 space-y-4 max-h-96 overflow-y-auto text-sm text-neutral-700 dark:text-neutral-300">
              <p className="font-bold text-lg text-neutral-900 dark:text-neutral-50"># Project Name</p>
              <p>Brief description of your project and what it does.</p>

              <p className="font-semibold text-neutral-900 dark:text-neutral-50">## Features</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Feature one with details</li>
                <li>Feature two with details</li>
                <li>Feature three with details</li>
              </ul>

              <p className="font-semibold text-neutral-900 dark:text-neutral-50">## Installation</p>
              <div className="bg-neutral-100 dark:bg-neutral-800 rounded p-2 font-mono text-xs">
                npm install<br />npm start
              </div>

              <p className="font-semibold text-neutral-900 dark:text-neutral-50">## Usage</p>
              <p className="text-xs">Clear examples of how to use your project...</p>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-4 flex gap-2">
              <button className="flex-1 rounded-lg bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 px-3 py-2 text-xs font-medium transition-opacity hover:opacity-80">
                Copy to Clipboard
              </button>
              <button className="flex-1 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-50 px-3 py-2 text-xs font-medium transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Download
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
