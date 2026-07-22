'use client'

import Link from 'next/link'
import Image from 'next/image'

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/20 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="rounded-lg bg-foreground p-1.5 flex items-center justify-center">
                <Image
                  src="/icon.png"
                  alt="Git Friend"
                  width={20}
                  height={20}
                  className="h-5 w-5 invert"
                />
              </div>
              <span className="text-sm font-semibold text-foreground">Git Friend</span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground max-w-xs">
              AI chat for Git and GitHub. Instant README generation.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              Product
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/ai-chat" className="transition-colors hover:text-foreground">
                  AI Chat
                </Link>
              </li>
              <li>
                <Link href="/generate-readme" className="transition-colors hover:text-foreground">
                  Generate README
                </Link>
              </li>
              <li>
                <Link href="/git-mojis" className="transition-colors hover:text-foreground">
                  Git Emojis
                </Link>
              </li>
            </ul>
          </div>

          {/* Open Source */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-foreground">
              Open Source
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="https://github.com/krishn404/Git-Friend"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center gap-4 border-t border-border pt-8 text-center">
          <a
            href="https://vercel.com/oss"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              alt="Vercel OSS Program"
              src="https://vercel.com/oss/program-badge-2026.svg"
              className="h-6 w-auto"
            />
          </a>

          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Git Friend. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
