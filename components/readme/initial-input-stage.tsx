"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Github, Code, Sparkles, Zap, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"

type InitialInputStageProps = {
  onSubmit: (url: string) => void
  isLoading?: boolean
  error?: string | null
}

const exampleRepos = [
  { name: "React", owner: "facebook/react", icon: Code },
  { name: "GitFriend", owner: "krishn404/Git-Friend", icon: Zap },
  { name: "TailwindCSS", owner: "tailwindlabs/tailwindcss", icon: Sparkles },
]

export function InitialInputStage({ onSubmit, isLoading, error }: InitialInputStageProps) {
  const [repoUrl, setRepoUrl] = useState("")
  const [recentInputs, setRecentInputs] = useState<string[]>([])

  // Load recent inputs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("recent_readme_repos")
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as string[]
        setRecentInputs(parsed.slice(0, 3)) // Show last 3
      } catch (e) {
        console.error("Failed to parse recent inputs:", e)
      }
    }
  }, [])

  // Save repo URL to recent inputs
  const saveRecentInput = (url: string) => {
    const recent = localStorage.getItem("recent_readme_repos")
    let inputs: string[] = []
    if (recent) {
      try {
        inputs = JSON.parse(recent) as string[]
      } catch (e) {
        console.error("Failed to parse recent inputs:", e)
      }
    }

    // Add new URL to beginning, remove duplicates, keep last 5
    inputs = [url, ...inputs.filter((i) => i !== url)].slice(0, 5)
    localStorage.setItem("recent_readme_repos", JSON.stringify(inputs))
  }

  const handleSubmit = (url: string) => {
    if (url.trim()) {
      saveRecentInput(url)
      onSubmit(url)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && repoUrl.trim()) {
      handleSubmit(repoUrl)
    }
  }

  const handleExampleClick = (owner: string) => {
    const url = `https://github.com/${owner}`
    setRepoUrl(url)
    // Delay submission to allow smooth animation
    setTimeout(() => {
      handleSubmit(url)
    }, 100)
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-background to-background/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Github className="h-8 w-8 text-foreground" />
            <h1 className="text-3xl font-bold text-foreground">Generate README</h1>
          </div>
          <p className="text-base text-muted-foreground">
            Enter a GitHub repository URL to automatically generate a professional README
          </p>
        </motion.div>

        {/* Input Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="p-6 shadow-md border border-border/50">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  className="h-12 pl-4 pr-12 text-base border-border/50 focus:border-foreground/30"
                />
                <Button
                  onClick={() => handleSubmit(repoUrl)}
                  disabled={!repoUrl.trim() || isLoading}
                  className="absolute right-1 top-1 h-10 px-4 bg-foreground text-background hover:bg-foreground/90"
                  size="sm"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  className="p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive text-sm"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Suggestions Section */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {/* Recent Inputs */}
          {recentInputs.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent</p>
              <div className="flex flex-col gap-2">
                {recentInputs.map((url, idx) => (
                  <motion.button
                    key={url}
                    onClick={() => handleSubmit(url)}
                    disabled={isLoading}
                    className="text-left px-4 py-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-border transition-colors disabled:opacity-50"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                  >
                    <div className="text-sm font-medium text-foreground truncate">{url}</div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Example Repos */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Popular Examples</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {exampleRepos.map((repo, idx) => {
                const IconComponent = repo.icon
                return (
                  <motion.button
                    key={repo.owner}
                    onClick={() => handleExampleClick(repo.owner)}
                    disabled={isLoading}
                    className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-border transition-all disabled:opacity-50 group"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (recentInputs.length + idx) * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <div className="text-left">
                        <div className="text-sm font-semibold text-foreground">{repo.name}</div>
                        <div className="text-xs text-muted-foreground">{repo.owner}</div>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
