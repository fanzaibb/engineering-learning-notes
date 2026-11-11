// 內容檢查：npm run check。錯誤會中止建置，警告只列出。
// 規則見 docs/knowledge-site-guide.md 第 5 節。
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const KNOWLEDGE = join(ROOT, 'knowledge');
const NOTES = join(ROOT, 'notes');
const PROGRESS = join(ROOT, 'curriculum', 'PROGRESS.md');

const errors = [];
const warnings = [];
const rel = (p) => relative(ROOT, p);
const err = (file, msg) => errors.push(`${rel(file)}：${msg}`);
const warn = (file, msg) => warnings.push(`${rel(file)}：${msg}`);

function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: null, body: text };
  return { data: YAML.parse(m[1]) ?? {}, body: m[2] };
}

const REQUIRED = ['id', 'title', 'mountain', 'layer', 'status', 'summary', 'updated'];
const STATUSES = ['guided', 'discussed', 'unexplored'];
const SECTION_ORDER = ['說明', '易混淆點', '我做過什麼', '還沒做的'];

// 證據索引：PROGRESS.md 中以「| E<數字> |」開頭的列
const evidenceIds = new Set();
if (existsSync(PROGRESS)) {
  for (const line of readFileSync(PROGRESS, 'utf8').split('\n')) {
    const m = line.match(/^\|\s*(E\d+)\s*\|/);
    if (m) evidenceIds.add(m[1]);
  }
} else {
  errors.push('找不到 curriculum/PROGRESS.md，無法核對證據編號');
}

// 縮寫表
const glossaryPath = join(KNOWLEDGE, 'glossary.yml');
const glossary = YAML.parse(readFileSync(glossaryPath, 'utf8')) ?? [];
const abbrSet = new Set(glossary.map((g) => g.abbr));
for (const g of glossary) {
  if (!g.abbr || !g.full || !g.zh) err(glossaryPath, `縮寫項目欄位不完整：${JSON.stringify(g)}`);
}

// 敏感資訊與未登錄縮寫掃描
const SENSITIVE = [
  [/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, 'GUID 格式'],
  [/\/subscriptions\//i, '/subscriptions/'],
  [/AccountKey=/i, 'AccountKey='],
  [/password/i, 'password'],
];
function scanSensitive(file, text) {
  // 角括號佔位字（例如 /subscriptions/<subscription-id>）不是實際值，先移除再掃描
  const scrubbed = text.replace(/\/subscriptions\/<[^>\s]+>/gi, '');
  for (const [re, label] of SENSITIVE) if (re.test(scrubbed)) warn(file, `可能含敏感資訊（${label}），請確認`);
}
function stripCode(md) {
  return md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '');
}
// 不是縮寫的大寫詞：HTTP 方法、SQL 關鍵字、產品名、檔名、記錄類型等
const NOT_ABBR = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'JOIN', 'NULL', 'AND', 'SELECT', 'INSERT', 'UPDATE',
  'TODO', 'PROGRESS', 'README', 'SYLLABUS', 'SOURCES', 'PostgreSQL', 'MySQL', 'macOS', 'iOS', 'QUIC', 'AAAA', 'AZ', 'VS', 'ChatGPT']);
const unknownAbbr = new Map(); // abbr -> Set(files)
function scanAbbr(file, body) {
  for (const m of stripCode(body).matchAll(/(?<![A-Za-z0-9_])[A-Za-z0-9]*[A-Z]{2,}[A-Za-z0-9]*(?![A-Za-z0-9_])/g)) {
    const w = m[0];
    if (abbrSet.has(w) || NOT_ABBR.has(w)) continue;
    if (!unknownAbbr.has(w)) unknownAbbr.set(w, new Set());
    unknownAbbr.get(w).add(rel(file));
  }
}

// 山
const mountains = {};
for (const dir of readdirSync(KNOWLEDGE)) {
  const p = join(KNOWLEDGE, dir);
  if (!statSync(p).isDirectory() || dir.startsWith('_')) continue;
  const mf = join(p, '_mountain.yml');
  if (!existsSync(mf)) { err(p, '缺少 _mountain.yml'); continue; }
  const m = YAML.parse(readFileSync(mf, 'utf8'));
  mountains[m.id] = { ...m, dir: p, layerSet: new Set((m.layers ?? []).map((l) => l.n)) };
  if (m.currentLayer !== undefined && !mountains[m.id].layerSet.has(m.currentLayer)) err(mf, `currentLayer ${m.currentLayer} 不在 layers 中`);
}

