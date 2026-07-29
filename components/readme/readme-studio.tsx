"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Streamdown } from "streamdown"
import {
  Bold, Check, ChevronDown, Code2, Copy, Download, Eye, FileText, GripVertical,
  Heading, Italic, Link2, List, MoreHorizontal, Redo2, Table2, Trash2, Undo2,
  Upload, Wand2, FileUp, ExternalLink, Plus, Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

type HeaderBlock = { id: string; type: "header"; title: string; subtitle: string; style: string; size: string; theme: string; align: string; font: string; logo: string; background: string; border: boolean; watermark: boolean }
type TextBlock = { id: string; type: "text"; markdown: string }
type BadgeBlock = { id: string; type: "badges"; badges: { label: string; value: string; icon: string; src?: string }[] }
type Block = HeaderBlock | TextBlock | BadgeBlock

const makeId = () => Math.random().toString(36).slice(2, 10)
const defaultHeader = (title = "Project title", subtitle = "A concise description of your project"): HeaderBlock => ({ id: makeId(), type: "header", title, subtitle, style: "Gradient", size: "Banner", theme: "Default", align: "Center", font: "Inter", logo: "Auto", background: "", border: true, watermark: false })

function markdownToBlocks(markdown: string): Block[] {
  const lines = markdown.split("\n")
  const heading = lines.findIndex((line) => /^#\s+/.test(line))
  const title = heading >= 0 ? lines[heading].replace(/^#\s+/, "") : "Project title"
  const afterHeading = heading >= 0 ? lines.slice(heading + 1) : lines
  const firstText = afterHeading.find((line) => line.trim() && !line.trim().startsWith("!["))?.trim() || ""
  const body = heading >= 0 ? afterHeading.join("\n").replace(/^\s*\n/, "") : markdown
  const badgeImages = [...markdown.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g)]
  const badges = badgeImages.slice(0, 4).map((match) => ({ label: match[1] || "badge", value: "", icon: "●", src: match[2] }))
  const textBody = badgeImages.length ? body.replace(/\s*!\[[^\]]*\]\(https?:\/\/[^)]+\)/g, "").trim() : body
  const blocks: Block[] = [defaultHeader(title, firstText)]
  if (badges.length) blocks.push({ id: makeId(), type: "badges", badges })
  if (textBody) blocks.push({ id: makeId(), type: "text", markdown: textBody })
  return blocks
}

function blocksToMarkdown(blocks: Block[]) {
  return blocks.map((block) => {
    if (block.type === "header") return `# ${block.title}\n\n${block.subtitle}`.trim()
    if (block.type === "badges") return block.badges.map((badge) => badge.src ? `![${badge.label}](${badge.src})` : `![${badge.label}](https://img.shields.io/badge/${encodeURIComponent(badge.label)}-${encodeURIComponent(badge.value || "active")}-18181b)`).join(" ")
    return block.markdown
  }).join("\n\n")
}

type Props = {
  markdown: string; onChange: (markdown: string) => void; onDownload: () => void; onCopy: () => void; copied?: boolean
  onNew: () => void; onRegenerate?: () => void; canRegenerate?: boolean; onApply?: () => void; applyLabel?: string
}

