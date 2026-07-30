'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function LogoCloud() {
  const logos = [
    { name: 'GitHub', src: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' },
    { name: 'VS Code', src: 'https://code.visualstudio.com/favicon.ico' },
    { name: 'Node.js', src: 'https://nodejs.org/static/images/logos/nodejs-new-pantone-black.svg' },
    { name: 'React', src: 'https://react.dev/favicon.ico' },
    { name: 'TypeScript', src: 'https://www.typescriptlang.org/favicon.ico' },
  ]

  return (
    <section className="py-16 sm:py-24 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            Built for developers on
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8 sm:gap-12"
        >
          {logos.map((logo, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1 }}
              className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400">
                {logo.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
