import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser, upsertRepo } from "./lib/auth";

export const upsert = mutation({
  args: {
    githubRepoFullName: v.string(),
    githubUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    return await upsertRepo(ctx, user._id, args.githubRepoFullName, args.githubUrl);
  },
});

export const listForUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    return await ctx.db
      .query("repos")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
