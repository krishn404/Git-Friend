'use client'

import Link from 'next/link'
import Image from 'next/image'

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-neutral-900 dark:bg-neutral-50 p-1.5 flex items-center justify-center">
                <Image
                  src="/icon.png"
                  alt="Git Friend"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
              </div>
              <span className="text-sm font-semibold">Git Friend</span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 max-w-xs">
              AI chat for Git and GitHub. Instant README generation.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-50">
              Product
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <Link href="/ai-chat" className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-50">
                  AI Chat
                </Link>
              </li>
              <li>
                <Link href="/generate-readme" className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-50">
                  Generate README
                </Link>
              </li>
              <li>
                <Link href="/git-mojis" className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-50">
                  Git Emojis
                </Link>
              </li>
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-50">
              Open Source
            </h3>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li>
                <a
                  href="https://github.com/your-org/gitfriend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-neutral-900 dark:hover:text-neutral-50"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-4 border-t border-neutral-200 dark:border-neutral-800 pt-8 text-center">
          <a
            href="https://vercel.com/oss"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="Vercel OSS Program"
              src="https://vercel.com/oss/program-badge.svg"
              className="h-6 w-auto"
            />
          </a>

          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            © {new Date().getFullYear()} Git Friend. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}