"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Copy, ExternalLink, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { isConvexEnabled } from "@/lib/convex";

type ReadmeHistoryProps = {
  onOpen: (readmeId: Id<"readmes">, markdown: string, repoUrl: string) => void;
  className?: string;
};

export function ReadmeHistory({ onOpen, className }: ReadmeHistoryProps) {
  if (!isConvexEnabled) {
    return <p className={cn("text-sm text-muted-foreground", className)}>Connect Convex to save README history.</p>;
  }
  return <ReadmeHistoryEnabled onOpen={onOpen} className={className} />;
}

function ReadmeHistoryEnabled({ onOpen, className }: ReadmeHistoryProps) {
  const readmes = useQuery(api.readmes.listForUser);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (readmes !== undefined) {
      setTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setTimedOut(true), 8_000);
    return () => window.clearTimeout(timer);
  }, [readmes]);

  if (readmes === undefined && !timedOut) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (readmes === undefined) {
    return (
      <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>
        README history is taking longer than expected. Check the Convex deployment and Firebase JWT configuration, then refresh.
      </p>
    );
  }

  if (readmes.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No saved READMEs yet. Generate one to see it here.
      </p>
    );
  }

  const handleCopy = async (markdown: string) => {
    await navigator.clipboard.writeText(markdown);
  };

  return (
    <ScrollArea className={cn("h-[320px] pr-2", className)}>
      <div className="space-y-2">
        {readmes.map((readme) => (
          <div
            key={readme._id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent/30"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {readme.repo?.githubRepoFullName ?? "Unknown repo"}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(readme.createdAt), "MMM d, yyyy · h:mm a")}
              </p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleCopy(readme.generatedMarkdown)}
                title="Copy markdown"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  onOpen(
                    readme._id,
                    readme.generatedMarkdown,
                    readme.repo?.githubUrl ?? "",
                  )
                }
                title="Reopen"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
