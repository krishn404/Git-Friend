"use client";

import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function useFirebaseConvexAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
  }, []);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!user) return null;
      return await user.getIdToken(forceRefreshToken);
    },
    [user],
  );

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated: user !== null,
      fetchAccessToken,
    }),
    [isLoading, user, fetchAccessToken],
  );
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithAuth client={convex} useAuth={useFirebaseConvexAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

export { convex };
