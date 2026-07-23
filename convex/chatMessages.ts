import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthenticatedUser } from "./lib/auth";

export const add = mutation({
  args: {
    chatSessionId: v.id("chatSessions"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const session = await ctx.db.get(args.chatSessionId);
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found");
    }

    const now = Date.now();
    const messageId = await ctx.db.insert("chatMessages", {
      chatSessionId: args.chatSessionId,
      role: args.role,
      content: args.content,
      createdAt: now,
    });

    await ctx.db.patch(args.chatSessionId, { updatedAt: now });
    return messageId;
  },
});

export const listForSession = query({
  args: { chatSessionId: v.id("chatSessions") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);
    const session = await ctx.db.get(args.chatSessionId);
    if (!session || session.userId !== user._id) return [];

    return await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("chatSessionId", args.chatSessionId))
      .order("asc")
      .collect();
  },
});
