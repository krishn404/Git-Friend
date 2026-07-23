"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserAuthButton } from "@/components/auth/user-auth-button"
import { Navbar } from "@/components/ui/navbar"

// Import the existing component code
import { useState } from "react"
import { GitBranch, Copy, Check, Search, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type GitMoji = {
  emoji: string
  code: string
  description: string
  category: "feature" | "fix" | "docs" | "style" | "refactor" | "test" | "chore" | "other"
}

export default function GitMojis() {
  const { theme, setTheme } = useTheme()
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const gitMojis: GitMoji[] = [
    { emoji: "✨", code: ":sparkles:", description: "Introduce new features", category: "feature" },
    { emoji: "🐛", code: ":bug:", description: "Fix a bug", category: "fix" },
    { emoji: "🔥", code: ":fire:", description: "Remove code or files", category: "chore" },
    { emoji: "📝", code: ":memo:", description: "Add or update documentation", category: "docs" },
    { emoji: "🚀", code: ":rocket:", description: "Deploy stuff", category: "chore" },
    { emoji: "💄", code: ":lipstick:", description: "Add or update the UI and style files", category: "style" },
    { emoji: "🎉", code: ":tada:", description: "Begin a project", category: "other" },
    { emoji: "✅", code: ":white_check_mark:", description: "Add, update, or pass tests", category: "test" },
    { emoji: "🔒", code: ":lock:", description: "Fix security issues", category: "fix" },
    { emoji: "🔖", code: ":bookmark:", description: "Release / Version tags", category: "chore" },
    { emoji: "🚧", code: ":construction:", description: "Work in progress", category: "other" },
    { emoji: "♻️", code: ":recycle:", description: "Refactor code", category: "refactor" },
    { emoji: "➕", code: ":heavy_plus_sign:", description: "Add a dependency", category: "chore" },
    { emoji: "➖", code: ":heavy_minus_sign:", description: "Remove a dependency", category: "chore" },
    { emoji: "🔧", code: ":wrench:", description: "Add or update configuration files", category: "chore" },
    { emoji: "🔨", code: ":hammer:", description: "Add or update development scripts", category: "chore" },
    {
      emoji: "📈",
      code: ":chart_with_upwards_trend:",
      description: "Add or update analytics or track code",
      category: "feature",
    },
    { emoji: "♿️", code: ":wheelchair:", description: "Improve accessibility", category: "feature" },
    {
      emoji: "🚚",
      code: ":truck:",
      description: "Move or rename resources (e.g.: files, paths, routes)",
      category: "chore",
    },
    { emoji: "💡", code: ":bulb:", description: "Add or update comments in source code", category: "docs" },
    { emoji: "🍱", code: ":bento:", description: "Add or update assets", category: "feature" },
    { emoji: "👌", code: ":ok_hand:", description: "Update code due to code review changes", category: "style" },
    { emoji: "🏗️", code: ":building_construction:", description: "Make architectural changes", category: "refactor" },
    { emoji: "📱", code: ":iphone:", description: "Work on responsive design", category: "style" },
  ]

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const filteredGitMojis = gitMojis.filter(
    (gitmoji) =>
      gitmoji.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gitmoji.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getGitMojisByCategory = (category: GitMoji["category"]) => {
    return filteredGitMojis.filter((gitmoji) => gitmoji.category === category)
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        
        <main className="flex-1">
          <div className="container max-w-6xl mx-auto py-8 text-foreground">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Git Mojis</h1>
              <p className="text-muted-foreground">
                Enhance your commit messages with expressive emojis that follow Git commit conventions.
              </p>
            </div>

            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for Git Mojis..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full flex flex-wrap justify-start mb-8 h-auto">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="feature">Features</TabsTrigger>
                <TabsTrigger value="fix">Fixes</TabsTrigger>
                <TabsTrigger value="docs">Documentation</TabsTrigger>
                <TabsTrigger value="style">Styling</TabsTrigger>
                <TabsTrigger value="refactor">Refactoring</TabsTrigger>
                <TabsTrigger value="test">Testing</TabsTrigger>
                <TabsTrigger value="chore">Chores</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredGitMojis.map((gitmoji, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-4xl">{gitmoji.emoji}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{gitmoji.code}</p>
                            <p className="text-xs text-muted-foreground">{gitmoji.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => copyToClipboard(gitmoji.code)}
                        >
                          {copiedCode === gitmoji.code ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" /> Copied!
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Copy className="h-3 w-3" /> Copy
                            </span>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {filteredGitMojis.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No Git Mojis found matching your search.</p>
                  </div>
                )}
              </TabsContent>

              {["feature", "fix", "docs", "style", "refactor", "test", "chore", "other"].map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {getGitMojisByCategory(category as GitMoji["category"]).map((gitmoji, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-4xl">{gitmoji.emoji}</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{gitmoji.code}</p>
                              <p className="text-xs text-muted-foreground">{gitmoji.description}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => copyToClipboard(gitmoji.code)}
                          >
                            {copiedCode === gitmoji.code ? (
                              <span className="flex items-center gap-1">
                                <Check className="h-3 w-3" /> Copied!
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Copy className="h-3 w-3" /> Copy
                              </span>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {getGitMojisByCategory(category as GitMoji["category"]).length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No Git Mojis found in this category matching your search.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-12 p-6 border rounded-lg bg-muted/30">
              <h2 className="text-xl font-bold mb-4">How to Use Git Mojis</h2>
              <div className="space-y-4">
                <p>
                  Git Mojis help make your commit messages more expressive and easier to understand at a glance. Here's
                  how to use them:
                </p>
                <div className="bg-card p-4 rounded-md">
                  <code className="text-sm">
                    git commit -m "<span className="text-primary">:sparkles:</span> Add new user authentication feature"
                  </code>
                </div>
                <p>This will render as:</p>
                <div className="bg-card p-4 rounded-md">
                  <code className="text-sm">
                    <span className="mr-2">✨</span> Add new user authentication feature
                  </code>
                </div>
                <p>
                  Using Git Mojis consistently helps your team understand the purpose of each commit without having to
                  read the entire message.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
