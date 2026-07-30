"use client"

import { useEffect, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { format } from "date-fns"
import { Check, Copy, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { isConvexEnabled } from "@/lib/convex"

type ReadmeHistoryProps = { onOpen: (readmeId: Id<"readmes">, markdown: string, repoUrl: string) => void; className?: string }
const titleFromMarkdown = (markdown: string, fallback: string) => markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback
const renameHeading = (markdown: string, title: string) => /^#\s+.+$/m.test(markdown) ? markdown.replace(/^#\s+.+$/m, `# ${title}`) : `# ${title}\n\n${markdown}`

export function ReadmeHistory({ onOpen, className }: ReadmeHistoryProps) {
  if (!isConvexEnabled) return <p className={cn("text-sm text-muted-foreground", className)}>Connect Convex to save README history.</p>
  return <ReadmeHistoryEnabled onOpen={onOpen} className={className} />
}

function ReadmeHistoryEnabled({ onOpen, className }: ReadmeHistoryProps) {
  const readmes = useQuery(api.readmes.listForUser)
  const updateMarkdown = useMutation(api.readmes.updateMarkdown)
  const duplicate = useMutation(api.readmes.duplicate)
  const remove = useMutation(api.readmes.remove)
  const [editing, setEditing] = useState<Id<"readmes"> | null>(null)
  const [draft, setDraft] = useState("")
  const [confirming, setConfirming] = useState<Id<"readmes"> | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => { if (readmes !== undefined) { setTimedOut(false); return }; const timer = window.setTimeout(() => setTimedOut(true), 8_000); return () => window.clearTimeout(timer) }, [readmes])
  if (readmes === undefined && !timedOut) return <div className={cn("space-y-3", className)}>{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}</div>
  if (readmes === undefined) return <p className={cn("text-sm leading-relaxed text-muted-foreground", className)}>History is taking longer than expected. Check the Convex deployment and refresh.</p>
  if (!readmes.length) return <div className={cn("rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground", className)}>No saved READMEs yet.</div>

  const beginRename = (readme: typeof readmes[number]) => { setEditing(readme._id); setDraft(titleFromMarkdown(readme.generatedMarkdown, readme.repo?.githubRepoFullName ?? "Untitled README")) }
  const saveRename = async (readme: typeof readmes[number]) => { const title = draft.trim(); if (title) await updateMarkdown({ readmeId: readme._id, generatedMarkdown: renameHeading(readme.generatedMarkdown, title) }); setEditing(null) }

  return <ScrollArea className={cn("h-full pr-2", className)}><div className="space-y-2">{readmes.map((readme) => {
    const repo = readme.repo?.githubRepoFullName ?? "Unknown repository"
    const title = titleFromMarkdown(readme.generatedMarkdown, repo)
    const isEditing = editing === readme._id
    const isConfirming = confirming === readme._id
    return <div key={readme._id} className="rounded-xl border border-border bg-card/80 p-3 transition-colors hover:border-[hsl(var(--readme-primary))/40] hover:bg-muted/40">
      <div className="flex gap-3">
        <button className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={() => !isEditing && onOpen(readme._id, readme.generatedMarkdown, readme.repo?.githubUrl ?? "")}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--readme-primary))/12] text-[hsl(var(--readme-primary))]"><FileText className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">{isEditing ? <Input autoFocus value={draft} onClick={(e) => e.stopPropagation()} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void saveRename(readme); if (e.key === "Escape") setEditing(null) }} className="h-8" /> : <span className="block truncate text-sm font-semibold">{title}</span>}<span className="mt-0.5 block truncate text-xs text-muted-foreground">{repo} · {format(new Date(readme.createdAt), "MMM d, yyyy")}</span></span>
        </button>
        {isEditing ? <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--readme-primary))]" onClick={() => void saveRename(readme)}><Check className="h-4 w-4" /></Button> : <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" aria-label="README actions"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onOpen(readme._id, readme.generatedMarkdown, readme.repo?.githubUrl ?? "")}>Open in Editor</DropdownMenuItem><DropdownMenuItem onClick={() => beginRename(readme)}><Pencil className="mr-2 h-3.5 w-3.5" />Rename</DropdownMenuItem><DropdownMenuItem onClick={() => void duplicate({ readmeId: readme._id })}><Copy className="mr-2 h-3.5 w-3.5" />Duplicate</DropdownMenuItem><DropdownMenuSeparator /><DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setConfirming(readme._id)}><Trash2 className="mr-2 h-3.5 w-3.5" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>}
      </div>
      {isConfirming && <div className="mt-3 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs"><span>Delete this README?</span><span className="flex gap-1"><Button size="sm" variant="ghost" className="h-7" onClick={() => setConfirming(null)}>Cancel</Button><Button size="sm" variant="destructive" className="h-7" onClick={() => void remove({ readmeId: readme._id })}>Delete</Button></span></div>}
    </div>
  })}</div></ScrollArea>
}
