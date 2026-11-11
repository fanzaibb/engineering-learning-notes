<script setup lang="ts">
import { computed, nextTick, ref, watch, watchEffect } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import {
  knowledge, knowledgeMap, mountainMap, evidenceMap,
  STATUS_LABEL, STATUS_LEVEL, type Status, type Knowledge,
} from '../lib/content';
import { decorateText, newEnv } from '../lib/markdown';
import NotFoundView from './NotFoundView.vue';

const route = useRoute();
const router = useRouter();

const mountain = computed(() => mountainMap.get(String(route.params.mountain)));
const nodes = computed(() => knowledge.filter((k) => k.mountain === mountain.value?.id));

// 其他山：目前只有後端開發山有內容，其餘保留入口
const otherMountains = [
  { no: '02', title: 'Azure 與部署', sub: '從本機到雲端的那一段路' },
  { no: '03', title: '軟體工程', sub: '讓修改、驗證與交付值得信任' },
  { no: '04', title: '多益準備', sub: '聽力與閱讀，走自己的節奏' },
];

// 檢視、選取存在網址查詢參數，重新整理或分享連結都能回到同一狀態
const view = computed<'map' | 'list'>(() => (route.query.view === 'list' ? 'list' : 'map'));
const selId = computed(() => {
  const q = String(route.query.sel ?? '');
  return knowledgeMap.has(q) ? q : 'be-08';
});
const setQuery = (patch: Record<string, string | undefined>) =>
  router.replace({ query: { ...route.query, ...patch } });

// 手機上詳細區在地圖下方很遠，選取後若不在畫面內就捲過去
const detailEl = ref<HTMLElement | null>(null);
async function pick(id: string) {
  await setQuery({ sel: id });
  await nextTick();
  const el = detailEl.value;
  if (el && el.getBoundingClientRect().top > window.innerHeight - 80) el.scrollIntoView({ block: 'nearest' });
}

watchEffect(() => { document.title = mountain.value ? `${mountain.value.title}｜山行・知識山域` : '找不到頁面｜山行・知識山域'; });

const filter = ref<'all' | Status>('all');
const q = ref('');
watch(() => route.params.mountain, () => { filter.value = 'all'; q.value = ''; });

const count = (s: Status) => nodes.value.filter((n) => n.status === s).length;
const filters = computed(() => [
  { key: 'all' as const, label: '全部', count: nodes.value.length },
  { key: 'guided' as const, label: `帶做（${STATUS_LEVEL.guided}）`, count: count('guided') },
  { key: 'discussed' as const, label: `討論（${STATUS_LEVEL.discussed}）`, count: count('discussed') },
  { key: 'unexplored' as const, label: `待探索（${STATUS_LEVEL.unexplored}）`, count: count('unexplored') },
]);

const match = (n: Knowledge) => {
  const term = q.value.trim().toLowerCase();
  return (filter.value === 'all' || n.status === filter.value)
    && (!term || (n.title + n.summary).toLowerCase().includes(term));
};

const layersTop = computed(() => [...(mountain.value?.layers ?? [])].sort((a, b) => b.n - a.n));
const layersBottom = computed(() => [...layersTop.value].reverse());
const nodesIn = (n: number) => nodes.value.filter((k) => k.layer === n);
const matchedIn = (n: number) => nodesIn(n).filter(match);
const anyMatch = computed(() => nodes.value.some(match));

const sel = computed(() => knowledgeMap.get(selId.value)!);
const selLayer = computed(() => mountain.value?.layers.find((l) => l.n === sel.value.layer));
const evidenceText = (k: Knowledge) => {
  const ids = k.evidence.join('、');
  if (ids && k.evidenceNote) return `${ids}（${k.evidenceNote}）`;
  return ids || k.evidenceNote || '尚無';
};
const evidenceShort = (k: Knowledge) => k.evidence.join('、') || '—';
const lastEvidence = computed(() => [...evidenceMap.keys()].pop());

// 一句話結論也套縮寫 tooltip（不展開全名，避免標題區過長）
const tip = (text: string, prefix: string) => decorateText(text, newEnv(prefix, false));
</script>

