// Markdown 轉 HTML，並把 glossary.yml 裡的縮寫包成可 hover、可聚焦、可點的 tooltip。
// 規則：整詞、區分大小寫；程式碼與連結文字不套用；每頁第一次出現另寫全名。
import MarkdownIt from 'markdown-it';
import type { Token } from 'markdown-it';
import { glossary, glossaryMap } from './content';

export interface RenderEnv {
  prefix: string;          // tooltip id 前綴，同頁多個區塊要不同
  seen: Set<string>;       // 本頁已出現過的縮寫（共用可跨區塊）
  expand: boolean;         // 第一次出現時是否寫出全名
  counter?: number;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const words = glossary.map((g) => g.abbr).sort((a, b) => b.length - a.length)
  .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
const ABBR_RE = words.length ? new RegExp(`(?<![A-Za-z0-9_])(${words.join('|')})(?![A-Za-z0-9_])`, 'g') : null;

export function abbrHtml(abbr: string, env: RenderEnv): string {
  const g = glossaryMap.get(abbr)!;
  env.counter = (env.counter ?? 0) + 1;
  const id = `${env.prefix}-tip-${env.counter}`;
  return `<span class="abbr"><button type="button" class="abbr-btn" aria-describedby="${id}">${escapeHtml(abbr)}</button>`
    + `<span role="tooltip" id="${id}" class="abbr-tip">${escapeHtml(`${g.full}，${g.zh}`)}</span></span>`;
}

/** 把一段純文字中的縮寫換成 HTML（回傳已跳脫的 HTML） */
export function decorateText(text: string, env: RenderEnv): string {
  if (!ABBR_RE) return escapeHtml(text);
  let out = '';
  let last = 0;
  ABBR_RE.lastIndex = 0;
  for (let m = ABBR_RE.exec(text); m; m = ABBR_RE.exec(text)) {
    const abbr = m[1];
    out += escapeHtml(text.slice(last, m.index)) + abbrHtml(abbr, env);
    last = m.index + abbr.length;
    if (!env.seen.has(abbr)) {
      env.seen.add(abbr);
      // 原文已在後面寫了全名（例如「ARP（Address…）」）就不重複
      const next = text.charAt(last);
      if (env.expand && next !== '（' && next !== '(') {
        const g = glossaryMap.get(abbr)!;
        out += escapeHtml(`（${g.full}，${g.zh}）`);
      }
    }
  }
  return out + escapeHtml(text.slice(last));
}

const md = new MarkdownIt({ html: false, linkify: false, typographer: false });

md.core.ruler.push('abbr_tooltip', (state) => {
  const env = state.env as unknown as RenderEnv;
  if (!env?.prefix) return;
  for (const block of state.tokens) {
    if (block.type !== 'inline' || !block.children) continue;
    const out: Token[] = [];
    let linkDepth = 0;
    for (const t of block.children) {
      if (t.type === 'link_open') linkDepth++;
      if (t.type === 'link_close') linkDepth--;
      if (t.type !== 'text' || linkDepth > 0 || !ABBR_RE) { out.push(t); continue; }
      ABBR_RE.lastIndex = 0;
      if (!ABBR_RE.test(t.content)) { out.push(t); continue; }
      const tok = new state.Token('html_inline', '', 0);
      tok.content = decorateText(t.content, env);
      out.push(tok);
    }
    block.children = out;
  }
});

// 連結：外部連結開新分頁；倉庫內相對路徑在網站上無對應頁面，改成純文字
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  const t = tokens[idx];
  const href = String(t.attrGet('href') ?? '');
  if (/^https?:\/\//.test(href)) {
    t.attrSet('target', '_blank');
    t.attrSet('rel', 'noopener noreferrer');
    return self.renderToken(tokens, idx, options);
  }
  t.meta = { ...(t.meta ?? {}), plain: true };
  // 找到對應的 link_close 並標記
  for (let i = idx + 1; i < tokens.length; i++) {
    if (tokens[i].type === 'link_close') { tokens[i].meta = { plain: true }; break; }
  }
  return `<span class="repo-ref" title="倉庫內檔案：${escapeHtml(href)}">`;
};
md.renderer.rules.link_close = (tokens, idx, options, _env, self) =>
  tokens[idx].meta?.plain ? '</span>' : self.renderToken(tokens, idx, options);

// 本文裡的 # 標題降一級，頁面只保留一個 h1（頁首）
md.renderer.rules.heading_open = (tokens, idx, options, _env, self) => {
  if (tokens[idx].tag === 'h1') tokens[idx].tag = 'h2';
  return self.renderToken(tokens, idx, options);
};
md.renderer.rules.heading_close = (tokens, idx, options, _env, self) => {
  if (tokens[idx].tag === 'h1') tokens[idx].tag = 'h2';
  return self.renderToken(tokens, idx, options);
};

// 表格外包一層可橫向捲動的容器，避免手機破版
md.renderer.rules.table_open = () => '<div class="table-wrap"><table>';
md.renderer.rules.table_close = () => '</table></div>';

export function renderMarkdown(src: string, env: RenderEnv): string {
  return md.render(src, env as unknown as Record<string, unknown>);
}

export function newEnv(prefix: string, expand = true): RenderEnv {
  return { prefix, seen: new Set(), expand, counter: 0 };
}
