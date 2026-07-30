'use client'

import { Navbar } from '@/components/ui/navbar'
import { HeroSection } from './hero-section'
import { ProductShowcase } from './product-showcase'
import { LogoCloud } from './logo-cloud'
import { TextSection } from './text-section'
import { Features } from './features'
import { ClosingCta } from './closing-cta'
import { LandingFooter } from './landing-footer'

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-neutral-950">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <ProductShowcase />
        <LogoCloud />
        <TextSection />
        <Features />
        <ClosingCta />
      </main>

      <LandingFooter />
    </div>
  )
}
