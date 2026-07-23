"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  updated_at: string;
  owner: { login: string; avatar_url: string };
  private: boolean;
};

export type GitHubAccount = {
  login: string;
  avatar_url: string;
  type: "user" | "org";
};

type CacheEntry = {
  repos: GitHubRepo[];
  accounts: GitHubAccount[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
let sessionCache: CacheEntry | null = null;

async function fetchAllPages(url: string, token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;

  while (page <= 5) {
    const response = await fetch(`${url}&page=${page}&per_page=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const batch: GitHubRepo[] = await response.json();
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return repos;
}

async function loadGitHubData(token: string): Promise<CacheEntry> {
  const [userResponse, orgsResponse, repos] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }),
    fetch("https://api.github.com/user/orgs", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }),
    fetchAllPages(
      "https://api.github.com/user/repos?sort=updated&affiliation=owner,collaborator,organization_member",
      token,
    ),
  ]);

  if (!userResponse.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  const user = await userResponse.json();
  const orgs = orgsResponse.ok ? await orgsResponse.json() : [];

  const accounts: GitHubAccount[] = [
    { login: user.login, avatar_url: user.avatar_url, type: "user" },
    ...orgs.map((org: { login: string; avatar_url: string }) => ({
      login: org.login,
      avatar_url: org.avatar_url,
      type: "org" as const,
    })),
  ];

  return {
    repos: repos.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    ),
    accounts,
    fetchedAt: Date.now(),
  };
}

export function useGitHubRepos(accessToken: string | null) {
  const [repos, setRepos] = useState<GitHubRepo[]>(sessionCache?.repos ?? []);
  const [accounts, setAccounts] = useState<GitHubAccount[]>(sessionCache?.accounts ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAttempted = useRef(false);

  const refresh = useCallback(async () => {
    if (!accessToken) return;

    if (sessionCache && Date.now() - sessionCache.fetchedAt < CACHE_TTL_MS) {
      setRepos(sessionCache.repos);
      setAccounts(sessionCache.accounts);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await loadGitHubData(accessToken);
      sessionCache = data;
      setRepos(data.repos);
      setAccounts(data.accounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || fetchAttempted.current) return;
    fetchAttempted.current = true;
    void refresh();
  }, [accessToken, refresh]);

  return { repos, accounts, loading, error, refresh };
}

export function parseGitHubUrl(url: string): { fullName: string; githubUrl: string } | null {
  const match = url.trim().match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  if (!match) return null;
  const fullName = `${match[1]}/${match[2]}`;
  return { fullName, githubUrl: `https://github.com/${fullName}` };
}

export function formatRepoDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}
