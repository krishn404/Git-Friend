'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Github } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'

const PHRASES = ['Describe your Git issue', 'AI responds with exact commands']
const PHRASE_DURATION_MS = 2500

function ScribbleCircle() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 260 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <motion.ellipse
        cx="130" cy="55" rx="112" ry="44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        className="text-foreground/25"
        pathLength="1"
        strokeDasharray="1"
        initial={{ strokeDashoffset: 1 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
        style={{ transform: 'rotate(-4deg)', transformOrigin: '130px 55px' }}
      />
      <motion.ellipse
        cx="132" cy="57" rx="118" ry="47"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="3 7"
        className="text-foreground/12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        style={{ transform: 'rotate(3deg)', transformOrigin: '130px 55px' }}
      />
    </svg>
  )
}

export function Features() {
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PHRASES.length)
    }, PHRASE_DURATION_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="bg-gray-50 py-16 md:py-32 dark:bg-transparent">
      <div className="mx-auto max-w-3xl lg:max-w-5xl px-6">
        <div className="relative z-10 grid grid-cols-6 gap-3">

          {/* ─── Card 1: 100% Dev-Controlled ─── */}
          <Card className="relative col-span-full flex overflow-hidden lg:col-span-2">
            <CardContent className="relative m-auto pt-6 w-full flex flex-col items-center">
              <div className="relative h-28 w-full flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-64 h-full">
                    <ScribbleCircle />
                  </div>
                </div>
                <span className="relative z-10 text-[5rem] font-black tracking-tighter leading-none text-foreground select-none">
                  100<span className="text-foreground/30 text-[3.5rem]">%</span>
                </span>
              </div>
              <div className="mt-6 text-center">
                <h2 className="text-xl font-extrabold tracking-tight text-foreground">
                  Dev-Controlled
                </h2>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Every command. Every commit. Yours.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ─── Card 2: Secure OAuth ─── */}
          <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
            <CardContent className="pt-6">
              <div className="relative mx-auto flex aspect-square size-32 items-center justify-center gap-3 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                <Github className="h-11 w-11 text-foreground/60" strokeWidth={1.5} />
                <FcGoogle className="h-11 w-11" />
              </div>
              <div className="mt-6 space-y-1 text-center">
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Secure OAuth Access
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Google and GitHub login only. No personal access tokens.
                  Scoped permissions by default.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ─── Card 3: Fast by Design ─── */}
          <Card className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
            <CardContent className="pt-6">
              <div className="min-h-[7rem] flex items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={PHRASES[phraseIndex]}
                    className="text-sm font-medium text-foreground/50 tracking-wide text-center"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    {PHRASES[phraseIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <div className="mt-14 space-y-1 text-center">
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Fast by Design
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Low-latency streaming responses optimized for real developer workflows.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ─── Card 4: README in Seconds — full width ─── */}
          <Card className="relative col-span-full overflow-hidden">
            <CardContent className="grid pt-6 sm:grid-cols-3 gap-6">

              {/* Left: icon + text */}
              <div className="relative z-10 flex flex-col justify-between space-y-8 col-span-1">
                <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5">
                  <FileText className="m-auto size-5 text-foreground/60" strokeWidth={1} />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                    README in Seconds
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    AI-generated markdown with GitHub-style formatting. Edit,
                    preview, and ship instantly.
                  </p>
                </div>
              </div>

              {/* Right: code window — spans 2 cols */}
              <div className="relative col-span-2 -mb-6 -mr-6 mt-0 h-fit overflow-hidden border-l border-t border-border bg-muted/30 rounded-tl-xl">
                <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
                  <span className="size-2 rounded-full bg-foreground/15" />
                  <span className="size-2 rounded-full bg-foreground/15" />
                  <span className="size-2 rounded-full bg-foreground/15" />
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground tracking-wider">README.md</span>
                </div>
                <div className="relative overflow-hidden p-4 font-mono text-[12px] leading-relaxed text-foreground/70">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
                  {[
                    '# 🚀 My Project',
                    '',
                    '> AI-powered Git workflows for modern developers.',
                    '',
                    '## Install',
                    '',
                    'npm install gitfriend',
                    '',
                    '## Usage',
                    '',
                    'gitfriend chat --repo .',
                  ].map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07, duration: 0.2 }}
                      className={`mb-0.5 ${line === '' ? 'h-3' : ''} ${line.startsWith('#') ? 'text-foreground font-semibold' : ''} ${line.startsWith('>') ? 'text-muted-foreground italic' : ''}`}
                    >
                      {line}
                    </motion.div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  )
}