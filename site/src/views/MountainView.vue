<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { knowledge, mountainMap, range, days, STATUS_LABEL, type Knowledge } from '../lib/content';
import { makeTrees, pine } from '../lib/trees';
import SidePanel from '../components/SidePanel.vue';
import NotFoundView from './NotFoundView.vue';

const route = useRoute();
const router = useRouter();

const id = computed(() => String(route.params.mountain));
const mountain = computed(() => mountainMap.get(id.value));
const entry = computed(() => range.find((r) => r.id === id.value));
const nodes = computed(() => knowledge.filter((k) => k.mountain === id.value));
const latest = days[days.length - 1];

watchEffect(() => {
  document.title = `${entry.value?.title ?? mountain.value?.title ?? '找不到頁面'}｜山行・知識山域`;
});

// 山與路徑共用同一個座標（viewBox 200×100，對應營地區塊），縮放時不會錯位。
// 山頂 (100,-6)，山腳 (-16,108)～(216,108)；營地點都落在山的輪廓內。
const PEAK = { x: 100, y: -6 };
const BASE_Y = 108;
const HALF_BASE = 116;
// 營地位置（百分比，卡片中心），由山腳往山頂之字形，越高越靠近中線
const SPOTS = [
  { x: 31, y: 88 }, { x: 65, y: 77 }, { x: 36, y: 66 }, { x: 63, y: 55 },
  { x: 39, y: 44 }, { x: 60, y: 33 }, { x: 44, y: 22 }, { x: 53, y: 10 },
];

const q = ref('');
const term = computed(() => q.value.trim().toLowerCase());
const hit = (n: Knowledge) => !term.value || (n.title + n.summary).toLowerCase().includes(term.value);

const stages = computed(() => {
  const m = mountain.value;
  if (!m) return [];
  return [...m.layers].sort((a, b) => a.n - b.n).map((l, i) => {
    const list = nodes.value.filter((k) => k.layer === l.n);
    const spot = SPOTS[i] ?? { x: 50, y: 50 };
    return {
      ...l, spot, list,
      hits: list.filter(hit).length,
      up: spot.y > 55,               // 下半部的營地往上展開，避免超出畫面
      current: l.n === m.currentLayer,
      counts: {
        guided: list.filter((k) => k.status === 'guided').length,
        discussed: list.filter((k) => k.status === 'discussed').length,
        unexplored: list.filter((k) => k.status === 'unexplored').length,
      },
    };
  });
});

