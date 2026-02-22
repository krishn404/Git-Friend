'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AnimatedSection } from './animated-section'
import { faqs, fadeInUp } from './constants'

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-neutral-200 dark:border-neutral-800 py-20 sm:py-32 bg-neutral-50 dark:bg-neutral-900/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="mx-auto max-w-2xl text-center mb-16">
          <motion.h2
            variants={fadeInUp}
            className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg text-neutral-600 dark:text-neutral-400"
          >
            Everything you need to know about Git Friend.
          </motion.p>
        </AnimatedSection>

        <AnimatedSection className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem value={`item-${index}`} className="border-b border-neutral-200 dark:border-neutral-800">
                  <AccordionTrigger className="text-left text-base font-medium text-neutral-900 dark:text-neutral-50 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  )
}
