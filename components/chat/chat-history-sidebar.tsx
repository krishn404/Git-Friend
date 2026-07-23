"use client";

import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RepoChip } from "@/components/repo/repo-picker";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type ChatHistorySidebarProps = {
  activeSessionId: Id<"chatSessions"> | null;
  onSelectSession: (sessionId: Id<"chatSessions">) => void;
  onNewChat: () => void;
  className?: string;
};

export function ChatHistorySidebar({
  activeSessionId,
  onSelectSession,
  onNewChat,
  className,
}: ChatHistorySidebarProps) {
  const sessions = useQuery(api.chatSessions.listForUser);

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border bg-card/50",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border p-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Your chats
        </p>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNewChat} title="New chat">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {sessions === undefined ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No chat history yet.</p>
        ) : (
          <div className="space-y-1 p-2">
            {sessions.map((session) => (
              <button
                key={session._id}
                type="button"
                onClick={() => onSelectSession(session._id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent",
                  activeSessionId === session._id && "bg-accent",
                )}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{session.title}</p>
                    {session.repo && (
                      <div className="mt-1">
                        <RepoChip fullName={session.repo.githubRepoFullName} />
                      </div>
                    )}
                    {session.lastMessagePreview && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {session.lastMessagePreview}
                      </p>
                    )}
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
