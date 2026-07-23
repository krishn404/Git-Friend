"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Github, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGitHubAuth } from "@/context/github-auth-context";
import {
  formatRepoDate,
  parseGitHubUrl,
  useGitHubRepos,
  type GitHubRepo,
} from "@/hooks/use-github-repos";
import { cn } from "@/lib/utils";

export type RepoSelection = {
  fullName: string;
  githubUrl: string;
};

type RepoPickerProps = {
  onSelect: (repo: RepoSelection) => void;
  onBack?: () => void;
  actionLabel?: string;
  className?: string;
  autoFocusSearch?: boolean;
};

export function RepoPicker({
  onSelect,
  onBack,
  actionLabel = "Select",
  className,
}: RepoPickerProps) {
  const { isConnected, accessToken, userInfo, connectGitHub } = useGitHubAuth();
  const { repos, accounts, loading, error, refresh } = useGitHubRepos(accessToken);
  const [urlInput, setUrlInput] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeAccount = selectedAccount || userInfo?.login || accounts[0]?.login || "";

  const filteredRepos = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return repos.filter((repo) => {
      const matchesAccount = !activeAccount || repo.owner.login === activeAccount;
      const matchesSearch = !query || repo.name.toLowerCase().includes(query) || repo.full_name.toLowerCase().includes(query);
      return matchesAccount && matchesSearch;
    });
  }, [repos, activeAccount, searchQuery]);

  const handleUrlImport = () => {
    const parsed = parseGitHubUrl(urlInput);
    if (parsed) {
      onSelect(parsed);
    }
  };

  const handleRepoSelect = (repo: GitHubRepo) => {
    onSelect({
      fullName: repo.full_name,
      githubUrl: repo.html_url,
    });
  };

  const urlValid = parseGitHubUrl(urlInput) !== null;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Import from a URL</p>
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://github.com/myorg/myrepo"
            className="h-10 border-border bg-background"
            onKeyDown={(e) => {
              if (e.key === "Enter" && urlValid) handleUrlImport();
            }}
          />
          <Button
            onClick={handleUrlImport}
            disabled={!urlValid}
            className="shrink-0 bg-foreground text-background hover:bg-foreground/90"
          >
            Import
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">Select a Repository</p>

        {!isConnected ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center">
            <Github className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="mb-4 text-sm text-muted-foreground">
              Connect GitHub to browse your repositories.
            </p>
            <Button onClick={connectGitHub} variant="outline">
              Connect GitHub
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <Select value={activeAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger className="h-10 w-[180px] border-border bg-background">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.login} value={account.login}>
                      <span className="flex items-center gap-2">
                        <img
                          src={account.avatar_url}
                          alt=""
                          className="h-4 w-4 rounded-full"
                        />
                        {account.login}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search repos"
                  className="h-10 border-border bg-background pl-9"
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading repositories...
                </div>
              ) : error ? (
                <div className="space-y-3 p-6 text-center">
                  <p className="text-sm text-destructive">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => void refresh()}>
                    Retry
                  </Button>
                </div>
              ) : filteredRepos.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No repositories found.
                </p>
              ) : (
                <ScrollArea className="h-[280px]">
                  <div className="divide-y divide-border">
                    {filteredRepos.map((repo) => (
                      <div
                        key={repo.id}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-accent/40"
                      >
                        <div className="h-8 w-8 shrink-0 rounded-full border border-border bg-muted" />
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground">
                            {repo.name}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            · {formatRepoDate(repo.updated_at)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 border-foreground/20 bg-transparent hover:bg-accent"
                          onClick={() => handleRepoSelect(repo)}
                        >
                          {actionLabel}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </>
        )}
      </div>

      {onBack && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onBack} className="border-foreground/20">
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

export function RepoChip({ fullName, onClear }: { fullName: string; onClear?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
      <Github className="h-3 w-3" />
      {fullName}
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="ml-0.5 rounded-full px-1 text-muted-foreground hover:text-foreground"
          aria-label="Clear repository"
        >
          ×
        </button>
      )}
    </span>
  );
}
