import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, upsertRepo } from "./lib/auth";

export const save = mutation({
  args: {
    githubRepoFullName: v.string(),
    githubUrl: v.string(),
    generatedMarkdown: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const repoId = await upsertRepo(ctx, user._id, args.githubRepoFullName, args.githubUrl);
    const now = Date.now();

    return await ctx.db.insert("readmes", {
      userId: user._id,
      repoId,
      generatedMarkdown: args.generatedMarkdown,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    const readmes = await ctx.db
      .query("readmes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      readmes.map(async (readme) => {
        const repo = await ctx.db.get(readme.repoId);
        return { ...readme, repo };
      }),
    );
  },
});

export const getById = query({
  args: { readmeId: v.id("readmes") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const readme = await ctx.db.get(args.readmeId);
    if (!readme || readme.userId !== user._id) return null;

    const repo = await ctx.db.get(readme.repoId);
    return { ...readme, repo };
  },
});