export function ReadmeStudio({ markdown, onChange, onDownload, onCopy, copied, onNew, onRegenerate, canRegenerate, onApply, applyLabel }: Props) {
  const [mode, setMode] = useState<"design" | "markdown">("design")
  const [blocks, setBlocks] = useState<Block[]>(() => markdownToBlocks(markdown))
  const [selectedId, setSelectedId] = useState(blocks[0]?.id)
  const [history, setHistory] = useState<Block[][]>([])
  const [future, setFuture] = useState<Block[][]>([])
  const markdownRef = useRef<HTMLTextAreaElement | null>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const serialised = useMemo(() => blocksToMarkdown(blocks), [blocks])
  const selected = blocks.find((block) => block.id === selectedId) || blocks[0]

  useEffect(() => { if (markdown !== serialised) setBlocks(markdownToBlocks(markdown)) }, [markdown]) // external generation/import remains the source of truth

  const commit = (next: Block[], track = true) => {
    if (track) { setHistory((current) => [...current.slice(-29), blocks]); setFuture([]) }
    setBlocks(next); onChange(blocksToMarkdown(next))
  }
  const updateBlock = (id: string, changes: Partial<Block>) => commit(blocks.map((block) => block.id === id ? { ...block, ...changes } as Block : block))
  const duplicate = (id: string) => { const index = blocks.findIndex((block) => block.id === id); const copy = { ...blocks[index], id: makeId() } as Block; const next = [...blocks]; next.splice(index + 1, 0, copy); setSelectedId(copy.id); commit(next) }
  const remove = (id: string) => { if (blocks.length === 1) return; const next = blocks.filter((block) => block.id !== id); setSelectedId(next[0].id); commit(next) }
  const move = (id: string, offset: number) => { const index = blocks.findIndex((block) => block.id === id); const target = index + offset; if (target < 0 || target >= blocks.length) return; const next = [...blocks]; [next[index], next[target]] = [next[target], next[index]]; commit(next) }
  const undo = () => { const previous = history.at(-1); if (!previous) return; setFuture((current) => [blocks, ...current]); setHistory((current) => current.slice(0, -1)); setBlocks(previous); onChange(blocksToMarkdown(previous)) }
  const redo = () => { const next = future[0]; if (!next) return; setHistory((current) => [...current, blocks]); setFuture((current) => current.slice(1)); setBlocks(next); onChange(blocksToMarkdown(next)) }
  const insertSyntax = (before: string, after = "") => { const el = markdownRef.current; if (!el || !selected || selected.type !== "text") return; const start = el.selectionStart; const end = el.selectionEnd; const value = selected.markdown; updateBlock(selected.id, { markdown: value.slice(0, start) + before + value.slice(start, end) + after + value.slice(end) }); requestAnimationFrame(() => { el.focus(); el.selectionStart = start + before.length; el.selectionEnd = end + before.length }) }
  const importFile = (file?: File) => { if (!file) return; const reader = new FileReader(); reader.onload = () => { const value = String(reader.result || ""); onChange(value); setBlocks(markdownToBlocks(value)); setMode("design") }; reader.readAsText(file) }

  return <section className="overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
    <input ref={uploadRef} type="file" accept=".md,.markdown,text/markdown,text/plain" className="hidden" onChange={(e) => importFile(e.target.files?.[0])} />
    <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
      <div className="flex rounded-lg border border-border bg-muted/40 p-1">
        <button onClick={() => setMode("design")} className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-sm", mode === "design" && "bg-background text-foreground shadow-sm")}><Eye className="h-4 w-4" />Design</button>
        <button onClick={() => setMode("markdown")} className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-sm", mode === "markdown" && "bg-background text-foreground shadow-sm")}><FileText className="h-4 w-4" />Markdown</button>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" onClick={undo} disabled={!history.length} aria-label="Undo"><Undo2 className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={!future.length} aria-label="Redo"><Redo2 className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" className="hidden sm:flex gap-2" onClick={() => uploadRef.current?.click()}><FileUp className="h-4 w-4" />Import</Button>
        <DropdownMenu><DropdownMenuTrigger asChild><Button size="sm" className="gap-2"><Download className="h-4 w-4" />Export<ChevronDown className="h-3 w-3" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={onDownload}>Download README.md</DropdownMenuItem><DropdownMenuItem onClick={onCopy}>{copied ? "Copied" : "Copy markdown"}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="More actions"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={onNew}>New document</DropdownMenuItem>{onRegenerate && <DropdownMenuItem disabled={!canRegenerate} onClick={onRegenerate}>Regenerate README</DropdownMenuItem>}{onApply && <><DropdownMenuSeparator /><DropdownMenuItem onClick={onApply}><ExternalLink className="mr-2 h-4 w-4" />{applyLabel || "Apply to GitHub"}</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>
      </div>
    </header>
    <div className="grid min-h-[680px] grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
      <ScrollArea className="h-[680px] border-b border-border lg:border-b-0 lg:border-r"><div className="mx-auto max-w-4xl space-y-5 p-6 sm:p-10">
        {mode === "design" ? blocks.map((block, index) => <BlockCanvas key={block.id} block={block} selected={selected?.id === block.id} onSelect={() => setSelectedId(block.id)} onDuplicate={() => duplicate(block.id)} onDelete={() => remove(block.id)} onMoveUp={() => move(block.id, -1)} onMoveDown={() => move(block.id, 1)} first={index === 0} last={index === blocks.length - 1} />) : <Textarea value={markdown} onChange={(e) => onChange(e.target.value)} className="min-h-[600px] resize-none border-0 bg-transparent font-mono text-sm leading-7 focus-visible:ring-0" spellCheck={false} />}
        {mode === "design" && <Button variant="ghost" className="w-full border border-dashed border-border text-muted-foreground" onClick={() => { const block: TextBlock = { id: makeId(), type: "text", markdown: "Write your documentation here." }; setSelectedId(block.id); commit([...blocks, block]) }}><Plus className="mr-2 h-4 w-4" />Add text block</Button>}
      </div></ScrollArea>
      <ScrollArea className="h-[680px]"><aside className="p-5">{selected ? <SettingsPanel block={selected} onUpdate={updateBlock} textareaRef={markdownRef} onInsert={insertSyntax} /> : null}</aside></ScrollArea>
    </div>
  </section>
}

function BlockCanvas({ block, selected, onSelect, onDuplicate, onDelete, onMoveUp, onMoveDown, first, last }: { block: Block; selected: boolean; onSelect: () => void; onDuplicate: () => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; first: boolean; last: boolean }) {
  return <div onClick={onSelect} className={cn("group relative cursor-pointer rounded-xl border border-transparent p-4 transition-colors", selected ? "border-white/80 bg-muted/20" : "hover:border-border") }>
    <div className={cn("absolute -left-7 top-1/2 hidden -translate-y-1/2 flex-col rounded-md border border-border bg-background p-0.5 shadow-sm group-hover:flex", selected && "flex")}><button disabled={first} onClick={(e) => { e.stopPropagation(); onMoveUp() }} className="px-1 text-muted-foreground disabled:opacity-30">⌃</button><GripVertical className="h-4 w-4 text-muted-foreground" /><button disabled={last} onClick={(e) => { e.stopPropagation(); onMoveDown() }} className="px-1 text-muted-foreground disabled:opacity-30">⌄</button></div>
    {selected && <div className="absolute -top-10 right-3 flex rounded-lg border border-border bg-background p-1 shadow-xl"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onDuplicate() }} aria-label="Duplicate block"><Copy className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete() }} aria-label="Delete block"><Trash2 className="h-3.5 w-3.5" /></Button></div>}
    {block.type === "header" && <HeaderPreview block={block} />}
    {block.type === "text" && <div className="prose prose-invert max-w-none text-sm"><Streamdown>{block.markdown}</Streamdown></div>}
    {block.type === "badges" && <div className="flex flex-wrap justify-center gap-2 py-3">{block.badges.map((badge, index) => badge.src ? <img key={index} src={badge.src} alt={badge.label} className="h-6 max-w-[160px]" /> : <div key={index} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-muted px-2.5 text-xs font-medium"><span className="text-muted-foreground">{badge.icon}</span>{badge.label}<span className="border-l border-border pl-1.5">{badge.value}</span></div>)}</div>}
  </div>
}

function HeaderPreview({ block }: { block: HeaderBlock }) { return <div className={cn("relative overflow-hidden rounded-lg border border-border px-6 py-14 sm:px-12", block.style === "Gradient" && "bg-gradient-to-br from-zinc-800 via-zinc-950 to-black", block.align === "Left" ? "text-left" : block.align === "Right" ? "text-right" : "text-center")} style={block.background ? { backgroundImage: `linear-gradient(rgba(0,0,0,.65), rgba(0,0,0,.8)), url(${block.background})`, backgroundSize: "cover" } : undefined}><p className="text-3xl font-bold tracking-tight sm:text-5xl">{block.title}</p>{block.subtitle && <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-300 sm:text-base">{block.subtitle}</p>}{block.watermark && <span className="absolute bottom-3 right-4 text-[10px] uppercase tracking-[.3em] text-zinc-600">GitFriend</span>}</div> }

function SettingsPanel({ block, onUpdate, textareaRef, onInsert }: { block: Block; onUpdate: (id: string, changes: Partial<Block>) => void; textareaRef: React.RefObject<HTMLTextAreaElement | null>; onInsert: (before: string, after?: string) => void }) {
  if (block.type === "header") return <HeaderSettings block={block} onUpdate={onUpdate} />
  if (block.type === "badges") return <><PanelTitle>Badge row settings</PanelTitle><p className="mb-5 text-sm text-muted-foreground">Badge rows use compact, button-like pills and wrap automatically.</p><div className="space-y-3">{block.badges.map((badge, index) => <div key={index} className="rounded-lg border border-border p-3"><Input value={badge.label} onChange={(e) => { const badges = [...block.badges]; badges[index] = { ...badge, label: e.target.value }; onUpdate(block.id, { badges }) }} placeholder="Label" /><Input value={badge.value} onChange={(e) => { const badges = [...block.badges]; badges[index] = { ...badge, value: e.target.value }; onUpdate(block.id, { badges }) }} placeholder="Value" className="mt-2" /></div>)}</div></>
  const actions = [[Bold, "**", "**"], [Italic, "_", "_"], [Link2, "[", "](url)"], [Heading, "## "], [List, "- "], [Table2, "| Header | Header |\n| --- | --- |\n| Cell | Cell |"], [Code2, "`", "`"]] as const
  return <><PanelTitle>Text settings</PanelTitle><p className="mb-4 text-sm text-muted-foreground">Edit source markdown. Changes update this block preview immediately.</p><div className="mb-3 flex flex-wrap gap-1">{actions.map(([Icon, before, after], index) => <Button key={index} variant="outline" size="icon" className="h-8 w-8" onClick={() => onInsert(before, after)}><Icon className="h-3.5 w-3.5" /></Button>)}</div><Textarea ref={textareaRef} value={block.markdown} onChange={(e) => onUpdate(block.id, { markdown: e.target.value })} className="min-h-[440px] resize-y font-mono text-xs leading-6" spellCheck={false} /></>
}

function PanelTitle({ children }: { children: React.ReactNode }) { return <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{children}</h2> }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block space-y-2 text-sm font-medium"><span>{label}</span>{children}</label> }
function HeaderSettings({ block, onUpdate }: { block: HeaderBlock; onUpdate: (id: string, changes: Partial<Block>) => void }) {
  const select = (label: string, key: keyof HeaderBlock, items: string[]) => <Field label={label}><Select value={String(block[key])} onValueChange={(value) => onUpdate(block.id, { [key]: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{items.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></Field>
  return <div className="space-y-5"><PanelTitle>Header settings</PanelTitle>{select("Style", "style", ["Gradient", "Solid", "Minimal"])}<Field label="Title"><Input value={block.title} onChange={(e) => onUpdate(block.id, { title: e.target.value })} /></Field><Field label="Subtitle"><Textarea value={block.subtitle} onChange={(e) => onUpdate(block.id, { subtitle: e.target.value })} className="min-h-20 resize-y" /></Field>{select("Logo", "logo", ["Auto", "None", "Custom"])}<Button type="button" variant="outline" className="w-full"><Upload className="mr-2 h-4 w-4" />Upload logo</Button><Field label="Background image"><div className="flex gap-2"><Input value={block.background} onChange={(e) => onUpdate(block.id, { background: e.target.value })} placeholder="Unsplash or image URL" /><Button variant="outline" size="icon" aria-label="Randomize background"><Wand2 className="h-4 w-4" /></Button></div></Field><div className="grid grid-cols-2 gap-3">{select("Size", "size", ["Banner", "Hero", "Compact"])}{select("Theme", "theme", ["Default", "Dark", "Light"])}{select("Align", "align", ["Center", "Left", "Right"])}{select("Font", "font", ["Inter", "Geist", "Mono"])}</div><ToggleRow label="Border" checked={block.border} onChange={(border) => onUpdate(block.id, { border })} /><ToggleRow label="Watermark" checked={block.watermark} onChange={(watermark) => onUpdate(block.id, { watermark })} /></div>
}
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <div className="flex items-center justify-between border-t border-border pt-4"><span className="text-sm font-medium">{label}</span><Switch checked={checked} onCheckedChange={onChange} /></div> }
