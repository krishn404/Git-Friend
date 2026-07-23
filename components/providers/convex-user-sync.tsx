"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import the actual sync component to defer Convex hook usage
const ConvexUserSyncImpl = dynamic(
  () => import("./convex-user-sync-impl").then(mod => ({ default: mod.ConvexUserSyncImpl })),
  { ssr: false }
);

export function ConvexUserSync() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ConvexUserSyncImpl />;
}
