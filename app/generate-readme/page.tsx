"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserAuthButton } from "@/components/auth/user-auth-button"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  GitBranch,
  Copy,
  Check,
  FileText,
  BookOpen,
  Sun,
  Moon,
  Sparkles,
  Zap,
  Github,
  Code,
  CheckCircle2,
  Lock,
  Lightbulb,
  X,
  AlertCircle,
  Download,
  Star,
  GitFork,
  Clock,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"
import { TextShimmerWave } from "@/components/core/text-shimmer-wave"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

export default function GenerateReadme() {
  // Array of README tips
  const readmeTips = [
    "GitHub's most starred README contains only emojis! 🌟",
    "Adding screenshots to your README can increase project adoption by up to 30%.",
    "A good README should answer: what, why, and how.",
    "Including a 'Quick Start' section helps new users get up and running faster.",
    "Badges in your README provide quick visual indicators of project status.",
    "Keep your installation instructions up-to-date to reduce onboarding friction.",
    "A table of contents helps users navigate longer READMEs.",
    "Including a contributing guide encourages community participation.",
    "Explain the problem your project solves in the first paragraph.",
    "Use code examples to show how your project works.",
  ]

  // Array of README facts for the shimmer animation
  const readmeFacts = [
    "Creating the perfect README...",
    "Analyzing your repository...",
    "Crafting documentation...",
    "Generating content...",
    "Building your project story...",
    "Structuring documentation...",
    "Extracting key features...",
    "Organizing installation steps...",
  ]

  // Example repositories
  const exampleRepos = [
    { name: "React", owner: "facebook/react", icon: <Code className="h-5 w-5" /> },
    { name: "Next.js", owner: "vercel/next.js", icon: <Zap className="h-5 w-5" /> },
    { name: "TailwindCSS", owner: "tailwindlabs/tailwindcss", icon: <Sparkles className="h-5 w-5" /> },
  ]

  const [repoUrl, setRepoUrl] = useState("")
  const [generatedReadme, setGeneratedReadme] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [repoData, setRepoData] = useState<{
    name: string
    description: string
    language: string
    stars: number
    forks: number
    owner: string
    created_at?: string
    updated_at?: string
  } | null>(null)
  const { theme, setTheme } = useTheme()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [currentFactIndex, setCurrentFactIndex] = useState(0)
  const [showOverlay, setShowOverlay] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isPro, setIsPro] = useState(false)
  const [customRequirements, setCustomRequirements] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [hoverState, setHoverState] = useState({
    card: false,
    button: false,
    examples: Array(exampleRepos.length).fill(false),
  })

  // Steps in the generation process
  const steps = [
    { name: "Fetching Repository", description: "Connecting to GitHub and retrieving repository data" },
    { name: "Analyzing Code Structure", description: "Examining files, folders, and dependencies" },
    { name: "Understanding Project", description: "Identifying frameworks, libraries, and project purpose" },
    { name: "Formatting Content", description: "Creating a well-structured README with all necessary sections" },
  ]

  // Rotate through tips during generation
  useEffect(() => {
    if (isGenerating) {
      const tipInterval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % readmeTips.length)
      }, 5000)

      const factInterval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % readmeFacts.length)
      }, 3000)

      return () => {
        clearInterval(tipInterval)
        clearInterval(factInterval)
      }
    }
  }, [isGenerating])

  // Handle escape key to close overlay
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showOverlay) {
        setShowOverlay(false)
        if (isGenerating) {
          setIsGenerating(false)
        }
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [showOverlay, isGenerating])

  // Handle click outside overlay content to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        setShowOverlay(false)
        if (isGenerating) {
          setIsGenerating(false)
        }
      }
    }

    if (showOverlay) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showOverlay, isGenerating])

  const validateRepoUrl = (url: string) => {
    // Simple validation for GitHub repository URL
    const githubRegex = /^https?:\/\/github\.com\/[^/]+\/[^/]+\/?$/i
    return githubRegex.test(url)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && validateRepoUrl(repoUrl)) {
      fetchRepoData()
    }
  }

  const fetchRepoData = async () => {
    if (!validateRepoUrl(repoUrl)) {
      setError("Please enter a valid GitHub repository URL")
      return
    }

    setError(null)
    setIsGenerating(true)
    setShowOverlay(true)
    setCurrentStep(0)
    setProgress(0)
    setRepoData(null)
    setGeneratedReadme("")

    try {
      // Extract owner and repo name from URL
      const urlParts = repoUrl.split("/")
      const owner = urlParts[urlParts.length - 2]
      const repo = urlParts[urlParts.length - 1].replace(".git", "")

      // Set initial repo data
      setRepoData({
        name: repo,
        description: "Fetching repository description...",
        language: "Analyzing...",
        stars: 0,
        forks: 0,
        owner: owner,
      })

      // Move to step 1 - Analyzing Code Structure
      setTimeout(() => {
        setCurrentStep(1)
        setProgress(25)
      }, 2000)

      // Move to step 2 - Understanding Project
      setTimeout(() => {
        setCurrentStep(2)
        setProgress(50)
      }, 4000)

      // Move to step 3 - Formatting Content
      setTimeout(() => {
        setCurrentStep(3)
        setProgress(75)
      }, 6000)

      // Call our API to generate the README
      const response = await fetch("/api/generate-readme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoUrl,
          customRequirements: isPro && customRequirements ? customRequirements : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate README")
      }

      const data = await response.json()
      setGeneratedReadme(data.readme)

      // Update repo data if available
      if (data.repoData) {
        setRepoData(data.repoData)
      }

      setProgress(100)

      // Keep overlay visible for a moment to show completion
      setTimeout(() => {
        setShowOverlay(false)
        setIsGenerating(false)
      }, 1500)
    } catch (error) {
      console.error("Error generating README:", error)
      setError(error instanceof Error ? error.message : "Failed to generate README")
      setIsGenerating(false)
      setShowOverlay(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReadme)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadReadme = () => {
    const element = document.createElement("a")
    const file = new Blob([generatedReadme], { type: "text/markdown" })
    element.href = URL.createObjectURL(file)
    element.download = "README.md"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleExampleClick = (repo: string) => {
    setRepoUrl(`https://github.com/${repo}`)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Emoji map
  const emojiMap: { [key: string]: string } = {
    smile: "😊",
    rocket: "🚀",
    heart: "❤️",
    thumbsup: "👍",
    warning: "⚠️",
    check: "✅",
    star: "⭐",
    question: "❓",
    exclamation: "❗",
    arrow_right: "➡️",
    arrow_left: "⬅️",
    arrow_up: "⬆️",
    arrow_down: "⬇️",
    bulb: "💡",
    book: "📖",
    email: "📧",
    phone: "📞",
    calendar: "📅",
    clock: "🕒",
    wrench: "🔧",
    hammer: "🔨",
    gear: "⚙️",
    computer: "💻",
    keyboard: "⌨️",
    mouse: "🖱️",
    printer: "🖨️",
    camera: "📷",
    video_camera: "📹",
    movie_camera: "🎥",
    sound: "🔊",
    mute: "🔇",
    bell: "🔔",
    no_bell: "🔕",
    key: "🔑",
    lock: "🔒",
    unlock: "🔓",
    flag: "🚩",
    trophy: "🏆",
    football: "⚽",
    basketball: "🏀",
    baseball: "⚾",
    tennis: "🎾",
    golf: "⛳",
    car: "🚗",
    bus: "🚌",
    train: "🚆",
    airplane: "✈️",
    ship: "🚢",
    house: "🏠",
    office: "🏢",
    post_office: "🏣",
    hospital: "🏥",
    bank: "🏦",
    atm: "🏧",
    hotel: "🏨",
    convenience_store: "🏪",
    school: "🏫",
    department_store: "🏬",
    factory: "🏭",
    cup: "☕",
    fork_and_knife: "🍴",
    pizza: "🍕",
    hamburger: "🍔",
    fries: "🍟",
    ice_cream: "🍦",
    cake: "🎂",
    cookie: "🍪",
    candy: "🍬",
    popcorn: "🍿",
    wine_glass: "🍷",
    cocktail: "🍸",
    beer: "🍺",
    baby: "👶",
    boy: "👦",
    girl: "👧",
    man: "👨",
    woman: "👩",
    older_man: "👴",
    older_woman: "👵",
    police_officer: "👮",
    doctor: "⚕️",
    farmer: "🧑‍🌾",
    cook: "🧑‍🍳",
    student: "🧑‍🎓",
    singer: "🧑‍🎤",
    painter: "🧑‍🎨",
    pilot: "🧑‍✈️",
    astronaut: "🧑‍🚀",
    firefighter: "🧑‍🚒",
    detective: "🕵️",
    ninja: "🥷",
    zombie: "🧟",
    alien: "👽",
    ghost: "👻",
    skull: "💀",
    heart_eyes: "😍",
    joy: "😂",
    sob: "😭",
    angry: "😠",
    sleepy: "😴",
    mask: "😷",
    robot: "🤖",
    cat: "🐱",
    dog: "🐶",
    mouse: "🐭",
    rabbit: "🐰",
    fox: "🦊",
    bear: "🐻",
    panda: "🐼",
    koala: "🐨",
    tiger: "🐯",
    lion: "🦁",
    cow: "🐮",
    pig: "🐷",
    chicken: "🐔",
    penguin: "🐧",
    bird: "🐦",
    owl: "🦉",
    butterfly: "🦋",
    bug: "🐛",
    ant: "🐜",
    bee: "🐝",
    beetle: "🐞",
    fish: "🐟",
    whale: "🐳",
    dolphin: "🐬",
    octopus: "🐙",
    shell: "🐚",
    tree: "🌳",
    cactus: "🌵",
    rose: "🌹",
    sunflower: "🌻",
    tulip: "🌷",
    maple_leaf: "🍁",
    mushroom: "🍄",
    earth: "🌍",
    moon: "🌙",
    star: "⭐",
    comet: "☄️",
    fire: "🔥",
    cloud: "☁️",
    rainbow: "🌈",
    umbrella: "☔",
    snowflake: "❄️",
    snowman: "☃️",
    wind: "🌬️",
    tornado: "🌪️",
    fog: "🌫️",
    ocean: "🌊",
    mountain: "⛰️",
    volcano: "🌋",
    desert: "🏜️",
    beach: "🏖️",
    island: "🏝️",
    cityscape: "🏙️",
    night_sky: "🌃",
    milky_way: "🌌",
    sunrise: "🌅",
    sunset: "🌇",
    bridge: "🌉",
    statue_of_liberty: "🗽",
    eiffel_tower: "🗼",
    pyramid: " pyramids",
    fountain: "⛲",
    roller_coaster: "🎢",
    circus_tent: "🎪",
    carousel_horse: "🎠",
    ferris_wheel: "🎡",
    performing_arts: "🎭",
    video_game: "🎮",
    slot_machine: "🎰",
    billiards: "🎱",
    dart: "🎯",
    bow_and_arrow: "🏹",
    boxing_glove: "🥊",
    martial_arts_uniform: "🥋",
    weight_lifting: "🏋️",
    water_polo: "🤽",
    ice_skate: "⛸️",
    skier: "⛷️",
    snowboarder: "🏂",
    person_climbing: "🧗",
    person_fencing: "🤺",
    horse_racing: "🏇",
    swimmer: "🏊",
    runner: "🏃",
    dancer: "💃",
    man_dancing: "🕺",
    couple: "💑",
    family: "👪",
    kiss: "💏",
    heart: "❤️",
    broken_heart: "💔",
    two_hearts: "💕",
    sparkling_heart: "💖",
    revolving_hearts: "💞",
    heartbeat: "💓",
    heartpulse: "💗",
    blue_heart: "💙",
    green_heart: "💚",
    yellow_heart: "💛",
    purple_heart: "💜",
    orange_heart: "🧡",
    black_heart: "🖤",
    white_heart: "🤍",
    brown_heart: "🤎",
    red_circle: "🔴",
    blue_circle: "🔵",
    yellow_circle: "🟡",
    green_circle: "🟢",
    purple_circle: "🟣",
    orange_circle: "🟠",
    black_circle: "⚫",
    white_circle: "⚪",
    red_square: "🟥",
    blue_square: "🟦",
    yellow_square: "🟨",
    green_square: "🟩",
    purple_square: "🟪",
    orange_square: "🟧",
    black_square: "⬛",
    white_square: "⬜",
    checkered_flag: "🏁",
    triangular_flag_on_post: "🚩",
    waving_white_flag: "🏳️",
    waving_black_flag: "🏴",
    pirate_flag: "🏴‍☠️",
    rainbow_flag: "🏳️‍🌈",
    transgender_flag: "🏳️‍⚧️",
    united_nations: "🇺🇳",
    european_union: "🇪🇺",
    united_states: "🇺🇸",
    canada: "🇨🇦",
    united_kingdom: "🇬🇧",
    france: "🇫🇷",
    germany: "🇩🇪",
    italy: "🇮🇹",
    japan: "🇯🇵",
    china: "🇨🇳",
    south_korea: "🇰🇷",
    russia: "🇷🇺",
    spain: "🇪🇸",
    portugal: "🇵🇹",
    netherlands: "🇳🇱",
    sweden: "🇸🇪",
    norway: "🇳🇴",
    denmark: "🇩🇰",
    finland: "🇫🇮",
    switzerland: "🇨🇭",
    austria: "🇦🇹",
    belgium: "🇧🇪",
    ireland: "🇮🇪",
    greece: "🇬🇷",
    turkey: "🇹🇷",
    egypt: "🇪🇬",
    south_africa: "🇿🇦",
    brazil: "🇧🇷",
    argentina: "🇦🇷",
    mexico: "🇲🇽",
    india: "🇮🇳",
    australia: "🇦🇺",
    new_zealand: "🇳🇿",
    indonesia: "🇮🇩",
    thailand: "🇹🇭",
    vietnam: "🇻🇳",
    philippines: "🇵🇭",
    malaysia: "🇲🇾",
    singapore: "🇸🇬",
    hong_kong: "🇭🇰",
    taiwan: "🇹🇼",
    israel: "🇮🇱",
    saudi_arabia: "🇸🇦",
    united_arab_emirates: "🇦🇪",
    qatar: "🇶🇦",
    kuwait: "🇰🇼",
    bahrain: "🇧🇭",
    oman: "🇴🇲",
    jordan: "🇯🇴",
    lebanon: "🇱🇧",
    syria: "🇸🇾",
    iraq: "🇮🇶",
    iran: "🇮🇷",
    pakistan: "🇵🇰",
    afghanistan: "🇦🇫",
    bangladesh: "🇧🇩",
    sri_lanka: "🇱🇰",
    nepal: "🇳🇵",
    myanmar: "🇲🇲",
    cambodia: "🇰🇭",
    laos: "🇱🇦",
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-[hsl(var(--readme-bg))] text-[hsl(var(--readme-text))]">
        <header className="sticky top-0 z-40 border-b border-[hsl(var(--readme-border))] bg-[hsl(var(--readme-bg))/80] backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--readme-bg))/60]">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <GitBranch className="h-6 w-6" />
                <span className="text-xl font-bold">Git Friend</span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-[hsl(var(--readme-primary))] transition-colors">
                Home
              </Link>
              <Link
                href="/ai-chat"
                className="text-sm font-medium hover:text-[hsl(var(--readme-primary))] transition-colors"
              >
                AI Chat
              </Link>
              <Link
                href="/generate-readme"
                className="text-sm font-medium text-[hsl(var(--readme-primary))] transition-colors"
              >
                Generate Readme
              </Link>
              <Link
                href="/git-mojis"
                className="text-sm font-medium hover:text-[hsl(var(--readme-primary))] transition-colors"
              >
                Git Mojis
              </Link>
              <Link
                href="/repo-visualizer"
                className="text-sm font-medium hover:text-[hsl(var(--readme-primary))] transition-colors"
              >
                Repo Visualizer
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <UserAuthButton />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 relative">
          <div className="container max-w-6xl mx-auto py-12">
            <div className="flex justify-center mb-2">
              <div className="bg-[hsl(var(--readme-primary))/20] text-[hsl(var(--readme-primary))] px-4 py-1.5 rounded-full text-sm font-medium">
                DOCUMENTATION ASSISTANT
              </div>
            </div>

            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-5xl font-bold mb-4">
                <span>Readme</span> <span className="text-[hsl(var(--readme-primary))]">Assistant</span>{" "}
                <span>for Your</span> <span className="text-[hsl(var(--readme-primary))]">Project</span>
              </h1>
              <p className="text-[hsl(var(--readme-text-muted))] max-w-2xl mx-auto text-lg">
                Enter a GitHub repository URL and let Git Friend analyze your codebase to generate professional
                documentation in seconds.
              </p>
            </motion.div>

            {error && (
              <motion.div
                className="max-w-3xl mx-auto mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <motion.div
              className="max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onMouseEnter={() => setHoverState((prev) => ({ ...prev, card: true }))}
              onMouseLeave={() => setHoverState((prev) => ({ ...prev, card: false }))}
            >
              <Card
                className={`border-[hsl(var(--readme-border))] bg-[hsl(var(--readme-card-bg))] shadow-lg overflow-hidden transition-all duration-300 ${
                  hoverState.card ? "shadow-xl border-[hsl(var(--readme-primary))/30]" : ""
                }`}
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-[hsl(var(--readme-primary))/20] flex items-center justify-center">
                        <GitBranch className="h-5 w-5 text-[hsl(var(--readme-primary))]" />
                      </div>
                      <span className="text-xl font-medium">Generate Your README</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[hsl(var(--readme-text-muted))]">Pro Features</span>
                      <button
                        className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                          isPro ? "bg-[hsl(var(--readme-primary))]" : "bg-[hsl(var(--readme-border))]"
                        }`}
                        onClick={() => setIsPro(!isPro)}
                      >
                        <motion.div
                          className="w-4 h-4 rounded-full bg-white"
                          animate={{ x: isPro ? 6 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>

                  <p className="text-[hsl(var(--readme-text-muted))] text-sm mb-6">
                    Enter a GitHub repository URL to analyze code and generate a detailed README file that explains what
                    your project does, why it exists, and how to use it.
                  </p>

                  <div className="relative mb-6 group">
                    <div className="absolute inset-0 rounded-md -m-1 bg-gradient-to-r from-[hsl(var(--readme-primary))/0] via-[hsl(var(--readme-primary))/50] to-[hsl(var(--readme-primary))/0] opacity-0 group-hover:opacity-100 transition-opacity blur-md"></div>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--readme-text-muted))]">
                      <Github className="h-5 w-5" />
                    </div>
                    <input
                      className="w-full h-12 bg-[hsl(var(--readme-card-bg))] border border-[hsl(var(--readme-border))] rounded-md px-10 py-2 text-[hsl(var(--readme-text))] placeholder:text-[hsl(var(--readme-text-muted))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--readme-primary))] relative"
                      placeholder="https://github.com/username/repository"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>

                  {isPro && (
                    <motion.div
                      className="mb-6 p-4 border border-[hsl(var(--readme-border))] rounded-md bg-[hsl(var(--readme-bg))/50"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-[hsl(var(--readme-primary))]" />
                        <span className="text-sm font-medium">Pro Feature</span>
                      </div>
                      <p className="text-[hsl(var(--readme-text-muted))] text-xs mb-2">
                        Customize your README with specific requirements and formatting preferences.
                      </p>
                      <Textarea
                        className="w-full h-24 bg-[hsl(var(--readme-card-bg))] border border-[hsl(var(--readme-border))] rounded-md px-3 py-2 text-sm text-[hsl(var(--readme-text))] placeholder:text-[hsl(var(--readme-text-muted))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--readme-primary))] resize-none"
                        placeholder="Add custom requirements for your README (e.g., 'Include a detailed API documentation section' or 'Focus on installation instructions for Docker')"
                        value={customRequirements}
                        onChange={(e) => setCustomRequirements(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--readme-primary))]" />
                          <span className="text-xs">Custom sections</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--readme-primary))]" />
                          <span className="text-xs">Advanced templates</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      className={`bg-[hsl(var(--readme-primary))] hover:bg-[hsl(var(--readme-primary-hover))] text-[hsl(var(--readme-primary-foreground))] px-6 py-2 rounded-md flex items-center gap-2 transition-all duration-300 ${
                        hoverState.button ? "shadow-lg shadow-[hsl(var(--readme-primary))/20] scale-105" : ""
                      }`}
                      onClick={fetchRepoData}
                      disabled={isGenerating || !repoUrl}
                      onMouseEnter={() => setHoverState((prev) => ({ ...prev, button: true }))}
                      onMouseLeave={() => setHoverState((prev) => ({ ...prev, button: false }))}
                    >
                      <Zap className="h-4 w-4" />
                      Generate README
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Example repositories */}
            {!generatedReadme && !isGenerating && (
              <motion.div
                className="max-w-3xl mx-auto mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-lg font-medium mb-4 text-center">Try with popular repositories</h3>
                <div className="grid grid-cols-3 gap-4">
                  {exampleRepos.map((repo, index) => (
                    <Card
                      key={index}
                      className={`border-[hsl(var(--readme-border))] bg-[hsl(var(--readme-card-bg))] cursor-pointer hover:bg-[hsl(var(--readme-bg))] transition-all duration-300 ${
                        hoverState.examples[index]
                          ? "shadow-md border-[hsl(var(--readme-primary))/30] scale-[1.02]"
                          : ""
                      }`}
                      onClick={() => handleExampleClick(repo.owner)}
                      onMouseEnter={() => {
                        const newExamples = [...hoverState.examples]
                        newExamples[index] = true
                        setHoverState((prev) => ({ ...prev, examples: newExamples }))
                      }}
                      onMouseLeave={() => {
                        const newExamples = [...hoverState.examples]
                        newExamples[index] = false
                        setHoverState((prev) => ({ ...prev, examples: newExamples }))
                      }}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[hsl(var(--readme-primary))/20] flex items-center justify-center">
                          {repo.icon}
                        </div>
                        <div>
                          <div className="font-medium">{repo.name}</div>
                          <div className="text-xs text-[hsl(var(--readme-text-muted))]">{repo.owner}</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {generatedReadme && (
              <>
                {repoData && (
                  <motion.div
                    className="max-w-3xl mx-auto mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="border-[hsl(var(--readme-border))] bg-[hsl(var(--readme-card-bg))] shadow-md overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-[hsl(var(--readme-primary))/20] flex items-center justify-center">
                              <Github className="h-6 w-6 text-[hsl(var(--readme-primary))]" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold">{repoData.name}</h3>
                              <p className="text-sm text-[hsl(var(--readme-text-muted))]">
                                {repoData.owner}/{repoData.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 bg-[hsl(var(--readme-bg))] px-3 py-1.5 rounded-full">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">{repoData.stars || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-[hsl(var(--readme-bg))] px-3 py-1.5 rounded-full">
                              <GitFork className="h-4 w-4 text-[hsl(var(--readme-primary))]" />
                              <span className="text-sm">{repoData.forks || 0}</span>
                            </div>
                            {repoData.language && (
                              <div className="flex items-center gap-1.5 bg-[hsl(var(--readme-bg))] px-3 py-1.5 rounded-full">
                                <Code className="h-4 w-4 text-[hsl(var(--readme-text-muted))]" />
                                <span className="text-sm">{repoData.language}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {repoData.description && (
                          <p className="mt-4 text-[hsl(var(--readme-text-muted))]">{repoData.description}</p>
                        )}

                        {(repoData.created_at || repoData.updated_at) && (
                          <div className="mt-4 flex flex-wrap gap-4 text-xs text-[hsl(var(--readme-text-muted))]">
                            {repoData.created_at && (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Created: {formatDate(repoData.created_at)}</span>
                              </div>
                            )}
                            {repoData.updated_at && (
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                <span>Updated: {formatDate(repoData.updated_at)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                <motion.div
                  className="max-w-5xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Tabs defaultValue="preview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-[hsl(var(--readme-card-bg))] border border-[hsl(var(--readme-border))]">
                      <TabsTrigger
                        value="preview"
                        className="flex items-center gap-2 data-[state=active]:bg-[hsl(var(--readme-primary))] data-[state=active]:text-[hsl(var(--readme-primary-foreground))]"
                      >
                        <BookOpen className="h-4 w-4" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger
                        value="markdown"
                        className="flex items-center gap-2 data-[state=active]:bg-[hsl(var(--readme-primary))] data-[state=active]:text-[hsl(var(--readme-primary-foreground))]"
                      >
                        <FileText className="h-4 w-4" />
                        Markdown
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="preview">
                      <Card className="relative shadow-lg border border-gray-300 readme-preview-container">
                        <CardContent className="pt-6">
                          <div className="absolute top-4 right-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
                            onClick={() => {
                              setRepoUrl("")
                              setGeneratedReadme("")
                              setRepoData(null)
                            }}
                          >
                            <GitBranch className="h-4 w-4" />
                            New
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
                            onClick={downloadReadme}
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-black hover:text-white dark:bg-black dark:text-white dark:hover:bg-white dark:hover:text-black"
                            onClick={copyToClipboard}
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy
                              </>
                            )}
                          </Button>
                          </div>
                          <ScrollArea className="h-[600px] pr-4 mt-8">
                            <div className="prose prose-sm max-w-none px-6 readme-preview">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  img: ({ node, ...props }) => (
                                    <img {...props} className="max-w-full h-auto my-4" alt={props.alt || ""} />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a
                                      {...props}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline"
                                    />
                                  ),
                                  h1: ({ node, ...props }) => (
                                    <h1
                                      {...props}
                                      className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200"
                                    />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2
                                      {...props}
                                      className="text-2xl font-bold mt-6 mb-3 pb-2 border-b border-gray-200"
                                    />
                                  ),
                                  h3: ({ node, ...props }) => <h3 {...props} className="text-xl font-bold mt-5 mb-2" />,
                                  code: ({ node, inline, className, ...props }) =>
                                    inline ? (
                                      <code {...props} className="px-1 py-0.5 bg-gray-100 rounded text-gray-800" />
                                    ) : (
                                      <code {...props} className="block overflow-x-auto text-gray-800" />
                                    ),
                                  pre: ({ node, ...props }) => (
                                    <pre
                                      {...props}
                                      className="p-4 bg-gray-100 rounded-md overflow-x-auto my-4 border border-gray-200 text-gray-800"
                                    />
                                  ),
                                  hr: ({ node, ...props }) => <hr {...props} className="my-6 border-gray-300" />,
                                  table: ({ node, ...props }) => (
                                    <div className="overflow-x-auto my-6">
                                      <table {...props} className="min-w-full divide-y divide-gray-300" />
                                    </div>
                                  ),
                                  th: ({ node, ...props }) => (
                                    <th {...props} className="px-4 py-2 bg-gray-100 font-medium text-left" />
                                  ),
                                  td: ({ node, ...props }) => (
                                    <td {...props} className="px-4 py-2 border-t border-gray-300" />
                                  ),
                                  ul: ({ node, ...props }) => <ul {...props} className="list-disc pl-5 my-4" />,
                                  ol: ({ node, ...props }) => <ol {...props} className="list-decimal pl-5 my-4" />,
                                  li: ({ node, ...props }) => <li {...props} className="my-1" />,
                                  blockquote: ({ node, ...props }) => (
                                    <blockquote
                                      {...props}
                                      className="pl-4 border-l-4 border-gray-200 text-gray-700 my-4 italic"
                                    />
                                  ),
                                  // Custom emoji renderer
                                  Emoji: ({ emoji }) => (
                                    <span role="img" aria-label={emoji} className="inline-block">
                                      {emoji}
                                    </span>
                                  ),
                                }}
                              >
                                {generatedReadme.replace(/:([a-zA-Z0-9_]+):/g, (match, p1) => {
                                  return emojiMap[p1] || match
                                })}
                              </ReactMarkdown>
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="markdown">
                      <Card className="relative shadow-lg border-[hsl(var(--readme-border))] bg-[hsl(var(--readme-card-bg))]">
                        <CardContent className="pt-6">
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-[hsl(var(--readme-border))]  hover:bg-[hsl(var(--readme-bg))]"
                              onClick={() => {
                                setRepoUrl("")
                                setGeneratedReadme("")
                                setRepoData(null)
                              }}
                            >
                              <GitBranch className="h-4 w-4" />
                              New
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-[hsl(var(--readme-bg))]"
                              onClick={downloadReadme}
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2 border-[hsl(var(--readme-border))] hover:bg-[hsl(var(--readme-bg))]"
                              onClick={copyToClipboard}
                            >
                              {copied ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </div>
                          <ScrollArea className="h-[600px] pr-4 mt-8">
                            <pre className="bg-[hsl(var(--readme-bg))] p-4 rounded-lg overflow-x-auto text-sm font-mono">
                              <code>{generatedReadme}</code>
                            </pre>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </motion.div>
              </>
            )}
          </div>

          {/* Overlay for generation process */}
          <AnimatePresence>
            {showOverlay && (
              <motion.div
                ref={overlayRef}
                className="fixed inset-0 bg-[hsl(var(--readme-overlay-bg))] backdrop-blur-sm z-50 flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="bg-[hsl(var(--readme-card-bg))] border-2 border-[hsl(var(--readme-border))] rounded-xl shadow-xl max-w-2xl w-full p-8 relative"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <button
                    onClick={() => {
                      setShowOverlay(false)
                      setIsGenerating(false)
                    }}
                    className="absolute top-4 right-4 text-[hsl(var(--readme-text-muted))] hover:text-[hsl(var(--readme-text))] transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 rounded-full bg-[hsl(var(--readme-primary))/20] flex items-center justify-center">
                      <motion.div
                        animate={{
                          rotate: 360,
                          transition: { duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                        }}
                      >
                        <Sparkles className="h-8 w-8 text-[hsl(var(--readme-primary))]" />
                      </motion.div>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">Creating Your README</h2>
                    <div className="h-8 overflow-hidden">
                      <TextShimmerWave
                        className="[--base-color:hsl(var(--readme-text))] [--base-gradient-color:hsl(var(--readme-primary))]"
                        duration={1}
                        spread={1}
                        zDistance={1}
                        scaleDistance={1.1}
                        rotateYDistance={20}
                      >
                        {readmeFacts[currentFactIndex]}
                      </TextShimmerWave>
                    </div>
                  </div>

                  {/* Random tip */}
                  <div className="mb-8 text-center">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentTipIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <Lightbulb className="h-4 w-4 text-[hsl(var(--readme-primary))]" />
                        <span className="text-sm text-[hsl(var(--readme-text-muted))]">
                          {readmeTips[currentTipIndex]}
                        </span>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-8">
                    <div className="h-2 w-full bg-[hsl(var(--readme-border))] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[hsl(var(--readme-primary))]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-[hsl(var(--readme-text-muted))]">
                      <span>{steps[currentStep]?.name || "Analyzing"}</span>
                      <span>{progress}% Complete</span>
                    </div>
                  </div>

                  {/* Steps */}
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-md transition-all duration-300 ${
                          index === currentStep
                            ? "bg-[hsl(var(--readme-primary))/10 border border-[hsl(var(--readme-primary))/30]"
                            : index < currentStep
                              ? "opacity-60"
                              : "opacity-40"
                        }`}
                      >
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${
                            index < currentStep
                              ? "bg-[hsl(var(--readme-primary))] text-black"
                              : index === currentStep
                                ? "bg-[hsl(var(--readme-primary))/20] text-[hsl(var(--readme-primary))]"
                                : "bg-[hsl(var(--readme-border))] text-[hsl(var(--readme-text-muted))]"
                          }`}
                        >
                          {index < currentStep ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <div
                            className={`font-medium ${
                              index <= currentStep
                                ? "text-[hsl(var(--readme-text))]"
                                : "text-[hsl(var(--readme-text-muted))]"
                            }`}
                          >
                            {step.name}
                          </div>
                          <div className="text-xs text-[hsl(var(--readme-text-muted))]">{step.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </ProtectedRoute>
  )
}
