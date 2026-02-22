'use client'

import { Navbar } from '@/components/ui/navbar'
import { HeroSection } from './hero-section'
import { Features } from './features'
import { ReadmeSection } from './readme-section'
import { HowItWorksSection } from './how-it-works-section'
import { FaqSection } from './faq-section'
import { CtaSection } from './cta-section'
import { LandingFooter } from './landing-footer'

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <Features />
        <ReadmeSection />
        <HowItWorksSection />
        <FaqSection />
        <CtaSection />
      </main>

      <LandingFooter />
    </div>
  )
}
