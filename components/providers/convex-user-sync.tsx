"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useAuth } from "@/context/auth-context";
import { api } from "@/convex/_generated/api";
import { isConvexEnabled } from "@/lib/convex";

export function ConvexUserSync() {
  if (!isConvexEnabled) return null;
  return <ConvexUserSyncEnabled />;
}

function ConvexUserSyncEnabled() {
  const { user } = useAuth();
  const upsertUser = useMutation(api.users.upsertFromAuth);

  useEffect(() => {
    if (!user) return;

    void upsertUser({
      provider: "google",
      name: user.displayName ?? undefined,
      email: user.email ?? undefined,
      avatar: user.photoURL ?? undefined,
    });
  }, [user, upsertUser]);

  return null;
}
