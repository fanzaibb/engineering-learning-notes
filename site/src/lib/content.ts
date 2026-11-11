// 建置時把 knowledge/、notes/、curriculum/PROGRESS.md 以原始文字載入，網站不另存內容。
import YAML from 'yaml';

export type Status = 'guided' | 'discussed' | 'unexplored';
export type SourceKind = 'official' | 'engineering' | 'course';

export interface Source { title: string; url?: string; kind: SourceKind }
export interface Layer { n: number; alt: string; name: string; weeks: string }
export interface Mountain { id: string; title: string; subtitle: string; layers: Layer[]; mistFromLayer: number }
export interface GlossaryItem { abbr: string; full: string; zh: string }
export interface Evidence { id: string; source: string; note: string }

export interface DayNote {
  slug: string;   // day-01
  label: string;  // Day 01
  date: string;
  title: string;
  topics: string[];
  body: string;
}

export interface Knowledge {
  id: string;
  title: string;
  mountain: string;
  layer: number;
  status: Status;
  summary: string;
  evidence: string[];
  evidenceNote?: string;
  weeks: string[];
  related: string[];
  abbr: string[];
  sources: Source[];
  updated: string;
  body: string;
  file: string;
}

const knowledgeRaw = import.meta.glob(['../../../knowledge/*/*.md', '!../../../knowledge/_*/**'], {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;
const mountainRaw = import.meta.glob('../../../knowledge/*/_mountain.yml', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;
const glossaryRaw = import.meta.glob('../../../knowledge/glossary.yml', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;
const notesRaw = import.meta.glob('../../../notes/*.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;
const progressRaw = import.meta.glob('../../../curriculum/PROGRESS.md', {
  query: '?raw', import: 'default', eager: true,
}) as Record<string, string>;

function splitFrontmatter(text: string): { data: Record<string, unknown>; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  return { data: (YAML.parse(m[1]) ?? {}) as Record<string, unknown>, body: m[2] };
}
const relPath = (p: string) => p.replace(/^(\.\.\/)+/, '');
const str = (v: unknown) => (v === undefined || v === null ? '' : String(v));

export const glossary: GlossaryItem[] = Object.values(glossaryRaw).flatMap((t) => (YAML.parse(t) ?? []) as GlossaryItem[]);
export const glossaryMap = new Map(glossary.map((g) => [g.abbr, g]));

export const mountains: Mountain[] = Object.values(mountainRaw).map((t) => YAML.parse(t) as Mountain);
export const mountainMap = new Map(mountains.map((m) => [m.id, m]));

export const knowledge: Knowledge[] = Object.entries(knowledgeRaw)
  .map(([path, text]) => {
    const { data: d, body } = splitFrontmatter(text);
    return {
      id: str(d.id),
      title: str(d.title),
      mountain: str(d.mountain),
      layer: Number(d.layer),
      status: d.status as Status,
      summary: str(d.summary),
      evidence: (d.evidence as string[]) ?? [],
      evidenceNote: d.evidenceNote ? str(d.evidenceNote) : undefined,
      weeks: ((d.weeks as unknown[]) ?? []).map(str),
      related: (d.related as string[]) ?? [],
      abbr: (d.abbr as string[]) ?? [],
      sources: (d.sources as Source[]) ?? [],
      updated: str(d.updated),
      body,
      file: relPath(path),
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
export const knowledgeMap = new Map(knowledge.map((k) => [k.id, k]));

export const days: DayNote[] = Object.entries(notesRaw)
  .map(([path, text]) => {
    const { data: d, body } = splitFrontmatter(text);
    const slug = path.split('/').pop()!.replace(/\.md$/, '');
    const num = slug.match(/(\d+)/)?.[1] ?? slug;
    const h1 = body.match(/^#\s+(.+)$/m)?.[1] ?? slug;
    return {
      slug,
      label: `Day ${num}`,
      date: str(d.date),
      title: h1.replace(/^Day\s*\d+\s*[｜|]\s*/, ''),
      topics: (d.topics as string[]) ?? [],
      body: body.replace(/^\s*#\s+.+\n+/, ''),
    };
  })
  .filter((d) => d.date)
  .sort((a, b) => a.date.localeCompare(b.date));
export const dayByDate = new Map(days.map((d) => [d.date, d]));

export function daysForKnowledge(id: string): DayNote[] {
  return days.filter((d) => d.topics.includes(id));
}

// PROGRESS.md 證據索引表：以「| E<數字> |」開頭的列
export const evidenceMap = new Map<string, Evidence>();
for (const text of Object.values(progressRaw)) {
  for (const line of text.split('\n')) {
    const m = line.match(/^\|\s*(E\d+)\s*\|([^|]*)\|([^|]*)\|/);
    if (m) evidenceMap.set(m[1], { id: m[1], source: m[2].trim(), note: m[3].trim() });
  }
}

export const STATUS_LABEL: Record<Status, string> = { guided: '帶做', discussed: '討論', unexplored: '待探索' };
export const STATUS_LEVEL: Record<Status, string> = { guided: 'L2', discussed: 'L1', unexplored: 'L0' };
export const KIND_LABEL: Record<SourceKind, string> = { official: '官方行為', engineering: '工程取捨', course: '課程自訂' };
