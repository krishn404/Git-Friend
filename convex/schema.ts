import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    providerId: v.string(),
    provider: v.union(v.literal("google"), v.literal("github")),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_provider_id", ["providerId"]),

  repos: defineTable({
    userId: v.id("users"),
    githubRepoFullName: v.string(),
    githubUrl: v.string(),
    lastAccessedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_full_name", ["userId", "githubRepoFullName"]),

  readmes: defineTable({
    userId: v.id("users"),
    repoId: v.id("repos"),
    generatedMarkdown: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_repo", ["userId", "repoId"]),

  chatSessions: defineTable({
    userId: v.id("users"),
    repoId: v.optional(v.id("repos")),
    title: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_repo", ["userId", "repoId"]),

  chatMessages: defineTable({
    chatSessionId: v.id("chatSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["chatSessionId"]),
});
