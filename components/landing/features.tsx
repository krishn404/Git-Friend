'use client'

import { FileText, Github } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { FcGoogle } from 'react-icons/fc'

const features = [
  {
    title: 'Dev-Controlled',
    subtitle: 'Every command. Every commit. Yours.',
    content: '100%'
  },
  {
    title: 'Secure OAuth',
    subtitle: 'Google and GitHub login only. No tokens.',
    icon: 'oauth'
  },
  {
    title: 'Fast by Design',
    subtitle: 'Low-latency streaming responses optimized for developers.',
    icon: 'fast'
  }
]

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 }
  }
}

export function Features() {
  return (
    <section className="py-16 md:py-32 bg-background">
      <div className="mx-auto max-w-5xl px-6">
        {/* 4-card grid - monochrome, minimal */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Card 1: Dev-Controlled */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardContent className="pt-8 pb-8 text-center flex flex-col justify-between h-full">
                <div>
                  <p className="text-5xl font-bold text-foreground">100%</p>
                  <h3 className="text-lg font-semibold text-foreground mt-4">Dev-Controlled</h3>
                  <p className="text-sm text-muted-foreground mt-2">Every command. Every commit. Yours.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Secure OAuth */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardContent className="pt-8 pb-8 text-center flex flex-col items-center justify-center gap-6">
                <div className="flex items-center justify-center gap-4">
                  <Github className="h-8 w-8 text-foreground/70" strokeWidth={1.5} />
                  <FcGoogle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Secure OAuth</h3>
                  <p className="text-sm text-muted-foreground mt-2">Google and GitHub login only. No tokens.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Fast by Design */}
          <motion.div variants={itemVariants}>
            <Card className="h-full">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="mb-6 h-12 flex items-center justify-center">
                  <p className="text-sm font-medium text-muted-foreground">⚡ Instant responses</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Fast by Design</h3>
                  <p className="text-sm text-muted-foreground mt-2">Low-latency streaming optimized for developers.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 4: README in Seconds - full width */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <Card className="h-full">
              <CardContent className="pt-8 pb-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left side */}
                  <div className="flex flex-col justify-center space-y-4">
                    <div>
                      <FileText className="h-8 w-8 text-foreground/70 mb-4" strokeWidth={1.5} />
                      <h3 className="text-lg font-semibold text-foreground">README in Seconds</h3>
                      <p className="text-sm text-muted-foreground mt-2">AI-generated markdown with GitHub-style formatting. Edit, preview, and ship instantly.</p>
                    </div>
                  </div>

                  {/* Right side - code preview */}
                  <div className="bg-muted border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                      <span className="h-2 w-2 rounded-full bg-foreground/30" />
                      <span className="h-2 w-2 rounded-full bg-foreground/30" />
                      <span className="h-2 w-2 rounded-full bg-foreground/30" />
                      <span className="ml-2 text-xs font-mono text-muted-foreground">README.md</span>
                    </div>
                    <div className="p-4 font-mono text-xs leading-relaxed text-foreground/70 space-y-1">
                      <div># My Project</div>
                      <div className="text-muted-foreground"># AI-powered Git workflows</div>
                      <div className="mt-3">## Install</div>
                      <div className="text-foreground">npm install gitfriend</div>
                      <div className="mt-3">## Usage</div>
                      <div className="text-foreground">gitfriend chat --repo .</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
