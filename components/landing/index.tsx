'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Bot, Check, ChevronRight, FileText, GitBranch, Github, GitPullRequest, Menu, Terminal } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const workflow = [
  { icon: Bot, title: 'Ask anything Git', description: 'Get crisp answers for commands, conflicts, branches, and pull requests.' },
  { icon: Github, title: 'Bring in your repo', description: 'Connect a GitHub repository and give your work the context it deserves.' },
  { icon: FileText, title: 'Ship a better README', description: 'Turn source code into clear, useful documentation in a few clicks.' },
]

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-white text-zinc-950 transition-colors dark:bg-[#09090b] dark:text-zinc-50">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#09090b]/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-6">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Git Friend home">
            <Image src="/icon.png" width={32} height={32} alt="" className="h-8 w-8 invert dark:invert-0" />
            <span className="text-sm font-semibold tracking-tight">Git Friend</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-zinc-600 md:flex dark:text-zinc-400">
            <a href="#product" className="transition-colors hover:text-zinc-950 dark:hover:text-white">Product</a>
            <a href="#how-it-works" className="transition-colors hover:text-zinc-950 dark:hover:text-white">How it works</a>
            <a href="#workflow" className="transition-colors hover:text-zinc-950 dark:hover:text-white">Workflow</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/ai-chat" className="hidden rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5 sm:inline-flex dark:bg-white dark:text-zinc-950">
              Try Git Friend
            </Link>
            <Menu className="h-5 w-5 md:hidden" />
          </div>
        </div>
      </header>

      <main>
        <section className="landing-grid relative isolate pt-32 sm:pt-40">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(ellipse_at_top,rgba(161,161,170,0.16),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(82,82,91,0.25),transparent_65%)]" />
          <div className="mx-auto max-w-6xl px-5 lg:px-6">
            <div className="mx-auto max-w-3xl text-center">
            <div className="relative flex justify-center">
                <a
                  href="https://vercel.com/blog/vercel-open-source-program-winter-2026-cohort#gitfriend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-white/20"
                >
                  <svg
                    viewBox="0 0 76 65"
                    className="h-3 w-3 fill-current text-zinc-950 dark:text-white"
                    aria-hidden="true"
                  >
                    <path d="M38 0L75.5 65H0.5L38 0Z" />
                  </svg>

                  <span>Backed by Vercel</span>

                  <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-max max-w-xs -translate-x-1/2 opacity-0 blur-sm transition-all duration-300 ease-out group-hover:translate-y-1 group-hover:opacity-100 group-hover:blur-10">
                  <div className="rounded-md border border-zinc-200 bg-white p-2 shadow-xl dark:border-white/10 dark:bg-zinc-900">
                    <img
                      src="https://vercel.com/oss/program-badge-2026.svg"
                      alt="Vercel OSS Program"
                      className="h-6 w-auto"
                    />
                  </div>
                </div>
                </a>
              </div>
              <h1 className="mt-7 text-balance text-4xl font-medium tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                Build with Git.<br />
                <span className="text-zinc-500 dark:text-zinc-400">Move with confidence.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400">
                Your AI teammate for Git and GitHub. Untangle tricky workflows, understand any repository, and turn your code into documentation people want to read.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/ai-chat" className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-950 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-white dark:text-zinc-950">
                  Ask Git Friend <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/generate-readme" className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 py-3 text-sm font-medium transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                  Generate a README <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-6 flex items-center justify-center gap-5 text-xs text-zinc-500 dark:text-zinc-500">
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> No setup required</span>
                <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Built for developers</span>
              </div>
            </div>

            <div className="relative mx-auto mt-16 max-w-5xl sm:mt-20">
              <div className="absolute -inset-x-16 top-12 -z-10 h-80 rounded-[3rem] bg-gradient-to-r from-violet-100/70 via-transparent to-emerald-100/60 blur-3xl dark:from-violet-500/10 dark:to-emerald-500/10" />
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-2 shadow-[0_24px_70px_-26px_rgba(24,24,27,.32)] dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-[0_24px_70px_-26px_rgba(0,0,0,.7)]">
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111113]">
                  <div className="flex h-11 items-center border-b border-zinc-200 px-4 dark:border-white/10">
                    <div className="flex gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" /><i className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" /><i className="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" /></div>
                    <div className="mx-auto flex items-center gap-2 text-xs text-zinc-500"><Bot className="h-3.5 w-3.5" /> Git Friend AI</div>
                  </div>
                  <div className="grid min-h-[390px] md:grid-cols-[190px_1fr]">
                    <aside className="hidden border-r border-zinc-200 bg-zinc-50 p-3 text-xs md:block dark:border-white/10 dark:bg-white/[0.02]">
                      <div className="mb-5 flex items-center gap-2 px-2 text-sm font-semibold"><GitBranch className="h-4 w-4" /> workspace</div>
                      <div className="rounded-md bg-zinc-200/70 px-2 py-2 font-medium text-zinc-900 dark:bg-white/10 dark:text-white">AI Chat</div>
                      <div className="mt-1 px-2 py-2 text-zinc-500">README Editor</div>
                      <div className="mt-6 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Repository</div>
                      <div className="mt-2 flex items-center gap-2 px-2 py-1.5 text-zinc-600 dark:text-zinc-400"><Github className="h-3.5 w-3.5" /> acme/web-app</div>
                    </aside>
                    <div className="flex flex-col p-4 sm:p-6">
                      <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">How do I safely rebase this branch?</p><p className="mt-1 text-xs text-zinc-500">Based on your repository context</p></div><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Repo connected</span></div>
                      <div className="mt-7 max-w-xl rounded-2xl rounded-tl-sm border border-zinc-200 bg-zinc-50 p-4 text-sm leading-6 dark:border-white/10 dark:bg-white/[0.035]">
                        <p className="font-medium">Here&apos;s the safest path:</p>
                        <ol className="mt-3 space-y-2 text-zinc-600 dark:text-zinc-400"><li><span className="mr-2 text-zinc-400">01</span>Update your local main branch.</li><li><span className="mr-2 text-zinc-400">02</span>Rebase your feature branch onto it.</li><li><span className="mr-2 text-zinc-400">03</span>Resolve conflicts, then force push with lease.</li></ol>
                      </div>
                      <div className="mt-auto flex items-center gap-3 rounded-lg border border-zinc-200 p-3 text-sm text-zinc-400 dark:border-white/10"><span>Ask a follow-up about this repo…</span><span className="ml-auto grid h-7 w-7 place-items-center rounded-md bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"><ArrowRight className="h-3.5 w-3.5" /></span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 gap-2 whitespace-nowrap rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-zinc-900">
                {['Git guidance', 'Repo context', 'README generation'].map((item, index) => <span key={item} className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs text-zinc-600 dark:bg-white/5 dark:text-zinc-300"><span className={index === 0 ? 'mr-1.5 text-violet-500' : index === 1 ? 'mr-1.5 text-emerald-500' : 'mr-1.5 text-amber-500'}>●</span>{item}</span>)}
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="border-y border-zinc-200 bg-zinc-50/70 py-20 dark:border-white/10 dark:bg-white/[0.02] sm:py-28">
          <div className="mx-auto max-w-6xl px-5 lg:px-6">
            <div className="max-w-2xl"><span className="text-xs font-semibold uppercase tracking-[.18em] text-zinc-500">A developer-first workflow</span><h2 className="mt-4 text-3xl font-medium tracking-[-.04em] sm:text-5xl">Everything between an idea and a clean commit.</h2><p className="mt-5 text-base leading-7 text-zinc-600 dark:text-zinc-400">Git Friend gives every developer a calm, context-aware place to think through their next move.</p></div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3 dark:border-white/10 dark:bg-white/10">
              {workflow.map(({ icon: Icon, title, description }) => <article key={title} className="bg-white p-7 dark:bg-[#09090b]"><span className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-white/5"><Icon className="h-4 w-4" /></span><h3 className="mt-8 text-lg font-medium">{title}</h3><p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{description}</p><Link href={title === 'Ship a better README' ? '/generate-readme' : '/ai-chat'} className="mt-6 inline-flex items-center gap-1 text-sm font-medium hover:underline">Explore <ArrowRight className="h-3.5 w-3.5" /></Link></article>)}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-dots border-b border-zinc-200 py-24 dark:border-white/10 sm:py-32">
          <div className="mx-auto grid max-w-6xl gap-14 px-5 lg:grid-cols-[.85fr_1.15fr] lg:px-6">
            <div><span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-zinc-500"><Terminal className="h-3.5 w-3.5" /> Context, not complexity</span><h2 className="mt-5 text-3xl font-medium tracking-[-.04em] sm:text-5xl">From repo to README in minutes.</h2><p className="mt-5 max-w-md leading-7 text-zinc-600 dark:text-zinc-400">Paste a GitHub link. Git Friend reads the shape of your project, then helps you create documentation that makes it easy to adopt and contribute to.</p><Link href="/generate-readme" className="mt-8 inline-flex items-center gap-2 text-sm font-medium">Generate a README <ArrowRight className="h-4 w-4" /></Link></div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/[0.03]"><div className="rounded-xl border border-zinc-200 dark:border-white/10"><div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 text-xs dark:border-white/10"><span className="flex items-center gap-2 font-medium"><Github className="h-4 w-4" /> octo-labs / api-kit</span><span className="text-zinc-500">Public repository</span></div><div className="p-5"><div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-white/10 dark:bg-white/[0.03]"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Analyzing project structure <span className="ml-auto text-xs text-zinc-500">Complete</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{['Installation and setup', 'API reference', 'Contributing guide', 'Feature overview'].map((item, index) => <div key={item} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-white/10"><div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-zinc-500" /> {item}<Check className="ml-auto h-3.5 w-3.5 text-emerald-500" /></div><div className="mt-3 h-1.5 rounded-full bg-zinc-100 dark:bg-white/10"><div className="h-full rounded-full bg-zinc-900 dark:bg-white" style={{ width: `${82 + index * 4}%` }} /></div></div>)}</div><div className="mt-5 rounded-lg bg-zinc-950 p-4 text-sm text-white dark:bg-white dark:text-zinc-950"><span className="text-zinc-400 dark:text-zinc-500">README.md</span><p className="mt-2 font-medium">A practical toolkit for building with APIs.</p><p className="mt-1 text-xs opacity-65">Generated from your actual codebase, ready to refine.</p></div></div></div></div>
          </div>
        </section>

        <section id="workflow" className="py-20 sm:py-28"><div className="mx-auto max-w-6xl px-5 lg:px-6"><div className="rounded-3xl bg-zinc-950 px-6 py-14 text-center text-white sm:px-12 sm:py-20 dark:bg-white dark:text-zinc-950"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs dark:border-zinc-200 dark:bg-zinc-100"><GitPullRequest className="h-3.5 w-3.5" /> Less guessing. More shipping.</span><h2 className="mx-auto mt-6 max-w-2xl text-3xl font-medium tracking-[-.045em] sm:text-5xl">Your next Git problem already has a teammate.</h2><p className="mx-auto mt-5 max-w-xl text-zinc-400 dark:text-zinc-600">Ask a question, bring a repository, or make your README useful. Start with the work in front of you.</p><Link href="/ai-chat" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:-translate-y-0.5 dark:bg-zinc-950 dark:text-white">Start with Git Friend <ArrowRight className="h-4 w-4" /></Link></div></div></section>
      </main>

      <footer className="border-t border-zinc-200 py-8 dark:border-white/10"><div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-6"><div className="flex items-center gap-2"><Image src="/icon.png" width={18} height={18} alt="Git Friend" className="invert dark:invert-0" /><span>Git Friend — a better way to work with Git.</span></div><div className="flex gap-4"><Link href="/ai-chat" className="hover:text-zinc-950 dark:hover:text-white">AI Chat</Link><Link href="/generate-readme" className="hover:text-zinc-950 dark:hover:text-white">README Generator</Link><Link href="/git-mojis" className="hover:text-zinc-950 dark:hover:text-white">Git Mojis</Link></div></div></footer>
    </div>
  )
}
