import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, upsertRepo } from "./lib/auth";

export const create = mutation({
  args: {
    title: v.string(),
    githubRepoFullName: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const now = Date.now();

    let repoId;
    if (args.githubRepoFullName && args.githubUrl) {
      repoId = await upsertRepo(ctx, user._id, args.githubRepoFullName, args.githubUrl);
    }

    return await ctx.db.insert("chatSessions", {
      userId: user._id,
      repoId,
      title: args.title,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTitle = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const touch = mutation({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found");
    }

    await ctx.db.patch(args.sessionId, { updatedAt: Date.now() });
  },
});

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      sessions.map(async (session) => {
        const repo = session.repoId ? await ctx.db.get(session.repoId) : null;
        const lastMessage = await ctx.db
          .query("chatMessages")
          .withIndex("by_session", (q) => q.eq("chatSessionId", session._id))
          .order("desc")
          .first();

        return {
          ...session,
          repo,
          lastMessagePreview: lastMessage?.content.slice(0, 120) ?? "",
        };
      }),
    );
  },
});

export const getById = query({
  args: { sessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) return null;

    const repo = session.repoId ? await ctx.db.get(session.repoId) : null;
    return { ...session, repo };
  },
});