// 知識點
const items = [];
for (const m of Object.values(mountains)) {
  for (const f of readdirSync(m.dir).filter((f) => f.endsWith('.md'))) {
    const file = join(m.dir, f);
    const text = readFileSync(file, 'utf8');
    const { data, body } = splitFrontmatter(text);
    if (!data) { err(file, '沒有前置資料'); continue; }
    items.push({ file, data, body });
  }
}
const byId = new Map();
for (const { file, data, body } of items) {
  for (const k of REQUIRED) if (data[k] === undefined || data[k] === null || data[k] === '') err(file, `缺少必填欄位 ${k}`);
  if (data.id) {
    if (byId.has(data.id)) err(file, `id ${data.id} 與 ${rel(byId.get(data.id))} 重複`);
    byId.set(data.id, file);
    if (!basename(file).startsWith(`${data.id}-`)) err(file, `檔名前綴應為 ${data.id}-`);
  }
  const mtn = mountains[data.mountain];
  if (data.mountain && !mtn) err(file, `mountain「${data.mountain}」不存在`);
  if (mtn && !mtn.layerSet.has(data.layer)) err(file, `layer ${data.layer} 不在 ${data.mountain}/_mountain.yml 中`);
  if (data.status && !STATUSES.includes(data.status)) err(file, `status「${data.status}」只能是 ${STATUSES.join('／')}`);
  for (const e of data.evidence ?? []) if (!evidenceIds.has(e)) err(file, `證據 ${e} 不在 PROGRESS.md 的證據索引表`);
  for (const a of data.abbr ?? []) if (!abbrSet.has(a)) err(file, `縮寫 ${a} 不在 glossary.yml`);
  for (const s of data.sources ?? []) {
    if (!['official', 'engineering', 'course'].includes(s.kind)) err(file, `來源「${s.title}」的 kind 必須是 official／engineering／course`);
  }
  if (typeof data.summary === 'string' && [...data.summary].length > 60) warn(file, `summary 超過 60 字（${[...data.summary].length}）`);
  // 段落順序
  const heads = [...body.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
  let last = -1;
  for (const h of heads) {
    const i = SECTION_ORDER.indexOf(h);
    if (i === -1) { warn(file, `非標準段落「${h}」`); continue; }
    if (i < last) err(file, `段落「${h}」順序錯誤，應依：${SECTION_ORDER.join(' → ')}`);
    last = i;
  }
  scanSensitive(file, body);
  scanAbbr(file, body);
}
for (const { file, data } of items) {
  for (const r of data.related ?? []) if (!byId.has(r)) err(file, `related 指向不存在的 ${r}`);
}

// 每日筆記
if (existsSync(NOTES)) {
  for (const f of readdirSync(NOTES).filter((f) => f.endsWith('.md'))) {
    const file = join(NOTES, f);
    const { data, body } = splitFrontmatter(readFileSync(file, 'utf8'));
    if (!data) { warn(file, '沒有前置資料（date、topics）'); continue; }
    if (!data.date) err(file, '缺少 date');
    for (const t of data.topics ?? []) if (!byId.has(t)) err(file, `topics 指向不存在的 ${t}`);
    if (!data.agent) warn(file, '缺少 agent 欄位（M7 起為必填）');
    scanSensitive(file, body);
    scanAbbr(file, body);
  }
}

// 收件匣
const inbox = join(KNOWLEDGE, '_inbox');
if (existsSync(inbox)) {
  const files = readdirSync(inbox).filter((f) => !f.startsWith('.'));
  if (files.length) warnings.push(`knowledge/_inbox/ 有 ${files.length} 個未處理檔案：${files.join('、')}`);
}

if (unknownAbbr.size) {
  const list = [...unknownAbbr.entries()].sort().map(([w, fs]) => `${w}（${[...fs].join('、')}）`);
  warnings.push(`未收錄於 glossary.yml 的大寫詞 ${unknownAbbr.size} 個：\n    ${list.join('\n    ')}`);
}

console.log(`知識點 ${items.length} 個，證據索引 ${evidenceIds.size} 筆，縮寫 ${abbrSet.size} 個`);
if (warnings.length) {
  console.log(`\n⚠ 警告 ${warnings.length} 項（不中止建置）`);
  for (const w of warnings) console.log(`  - ${w}`);
}
if (errors.length) {
  console.error(`\n✖ 錯誤 ${errors.length} 項`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n✔ 檢查通過');
