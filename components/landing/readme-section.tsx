'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Streamdown } from 'streamdown'
import { AnimatedSection } from './animated-section'

type Step = 'idle' | 'input' | 'analyzing' | 'output'

const REPO_URL = 'https://github.com/vercel/streamdown'

const MARKDOWN = `# Streamdown

Streaming Markdown renderer for AI and real-time content.

## Features

- Incremental markdown streaming
- Preserves formatting during generation
- Designed for AI responses

## Installation

\`\`\`bash
npm install streamdown
\`\`\`

## Usage

\`\`\`tsx
import { Streamdown } from '@vercel/streamdown'

<Streamdown>{content}</Streamdown>
\`\`\`

## Comparison

| Feature | Streamdown | Static Markdown |
|--------|------------|-----------------|
| Streaming | Yes | No |
| AI-ready | Yes | No |
| GitHub Flavored | Yes | Yes |

`

export function ReadmeSection() {
  const [step, setStep] = useState<Step>('idle')
  const hasStarted = useRef(false)

  return (
    <section className="border-t border-neutral-200 dark:border-neutral-800 py-28 sm:py-36 bg-neutral-50 dark:bg-neutral-900/30">
      <motion.div
        className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
        whileInView={() => {
          if (!hasStarted.current) {
            hasStarted.current = true
            runTimeline(setStep)
          }
        }}
        viewport={{ once: true, margin: '-120px' }}
      >
        <AnimatedSection className="text-center mb-20">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-4xl">
            README generation, live
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Streaming markdown to rendered output.
          </p>
        </AnimatedSection>

        <div className="relative mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            {step === 'input' && <InputStage key="input" />}
            {step === 'analyzing' && <AnalyzingStage key="analyzing" />}
            {step === 'output' && <OutputStage key="output" />}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  )
}

/* ---------------- TIMELINE ---------------- */

async function runTimeline(setStep: (s: Step) => void) {
  setStep('input')
  await wait(2400)
  setStep('analyzing')
  await wait(2600)
  setStep('output')
}

/* ---------------- INPUT ---------------- */

function InputStage() {
  const [typed, setTyped] = useState('')

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setTyped(REPO_URL.slice(0, i))
      i++
      if (i > REPO_URL.length) clearInterval(interval)
    }, 42)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 text-center shadow-sm"
    >
      <p className="text-xs text-neutral-500 mb-3">Repository URL</p>
      <div className="font-mono text-sm text-neutral-900 dark:text-neutral-50 break-all">
        {typed}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          |
        </motion.span>
      </div>
    </motion.div>
  )
}

/* ---------------- ANALYZING ---------------- */

function AnalyzingStage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 p-6 shadow-sm"
    >
      <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mb-4">
        Analyzing repository structure…
      </p>

      <ul className="space-y-2 text-xs font-mono text-neutral-700 dark:text-neutral-300 mb-5">
        <li>✓ Framework detected: React</li>
        <li>✓ Package manager: npm</li>
        <li>✓ Markdown renderer: Streamdown</li>
        <li>✓ README.md missing</li>
      </ul>

      <div className="h-1 w-full bg-neutral-300 dark:bg-neutral-700 rounded overflow-hidden">
        <motion.div
          className="h-full bg-neutral-900 dark:bg-neutral-50"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}

/* ---------------- OUTPUT ---------------- */

function OutputStage() {
  const [visibleText, setVisibleText] = useState('')
  const [done, setDone] = useState(false)
  const [mode, setMode] = useState<'preview' | 'markdown'>('preview')

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      setVisibleText(MARKDOWN.slice(0, i))
      i += 4
      if (i >= MARKDOWN.length) {
        clearInterval(interval)
        setDone(true)
      }
    }, 18)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700">
        <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
          README.md
        </p>

        {done && (
          <div className="flex gap-1 text-xs">
            <button
              onClick={() => setMode('preview')}
              className={`px-2 py-1 rounded ${
                mode === 'preview'
                  ? 'bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setMode('markdown')}
              className={`px-2 py-1 rounded ${
                mode === 'markdown'
                  ? 'bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Markdown
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 text-sm max-h-[460px] overflow-y-auto">
        {!done ? (
          <pre className="font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
            {visibleText}
            <span className="opacity-50">|</span>
          </pre>
        ) : mode === 'preview' ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <Streamdown>{visibleText}</Streamdown>
          </div>
        ) : (
          <pre className="font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
            {visibleText}
          </pre>
        )}
      </div>
    </motion.div>
  )
}

/* ---------------- UTIL ---------------- */

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}