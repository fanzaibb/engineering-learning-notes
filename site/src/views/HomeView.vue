<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { RouterLink } from 'vue-router';
import { range, days, mountainMap } from '../lib/content';
import { makeTrees, pine } from '../lib/trees';

watchEffect(() => { document.title = '山行・知識山域'; });

const hovered = ref<string | null>(null);
const latest = days[days.length - 1];

// 三座山的插畫位置（viewBox 1000×460）
const PEAKS: Record<string, { x: number; y: number }> = {
  backend: { x: 215, y: 225 },
  azure: { x: 525, y: 190 },
  toeic: { x: 815, y: 232 },
};

const cards = computed(() => range.map((r) => {
  const m = mountainMap.get(r.id);
  const cur = m?.layers.find((l) => l.n === m.currentLayer);
  const statusText = r.statusText || (latest ? `${latest.label} · 進行中` : '進行中');
  return { ...r, statusText, peak: PEAKS[r.id], camp: cur ? cur.name : '' };
}));
const builder = computed(() => cards.value.find((c) => c.id === 'backend'));

const trees = [
  ...makeTrees(26, 7, { x0: 0, x1: 300, y0: 420, y1: 462 }, [16, 30]),
  ...makeTrees(30, 11, { x0: 280, x1: 690, y0: 418, y1: 462 }, [14, 28]),
  ...makeTrees(26, 23, { x0: 640, x1: 1000, y0: 412, y1: 462 }, [14, 28]),
].map(pine);
</script>

<template>
  <main id="main" class="home">
    <div class="home-art">
      <svg viewBox="0 0 1000 460" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#F7F4EA" /><stop offset="1" stop-color="#EEF0E4" />
          </linearGradient>
        </defs>
        <rect width="1000" height="460" fill="url(#sky)" />
        <!-- 遠山 -->
        <polygon points="0,460 0,300 70,290 140,330 265,220 380,330 470,300 560,260 700,215 790,280 880,290 960,245 1000,270 1000,460" fill="#DDE3D5" />
        <!-- 後端：綠 -->
        <g class="mtn-g" :class="{ hot: hovered === 'backend' }">
          <polygon points="-40,460 215,225 470,460" fill="#A3B994" />
          <polygon points="-40,460 215,225 186,300 236,382 150,460" fill="#7E9B70" />
          <polygon points="178,259 215,225 252,258 234,252 216,266 198,252" fill="#F3F1E4" />
          <path d="M217,256 C252,276 196,298 214,318 S292,346 244,368 S196,402 186,428" class="trail" />
        </g>
        <!-- Azure：藍灰 -->
        <g class="mtn-g" :class="{ hot: hovered === 'azure' }">
          <polygon points="250,460 525,190 800,460" fill="#97ACB0" />
          <polygon points="250,460 525,190 492,290 542,358 420,460" fill="#7A9399" />
          <polygon points="482,232 525,190 572,240 551,234 527,249 504,235" fill="#F3F1E4" />
          <path d="M547,240 C568,270 508,292 530,322 S604,356 560,386 S520,424 540,452" class="trail" />
        </g>
        <!-- 多益：沙 -->
        <g class="mtn-g" :class="{ hot: hovered === 'toeic' }">
          <polygon points="640,460 815,232 1020,460" fill="#CDBF96" />
          <polygon points="640,460 815,232 800,330 850,378 760,460" fill="#B3A07A" />
          <polygon points="790,264 815,232 846,268 829,262 815,276 800,262" fill="#F3F1E4" />
          <path d="M838,282 C862,302 818,322 844,342 S892,372 860,396" class="trail" />
        </g>
        <!-- 等高線 -->
        <g fill="none" stroke="#2F4A36" stroke-opacity=".12" stroke-width="1">
          <path d="M40,360 C140,340 260,350 330,372" /><path d="M380,320 C470,300 600,310 680,334" /><path d="M700,360 C780,345 880,350 980,372" />
        </g>
        <rect y="440" width="1000" height="20" fill="#C9D3BE" />
        <g fill="#5E7A58"><path v-for="(d, i) in trees" :key="i" :d="d" /></g>
      </svg>

      <!-- 點山進入（卡片是主要入口，這裡給滑鼠用） -->
      <RouterLink
        v-for="c in cards" :key="`hit-${c.id}`" :to="`/m/${c.id}`" class="mtn-hit" :class="`hit-${c.id}`"
        tabindex="-1" aria-hidden="true" @mouseenter="hovered = c.id" @mouseleave="hovered = null"
      />

      <div v-for="c in cards" :key="`lbl-${c.id}`" class="peak-label" :style="{ left: `${c.peak.x / 10}%`, top: `${((c.peak.y - 70) / 460) * 100}%` }">
        <span class="mono">{{ c.role }}</span>
        <small>{{ c.roleZh }}</small>
      </div>

      <RouterLink v-if="builder" to="/m/backend" class="trail-marker" style="left: 12%; top: 88%">
        <span class="marker-dot" aria-hidden="true" />後端 {{ latest?.label }}<template v-if="builder.camp"> · {{ builder.camp }}</template>
      </RouterLink>
      <p class="art-note">虛線＝規劃路徑，山峰高度不代表成績</p>

      <header class="home-head">
        <div class="mono eyebrow">Three trails. Your own pace.</div>
        <h1 class="home-title">今天，往哪座山<em>前進？</em></h1>
        <p class="home-lead">把筆記留在沿途，把理解帶上山。每條路，都有自己的節奏。</p>
      </header>
      <div class="home-aside">
        <span class="mono">Build · Administer · Communicate</span>
        <span>三條路線 / 分開記錄學習成果</span>
      </div>
    </div>

    <nav class="home-cards" aria-label="選擇一座山">
      <RouterLink
        v-for="c in cards" :key="c.id" :to="`/m/${c.id}`" class="mcard" :class="[c.status, { hot: hovered === c.id }]"
        @mouseenter="hovered = c.id" @mouseleave="hovered = null" @focus="hovered = c.id" @blur="hovered = null"
      >
        <span class="mcard-top"><span class="mcard-no">{{ c.no }}</span><b>{{ c.title }}</b><span class="mcard-go" aria-hidden="true">↗</span></span>
        <span class="mcard-tag">{{ c.tagline }}</span>
        <span class="mcard-st"><span class="st-icon" :class="c.status" aria-hidden="true" />{{ c.statusText }}</span>
      </RouterLink>
    </nav>
  </main>
</template>
