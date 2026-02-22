import {
  MessageSquare,
  FileText,
  Github,
  Sliders,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const bentoFeatures: {
  title: string
  description: string
  span?: string
  icon: LucideIcon
}[] = [
  {
    title: "AI Chat",
    description: "Ask, iterate, and debug Git workflows in real time.",
    span: "col-span-2",
    icon: MessageSquare,
  },
  {
    title: "README Import & Generate",
    description: "Import any repository and generate structured documentation instantly.",
    icon: FileText,
  },
  {
    title: "GitHub Integrated",
    description: "Understands repos, branches, commits, and workflows.",
    icon: Github,
  },
  {
    title: "100% Customizable README",
    description: "Edit tone, sections, formatting, and structure.",
    span: "col-span-2",
    icon: Sliders,
  },
  {
    title: "More Tools",
    description: "Git emojis, commit help, and learning utilities.",
    icon: Wrench,
  },
]

export const steps = [
  {
    number: '01',
    title: 'Paste Repository Link',
    description: 'Share your GitHub repository URL or ask a Git question.',
  },
  {
    number: '02',
    title: 'One-Click Generation',
    description: 'For README: Click generate. For questions: Get instant AI response.',
  },
  {
    number: '03',
    title: 'Get Results',
    description: 'View generated README or detailed answer to your Git question.',
  },
  {
    number: '04',
    title: 'Copy & Use',
    description: 'Copy to clipboard and use directly in your repository.',
  },
]

export const faqs = [
  {
    question: 'Does this automate Git tasks in my repository?',
    answer: 'No. This is a conversational AI assistant that answers questions and generates documentation. It doesn\'t automate workflows or commit changes to your repo—it helps you learn and understand Git better.',
  },
  {
    question: 'How does README generation work?',
    answer: 'Paste your GitHub repository link, click generate, and the AI creates a README with description, setup instructions, and features based on the repo analysis.',
  },
  {
    question: 'What kind of questions can I ask?',
    answer: 'Ask anything about Git commands, GitHub workflows, branches, pull requests, conflicts, merging, or troubleshooting common issues. Get clear explanations and examples.',
  },
  {
    question: 'Is my repository data private?',
    answer: 'Your links are analyzed only when you use them. We don\'t store repository data or use it beyond your session. Your privacy comes first.',
  },
  {
    question: 'Can I use generated READMEs directly?',
    answer: 'Yes. Generated documentation can be copied and pasted directly into your repository. Feel free to edit and customize as needed.',
  },
]

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}
