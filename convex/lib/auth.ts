import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

type AuthCtx = QueryCtx | MutationCtx;

export async function getAuthenticatedUser(ctx: AuthCtx): Promise<Doc<"users">> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_provider_id", (q) => q.eq("providerId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export async function getOptionalUser(ctx: AuthCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_provider_id", (q) => q.eq("providerId", identity.subject))
    .unique();
}

export async function upsertRepo(
  ctx: MutationCtx,
  userId: Id<"users">,
  githubRepoFullName: string,
  githubUrl: string,
): Promise<Id<"repos">> {
  const existing = await ctx.db
    .query("repos")
    .withIndex("by_user_and_full_name", (q) =>
      q.eq("userId", userId).eq("githubRepoFullName", githubRepoFullName),
    )
    .unique();

  const now = Date.now();

  if (existing) {
    await ctx.db.patch(existing._id, { lastAccessedAt: now, githubUrl });
    return existing._id;
  }

  return await ctx.db.insert("repos", {
    userId,
    githubRepoFullName,
    githubUrl,
    lastAccessedAt: now,
  });
}
