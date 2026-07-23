"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type PersistedChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

type UseChatPersistenceOptions = {
  repoUrl?: string | null;
  repoFullName?: string | null;
};

export function useChatPersistence({ repoUrl, repoFullName }: UseChatPersistenceOptions) {
  const [sessionId, setSessionId] = useState<Id<"chatSessions"> | null>(null);
  const createSession = useMutation(api.chatSessions.create);
  const addMessage = useMutation(api.chatMessages.add);
  const updateTitle = useMutation(api.chatSessions.updateTitle);
  const touchSession = useMutation(api.chatSessions.touch);
  const titleSetRef = useRef(false);

  const startNewSession = useCallback(async () => {
    setSessionId(null);
    titleSetRef.current = false;

    const title = repoFullName ? `Chat: ${repoFullName}` : "New chat";
    const id = await createSession({
      title,
      githubRepoFullName: repoFullName ?? undefined,
      githubUrl: repoUrl ?? undefined,
    });
    setSessionId(id);
    return id;
  }, [createSession, repoFullName, repoUrl]);

  const loadSession = useCallback((id: Id<"chatSessions">) => {
    setSessionId(id);
    titleSetRef.current = true;
  }, []);

  const persistMessage = useCallback(
    async (role: "user" | "assistant", content: string, activeSessionId?: Id<"chatSessions">) => {
      let sid = activeSessionId ?? sessionId;
      if (!sid) {
        sid = await startNewSession();
      }

      await addMessage({ chatSessionId: sid, role, content });
      await touchSession({ sessionId: sid });

      if (!titleSetRef.current && role === "user") {
        const title = content.slice(0, 60) + (content.length > 60 ? "…" : "");
        await updateTitle({ sessionId: sid, title });
        titleSetRef.current = true;
      }

      return sid;
    },
    [sessionId, startNewSession, addMessage, touchSession, updateTitle],
  );

  return {
    sessionId,
    setSessionId,
    startNewSession,
    loadSession,
    persistMessage,
  };
}

export function useSessionMessages(sessionId: Id<"chatSessions"> | null) {
  return useQuery(
    api.chatMessages.listForSession,
    sessionId ? { chatSessionId: sessionId } : "skip",
  );
}

export function useSessionDetails(sessionId: Id<"chatSessions"> | null) {
  return useQuery(
    api.chatSessions.getById,
    sessionId ? { sessionId } : "skip",
  );
}

export function mapPersistedMessages(
  messages: Array<{ _id: string; role: "user" | "assistant"; content: string }> | undefined,
): PersistedChatMessage[] {
  if (!messages) return [];
  return messages.map((m) => ({
    id: m._id,
    role: m.role,
    content: m.content,
  }));
}
