'use client'

import { motion } from 'framer-motion'
import { AnimatedSection } from './animated-section'
import { steps, staggerContainer, fadeInUp } from './constants'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-neutral-200 dark:border-neutral-800 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mx-auto max-w-2xl text-center mb-16">
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl"
          >
            Simple and Intuitive
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-neutral-600 dark:text-neutral-400"
          >
            Get started in minutes with our streamlined workflow.
          </motion.p>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 p-6">
                <div className="mb-4 text-4xl font-bold text-neutral-200 dark:text-neutral-800">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-50">{step.title}</h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-neutral-200 to-transparent dark:from-neutral-800" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
