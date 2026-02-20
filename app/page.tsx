"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight,
  GitBranch,
  MessageSquare,
  FileText,
  Shield,
  Sparkles,
  Terminal,
  Layers,
} from "lucide-react"
import BadgeShine from "@/components/ui/badge-shine"
import TextAnimatedGradient from "@/components/ui/text-animated-gradient"
import { Navbar } from "@/components/ui/navbar"
import { AnimatedBeams } from "@/components/ui/animated-beams"

const tools = [
  {
    title: "AI Git Copilot",
    description: "Ask anything about Git or GitHub and get step-by-step commands, context, and reasons.",
    icon: GitBranch,
    href: "/ai-chat",
    pill: "Guided commands",
  },
  {
    title: "README Generator",
    description: "Drop a repo URL and receive a complete README with setup, usage, and helpful sections.",
    icon: FileText,
    href: "/generate-readme",
    pill: "Docs in seconds",
  },
  {
    title: "Commit Voice",
    description: "Let AI suggest friendly, descriptive commit messages while you learn the best patterns.",
    icon: MessageSquare,
    href: "/git-mojis",
    pill: "Confidence boost",
  },
]

const highlights = [
  {
    title: "Learn by doing",
    description: "Follow step-by-step answers, copy the commands, and understand why each flag matters.",
    icon: Layers,
  },
  {
    title: "Secure by default",
    description: "We never persist repo data. Transient sessions, encrypted transit, local-first approach.",
    icon: Shield,
  },
  {
    title: "Docs without friction",
    description: "Paste a repo URL and the README generator fills in setup, usage, and badges automatically.",
    icon: Sparkles,
  },
]

const testimonials = [
  {
    quote:
      "Git Friend feels like pair programming with someone who already knows our branching model. Our onboarding checklist is down to minutes.",
    name: "Priya Verma",
    role: "Engineering Manager · Finch Labs",
  },
  {
    quote: "Auto-generated READMEs plus commit prompts saved our hackathon. The interface stays out of the way.",
    name: "Noah Reeves",
    role: "Founder · Launchbase",
  },
]

export default function LandingPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <AnimatedBeams className="opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#0ea5e933,transparent_45%)]" />
      </div>

      <Navbar transparent />

      <main className="relative z-10 flex-1 pt-24 sm:pt-28">
        <section className="container flex flex-col items-center gap-12 pb-24 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center justify-center">
              <BadgeShine>Built for Git first-timers</BadgeShine>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl lg:leading-tight"
            >
              Learn Git {" "}
              <TextAnimatedGradient className="text-gradient">
                with an AI friend
              </TextAnimatedGradient>{" "}
              inside your browser.
            </motion.h1>
            <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Git Friend answers every Git question in natural language, walks you through commands, and writes README
              files from any repo URL. Learn by chatting, experiment safely, and ship docs without context switching.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/ai-chat"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5"
              >
                Start chatting with GitFriend
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/generate-readme"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-muted/50"
              >
                Generate a README
              </Link>
            </motion.div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="w-full max-w-3xl"
          >
            <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-[0_20px_70px_-40px_rgba(15,23,42,0.7)] backdrop-blur">
              <div className="flex items-center justify-between border-b border-border/60 pb-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  git session
                </span>
                <span>Live</span>
              </div>

              <div className="mt-6 space-y-6 text-sm leading-relaxed">
                <div>
                  <p className="text-muted-foreground">You</p>
                  <div className="mt-2 rounded-2xl border border-border/80 bg-background/40 p-4 font-mono text-xs">
                    I just forked a repo. How do I sync my fork with the original project without losing my edits?
                  </div>
                </div>
                <div>
                  <p className="inline-flex items-center gap-2 text-muted-foreground">
                    <GitBranch className="h-4 w-4 text-sky-500" />
                    Git Friend
                  </p>
                  <div className="mt-2 space-y-3 rounded-2xl border border-border/50 bg-sky-500/5 p-4">
                    <p className="font-medium text-foreground">Your safest move:</p>
                    <div className="rounded-2xl border border-sky-500/30 bg-background/70 p-3 font-mono text-xs leading-relaxed">
                      git remote add upstream https://github.com/original/repo.git
                      <br />
                      git fetch upstream
                      <br />
                      git checkout main
                      <br />
                      git merge upstream/main
                    </div>
                    <p className="text-sm text-muted-foreground">
                      I&apos;ll explain each command as you run it and keep your branch clean the whole time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-border/60 bg-card/70 p-6">
              <p className="text-sm text-muted-foreground">Documentation preview</p>
              <div className="mt-4 rounded-2xl border border-border/50 bg-background/60 p-4">
                <Image
                  src="/image.jpg"
                  alt="Git Friend interface preview"
                  width={900}
                  height={640}
                  priority
                  className="rounded-2xl border border-border/40 object-cover"
                />
              </div>
            </div>
          </motion.div>
        </section>

        <section className="container space-y-10 pb-24">
          <div className="flex flex-col gap-4 text-center sm:text-left">
            <p className="text-sm font-medium text-sky-500">Product family</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything you need to feel confident</h2>
            <p className="text-muted-foreground sm:max-w-2xl">
              Use chat to stay unstuck, spin up a README from any repository, and keep your commits on-message.
              Git Friend keeps the learning curve gentle while you ship real work.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group rounded-3xl border border-border/60 bg-card/60 p-6 transition hover:-translate-y-1 hover:border-sky-500/40"
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-border/40 px-3 py-1 text-xs text-muted-foreground">
                  {tool.pill}
                </div>
                <tool.icon className="mt-6 h-10 w-10 text-sky-500" />
                <h3 className="mt-6 text-2xl font-semibold">{tool.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{tool.description}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-500">
                  Explore
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="container grid gap-12 pb-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border/70 bg-card/70 p-8">
            <p className="text-sm font-medium text-sky-500">Learning system</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Opinionated defaults that teach good habits</h2>
            <p className="mt-4 text-muted-foreground">
              Every answer includes context, every template comes pre-filled, and every suggestion nudges you toward best practices.
              You can tweak anything, but you rarely need to.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-border/60 p-5">
                  <item.icon className="h-6 w-6 text-sky-500" />
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.9)]">
                <p className="text-lg leading-relaxed">“{testimonial.quote}”</p>
                <div className="mt-6 text-sm font-medium">
                  {testimonial.name}
                  <span className="block text-muted-foreground">{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container pb-28">
          <div className="rounded-[32px] border border-border/60 bg-gradient-to-r from-background to-sky-500/10 p-10 text-center">
            <p className="text-sm font-medium text-sky-500">Ready when you are</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Learn Git and ship docs with one calm workspace.
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:mx-auto sm:max-w-2xl">
              Start free, bring any repository, and let Git Friend teach you the commands while drafting your README.
              No forced migrations—just a calmer path to learning GitHub.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/ai-chat"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white"
              >
                Create free workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="https://github.com/krishn404/Git-Friend"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground"
              >
                View on GitHub
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border/40 py-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,#0ea5e91f,transparent_45%)]" />
        <div className="container flex flex-col gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div>
            <div className="flex items-center justify-center gap-2 text-lg font-semibold sm:justify-start">
              <GitBranch className="h-5 w-5 text-sky-500" />
              Git Friend
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Calm AI for Git and GitHub workflows. Made for teams who value focus.
            </p>
          </div>
          <Link
            href="https://github.com/krishn404/Git-Friend"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/40"
          >
            <ArrowRight className="h-4 w-4 rotate-[-45deg]" />
            Star on GitHub
          </Link>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground/80">
          © {new Date().getFullYear()} Git Friend. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
