"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { parseGitHubUrl } from "@/hooks/use-github-repos";
import { isConvexEnabled } from "@/lib/convex";

type ReadmeSaverProps = {
  markdown: string;
  repoUrl: string;
  isGenerating: boolean;
};

export function ReadmeSaver({ markdown, repoUrl, isGenerating }: ReadmeSaverProps) {
  if (!isConvexEnabled) return null;
  return <ReadmeSaverEnabled markdown={markdown} repoUrl={repoUrl} isGenerating={isGenerating} />;
}

function ReadmeSaverEnabled({ markdown, repoUrl, isGenerating }: ReadmeSaverProps) {
  const saveReadme = useMutation(api.readmes.save);
  const savedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isGenerating || !markdown.trim() || !repoUrl) return;

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) return;

    const key = `${parsed.fullName}:${markdown.length}`;
    if (savedRef.current === key) return;
    savedRef.current = key;

    void saveReadme({
      githubRepoFullName: parsed.fullName,
      githubUrl: parsed.githubUrl,
      generatedMarkdown: markdown,
    });
  }, [markdown, repoUrl, isGenerating, saveReadme]);

  return null;
}
