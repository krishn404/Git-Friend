import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertFromAuth = mutation({
  args: {
    provider: v.union(v.literal("google"), v.literal("github")),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name ?? existing.name,
        email: args.email ?? existing.email,
        avatar: args.avatar ?? existing.avatar,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      providerId: identity.subject,
      provider: args.provider,
      name: args.name,
      email: args.email,
      avatar: args.avatar,
      createdAt: Date.now(),
    });
  },
});

export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", identity.subject))
      .unique();
  },
});