<template>
  <NotFoundView v-if="!mountain" />
  <div v-else class="layout">
    <aside class="sidebar" aria-label="山域與篩選">
      <div>
        <div class="mono eyebrow">Choose a mountain</div>
        <div style="font-weight: 700; font-size: 15px; margin: 4px 0 10px">我的知識山域</div>
        <div style="display: flex; flex-direction: column; gap: 4px">
          <RouterLink :to="`/m/${mountain.id}`" class="mtn on" aria-current="page">
            <span class="mono" style="font-size: 11px">01</span>
            <span>後端開發<small>{{ mountain.subtitle }}</small></span>
          </RouterLink>
          <div v-for="m in otherMountains" :key="m.no" class="mtn off">
            <span class="mono" style="font-size: 11px">{{ m.no }}</span>
            <span>{{ m.title }}<small>{{ m.sub }}・尚未建立</small></span>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px">
        <label for="q" class="field-label">找知識點</label>
        <input id="q" v-model="q" type="search" class="search" placeholder="例如：交易、CORS" autocomplete="off" />
      </div>

      <div style="display: flex; flex-direction: column; gap: 2px" role="group" aria-labelledby="flt">
        <div id="flt" class="field-label" style="margin-bottom: 4px">狀態篩選</div>
        <button
          v-for="f in filters" :key="f.key" type="button" class="fbtn" :class="{ on: filter === f.key }"
          :aria-pressed="filter === f.key" @click="filter = f.key"
        >
          <span v-if="f.key !== 'all'" class="dot" :class="f.key" aria-hidden="true" />
          <span>{{ f.label }}</span><span class="n">{{ f.count }}</span>
        </button>
      </div>

      <div class="note-box">
        <div style="font-weight: 700; margin-bottom: 4px">怎麼讀這座山</div>
        高度是學習順序，不是完成率。越下面越基礎，上層要靠下層才站得住。雲霧帶是 W3 之後的課程，多數只討論過、還沒實作。
      </div>

      <div style="font-size: 12px; color: var(--muted); line-height: 1.8">
        <div class="mono eyebrow">Content baseline</div>
        依 PROGRESS.md 證據 E01–{{ lastEvidence }}
      </div>
    </aside>

    <main id="main" class="main">
      <div style="display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px">
        <div>
          <div class="mono eyebrow">The Builder / Knowledge Map</div>
          <h1 class="page-title">{{ mountain.title }}</h1>
          <p class="lead">
            {{ nodes.length }} 個知識點、{{ mountain.layers.length }} 層。帶做 {{ count('guided') }}、討論 {{ count('discussed') }}、待探索 {{ count('unexplored') }}。
            {{ view === 'map' ? '點任一個知識點看它的一句話結論與證據。' : '由第 1 層往上列出，點一列進入完整筆記。' }}
          </p>
        </div>
        <div class="seg" role="group" aria-label="檢視方式">
          <button type="button" :class="{ on: view === 'map' }" :aria-pressed="view === 'map'" @click="setQuery({ view: undefined })">地圖</button>
          <button type="button" :class="{ on: view === 'list' }" :aria-pressed="view === 'list'" @click="setQuery({ view: 'list' })">清單</button>
        </div>
      </div>

      <p class="visually-hidden" aria-live="polite">{{ nodes.filter(match).length }} 個知識點符合條件</p>

      <!-- 地圖：每層一條帶，由下往上；不畫連線 -->
      <section v-if="view === 'map'" class="map" aria-label="知識地圖，由上而下為山頂到山腳">
        <svg viewBox="0 0 1000 900" preserveAspectRatio="none" aria-hidden="true">
          <polygon points="0,900 0,520 150,380 300,540 420,300 520,60 640,320 760,220 1000,520 1000,900" fill="#D5DCC6" />
          <polygon points="40,900 520,50 980,900" fill="#A9B999" />
          <polygon points="520,50 980,900 640,900 560,420" fill="#BFCBAE" />
          <polygon points="455,165 520,50 585,165 552,150 520,182 488,150" fill="#F4F2E6" />
          <polygon points="0,900 0,820 1000,820 1000,900" fill="#8FA27F" />
          <g fill="#5F7656">
            <polygon points="40,860 56,826 72,860" /><polygon points="110,872 130,830 150,872" /><polygon points="210,866 226,834 242,866" />
            <polygon points="760,868 778,830 796,868" /><polygon points="850,872 870,828 890,872" /><polygon points="930,862 946,830 962,862" />
          </g>
        </svg>
        <div class="bands">
          <div
            v-for="l in layersTop" :key="l.n" class="band" :class="[`b${l.n}`, { mist: l.n >= mountain.mistFromLayer }]"
            role="group" :aria-label="`第 ${l.n} 層 ${l.alt}・${l.name}`"
          >
            <div class="lbl"><b>{{ l.alt }}・{{ l.name }}</b><span>{{ l.weeks }}</span></div>
            <div class="chips">
              <button
                v-for="n in nodesIn(l.n)" :key="n.id" type="button" class="chip"
                :class="[n.status, { 'is-sel': n.id === selId, 'is-dim': !match(n) }]"
                :aria-pressed="n.id === selId" @click="pick(n.id)"
              >
                <span class="dot" :class="n.status" aria-hidden="true" />{{ n.title }}
                <span class="visually-hidden">，{{ STATUS_LABEL[n.status] }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 清單：主要入口，由第 1 層往上 -->
      <section v-else class="list" aria-label="知識清單，由基礎往上">
        <template v-if="anyMatch">
          <template v-for="l in layersBottom" :key="l.n">
            <template v-if="matchedIn(l.n).length">
              <h2 class="list-head" style="margin: 0">第 {{ l.n }} 層｜{{ l.alt }}・{{ l.name }}<span class="mono">{{ l.weeks }}</span></h2>
              <RouterLink v-for="n in matchedIn(l.n)" :key="n.id" :to="`/k/${n.id}`" class="row">
                <b>{{ n.title }}</b>
                <span class="st"><span class="dot" :class="n.status" aria-hidden="true" />{{ STATUS_LABEL[n.status] }}</span>
                <span class="sum">{{ n.summary }}</span>
                <span class="ev">{{ evidenceShort(n) }}</span>
              </RouterLink>
            </template>
          </template>
        </template>
        <p v-else class="empty">沒有符合的知識點，換個關鍵字或狀態試試。</p>
      </section>

      <section v-if="view === 'map'" ref="detailEl" class="card detail" aria-label="選取的知識點" aria-live="polite">
        <div class="detail-main">
          <div class="meta-row">
            <span class="pill" :class="sel.status"><span class="dot" :class="sel.status" aria-hidden="true" />{{ STATUS_LABEL[sel.status] }}</span>
            <span>第 {{ sel.layer }} 層・{{ selLayer?.alt }}・{{ selLayer?.name }}</span>
            <span class="mono" style="font-size: 11px">{{ sel.id }}</span>
          </div>
          <h2>{{ sel.title }}</h2>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <p class="summary" v-html="tip(sel.summary, `sel-${sel.id}`)" />
          <RouterLink :to="`/k/${sel.id}`" class="btn-link">閱讀完整筆記 →</RouterLink>
        </div>
        <dl class="kv">
          <dt>證據</dt><dd>{{ evidenceText(sel) }}</dd>
          <dt>週次</dt><dd>{{ sel.weeks.join('、') || '—' }}</dd>
          <dt>相關</dt>
          <dd>
            <span class="inline-links">
              <RouterLink v-for="r in sel.related" :key="r" :to="{ query: { ...route.query, sel: r } }">{{ knowledgeMap.get(r)?.title }}</RouterLink>
            </span>
          </dd>
        </dl>
      </section>

      <p class="foot">位置代表知識的依賴順序，不代表完成率。狀態對應 PROGRESS.md：帶做＝L2、討論＝L1、待探索＝L0。</p>
    </main>
  </div>
</template>