// 路徑：從山腳出發，依序通過各營地的平滑曲線
const trailPath = computed(() => {
  const pts = stages.value.map((s) => [s.spot.x * 2, s.spot.y]);
  if (!pts.length) return '';
  let d = `M${pts[0][0] - 10},${BASE_Y} C${pts[0][0] - 10},${pts[0][1] + 8} ${pts[0][0]},${pts[0][1] + 8} ${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const my = (y0 + y1) / 2;
    d += ` C${x0},${my} ${x1},${my} ${x1},${y1}`;
  }
  return d;
});

const setQuery = (patch: Record<string, string | undefined>) => {
  const query: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...route.query, k: undefined, layer: undefined, panel: undefined, ...patch })) {
    if (typeof v === 'string') query[k] = v;
  }
  router.replace({ query });
};
const openLayer = (n: number) => setQuery({ layer: String(n) });
const openKnowledge = (kid: string) => setQuery({ k: kid });
const openAll = () => setQuery({ panel: 'all' });
const closePanel = () => setQuery({});
const activeLayer = computed(() => {
  const k = route.query.k ? knowledge.find((n) => n.id === route.query.k) : undefined;
  return k?.layer ?? (route.query.layer ? Number(route.query.layer) : null);
});

// 山的兩面（同首頁畫法）：亮面整座、暗面在左側
const mtn = {
  body: `${PEAK.x},${PEAK.y} ${PEAK.x - HALF_BASE},${BASE_Y} ${PEAK.x + HALF_BASE},${BASE_Y}`,
  shade: `${PEAK.x},${PEAK.y} ${PEAK.x - HALF_BASE},${BASE_Y} ${PEAK.x - 38},${BASE_Y} ${PEAK.x - 6},${62} ${PEAK.x - 14},${30}`,
  snow: `${PEAK.x - 13},${PEAK.y + 15} ${PEAK.x},${PEAK.y} ${PEAK.x + 14},${PEAK.y + 16} ${PEAK.x + 7},${PEAK.y + 13} ${PEAK.x},${PEAK.y + 19} ${PEAK.x - 6},${PEAK.y + 13}`,
};
const trees = [
  ...makeTrees(22, 5, { x0: -10, x1: 70, y0: 96, y1: 110 }, [5, 9]),
  ...makeTrees(18, 9, { x0: 130, x1: 210, y0: 96, y1: 110 }, [5, 9]),
  ...makeTrees(16, 17, { x0: 60, x1: 140, y0: 101, y1: 111 }, [4, 7]),
].map(pine);
</script>

<template>
  <!-- 規劃中的山 -->
  <main v-if="!mountain && entry" id="main" class="screen planned-page">
    <div class="planned-box">
      <div class="mono eyebrow">{{ entry.role }}</div>
      <h1 class="page-title">{{ entry.title }}</h1>
      <p class="lead">{{ entry.tagline }}。{{ entry.statusText }}，知識點還沒建立。</p>
      <RouterLink to="/" class="btn-link">← 回到山域</RouterLink>
    </div>
  </main>
  <NotFoundView v-else-if="!mountain" />

  <main v-else id="main" class="screen trail-page">
    <svg class="trail-bg" viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="tsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#F7F4EA" /><stop offset="1" stop-color="#E9ECDF" />
        </linearGradient>
      </defs>
      <rect width="1600" height="1000" fill="url(#tsky)" />
      <rect y="930" width="1600" height="70" fill="#C9D3BE" />
    </svg>

    <div class="trail-head">
      <div class="mono eyebrow">Trail map / {{ stages.length }} stages · one ascent</div>
      <h1 class="trail-title">{{ entry?.title ?? mountain.title }}</h1>
      <p class="trail-sub">{{ mountain.title }}・{{ nodes.length }} 個知識點</p>
    </div>
    <div class="trail-vert mono" aria-hidden="true">Foundation → Independent delivery</div>

    <div class="trail-tools">
      <label for="q" class="visually-hidden">找知識點</label>
      <input id="q" v-model="q" type="search" class="search" placeholder="找知識點：交易、CORS" autocomplete="off" />
      <button type="button" class="tool-btn" @click="openAll">全部知識點</button>
    </div>

    <div class="trail-area">
    <svg class="trail-svg" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <clipPath id="mclip"><polygon :points="mtn.body" /></clipPath>
        <linearGradient id="tmist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity=".45" /><stop offset="1" stop-color="#FFFFFF" stop-opacity="0" />
        </linearGradient>
      </defs>
      <polygon :points="mtn.body" fill="#A3B994" />
      <polygon :points="mtn.shade" fill="#7E9B70" />
      <g clip-path="url(#mclip)">
        <!-- 等高線 -->
        <g fill="none" stroke="#2F4A36" stroke-opacity=".12" stroke-width="1" vector-effect="non-scaling-stroke">
          <path d="M20,84 C60,78 120,80 180,86" vector-effect="non-scaling-stroke" />
          <path d="M44,60 C80,55 120,57 156,62" vector-effect="non-scaling-stroke" />
          <path d="M66,36 C90,33 112,34 134,38" vector-effect="non-scaling-stroke" />
        </g>
        <!-- 雲霧帶：第 5 層以上 -->
        <rect x="0" y="-10" width="200" height="60" fill="url(#tmist)" />
      </g>
      <polygon :points="mtn.snow" fill="#F3F1E4" />
      <path :d="trailPath" class="trail-line" />
      <g fill="#5E7A58"><path v-for="(d, i) in trees" :key="i" :d="d" /></g>
    </svg>
    <ol class="stages" aria-label="由山腳到山頂的營地">
      <li
        v-for="s in stages" :key="s.n" class="stage"
        :class="{ up: s.up, current: s.current, active: activeLayer === s.n, dim: term && !s.hits }"
        :style="{ left: `${s.spot.x}%`, top: `${s.spot.y}%` }"
      >
        <button type="button" class="stage-card" @click="openLayer(s.n)">
          <span class="stage-title"><span class="stage-no">{{ String(s.n).padStart(2, '0') }}</span>{{ s.name }}</span>
          <span class="stage-kw">{{ s.keywords ?? s.alt }}</span>
          <span v-if="s.current" class="stage-here"><span class="marker-dot light" aria-hidden="true" />{{ latest?.label }} · 目前位置</span>
          <span v-if="term && s.hits" class="stage-badge" :aria-label="`${s.hits} 個符合`">{{ s.hits }}</span>
        </button>
        <!-- hover／鍵盤聚焦時滑開該層的所有知識點 -->
        <div class="stage-pop">
          <div class="pop-inner">
            <div class="pop-head">
              <span>{{ s.alt }}</span>
              <span class="pop-counts" :aria-label="`帶做 ${s.counts.guided}、討論 ${s.counts.discussed}、待探索 ${s.counts.unexplored}`">
                <span><span class="dot guided" aria-hidden="true" />{{ s.counts.guided }}</span>
                <span><span class="dot discussed" aria-hidden="true" />{{ s.counts.discussed }}</span>
                <span><span class="dot unexplored" aria-hidden="true" />{{ s.counts.unexplored }}</span>
              </span>
            </div>
            <ul class="pop-chips">
              <li v-for="n in s.list" :key="n.id">
                <button type="button" class="chip" :class="[n.status, { 'is-dim': !hit(n) }]" @click="openKnowledge(n.id)">
                  <span class="dot" :class="n.status" aria-hidden="true" />{{ n.title }}
                  <span class="visually-hidden">，{{ STATUS_LABEL[n.status] }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ol>
    </div>

    <div class="trail-legend">
      <span><span class="legend-cur" aria-hidden="true" />目前位置</span>
      <span><span class="legend-card" aria-hidden="true" />已有課程安排</span>
      <span class="legend-hint hint-hover">滑過營地看知識點，點擊開啟</span>
      <span class="legend-hint hint-tap">點營地看知識點</span>
      <span class="legend-note">位置代表依賴順序，不代表完成率</span>
    </div>

    <SidePanel
      :mountain="mountain" :nodes="nodes" :q="q"
      @close="closePanel" @open-knowledge="openKnowledge" @open-layer="openLayer"
    />
  </main>
</template>
