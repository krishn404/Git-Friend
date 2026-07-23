"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/convex/_generated/api";

export function ConvexUserSyncImpl() {
  const { user } = useAuth();
  const upsertUser = useMutation(api.users.upsertFromAuth);

  useEffect(() => {
    if (!user) return;

    // Determine provider based on user metadata
    // Firebase sets providerData for OAuth providers
    let provider: "google" | "github" = "google";
    
    if (user.providerData && user.providerData.length > 0) {
      const providerType = user.providerData[0].providerId;
      if (providerType === "github.com") {
        provider = "github";
      }
    }

    void upsertUser({
      provider,
      name: user.displayName ?? undefined,
      email: user.email ?? undefined,
      avatar: user.photoURL ?? undefined,
    });
  }, [user, upsertUser]);

  return null;
}
