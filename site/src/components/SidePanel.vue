<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import {
  knowledgeMap, evidenceMap, glossaryMap, daysForKnowledge, weekOf,
  STATUS_LABEL, STATUS_LEVEL, KIND_LABEL,
  type Knowledge, type Mountain, type Status, type SourceKind,
} from '../lib/content';
import { renderMarkdown, decorateText, newEnv } from '../lib/markdown';

const props = defineProps<{ mountain: Mountain; nodes: Knowledge[]; q: string }>();
const emit = defineEmits<{ close: []; openKnowledge: [id: string]; openLayer: [n: number] }>();
const route = useRoute();

// 側欄模式由網址決定：?k=be-08 知識點、?layer=3 一層、?panel=all 全部
const k = computed(() => (route.query.k ? knowledgeMap.get(String(route.query.k)) : undefined));
const layerN = computed(() => (route.query.layer ? Number(route.query.layer) : null));
const mode = computed<'k' | 'layer' | 'all' | null>(() => {
  if (k.value) return 'k';
  if (layerN.value && props.mountain.layers.some((l) => l.n === layerN.value)) return 'layer';
  if (route.query.panel === 'all') return 'all';
  return null;
});
const layerOf = (n: number) => props.mountain.layers.find((l) => l.n === n);
const layer = computed(() => (mode.value === 'k' ? layerOf(k.value!.layer) : layerN.value ? layerOf(layerN.value) : undefined));
const layerNodes = computed(() => props.nodes.filter((n) => n.layer === layer.value?.n));

// 全部清單：狀態篩選＋共用搜尋字
const filter = ref<'all' | Status>('all');
const term = computed(() => props.q.trim().toLowerCase());
const match = (n: Knowledge) => (filter.value === 'all' || n.status === filter.value)
  && (!term.value || (n.title + n.summary).toLowerCase().includes(term.value));
const count = (s: Status) => props.nodes.filter((n) => n.status === s).length;
const filters = computed(() => [
  { key: 'all' as const, label: '全部', count: props.nodes.length },
  { key: 'guided' as const, label: '帶做', count: count('guided') },
  { key: 'discussed' as const, label: '討論', count: count('discussed') },
  { key: 'unexplored' as const, label: '待探索', count: count('unexplored') },
]);
const groups = computed(() => [...props.mountain.layers].sort((a, b) => a.n - b.n)
  .map((l) => ({ ...l, list: props.nodes.filter((n) => n.layer === l.n && match(n)) }))
  .filter((g) => g.list.length));

// 知識點詳細
const rendered = computed(() => {
  if (!k.value) return { summary: '', body: '' };
  return {
    summary: decorateText(k.value.summary, newEnv(`${k.value.id}-sum`, false)),
    body: renderMarkdown(k.value.body, newEnv(`${k.value.id}-body`, true)),
  };
});
const appearsIn = computed(() => (k.value ? daysForKnowledge(k.value.id) : []));
// 依每日筆記日期算出這個知識點在第幾週出現過
const weeksSeen = computed(() => {
  const map = new Map<number, typeof appearsIn.value>();
  for (const d of appearsIn.value) {
    const w = weekOf(d.date, props.mountain.courseStart);
    if (!w) continue;
    map.set(w, [...(map.get(w) ?? []), d]);
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]).map(([week, days]) => ({ week, days }));
});
const KIND_ORDER: SourceKind[] = ['official', 'engineering', 'course'];
const sourceGroups = computed(() => KIND_ORDER
  .map((kind) => ({ kind, items: (k.value?.sources ?? []).filter((s) => s.kind === kind) }))
  .filter((g) => g.items.length));

// 開啟或切換內容時：捲回頂端、焦點移到標題
const scroller = ref<HTMLElement | null>(null);
const heading = ref<HTMLElement | null>(null);
watch(() => route.fullPath, async () => {
  if (!mode.value) return;
  await nextTick();
  scroller.value?.scrollTo({ top: 0 });
  heading.value?.focus({ preventScroll: true });
});
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && mode.value && !document.querySelector('.abbr.open')) emit('close');
};
onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="scrim" :class="{ show: !!mode }" aria-hidden="true" @click="emit('close')" />
  <aside class="panel" :class="{ show: !!mode }" :aria-hidden="!mode" :inert="!mode || undefined" aria-labelledby="panel-h">
    <div class="panel-bar">
      <button v-if="mode === 'k'" type="button" class="panel-back" @click="emit('openLayer', k!.layer)">← 第 {{ k!.layer }} 層</button>
      <span v-else class="mono eyebrow">{{ mode === 'all' ? 'All knowledge' : 'Camp' }}</span>
      <button type="button" class="panel-close" aria-label="關閉側欄" @click="emit('close')">✕</button>
    </div>

    <div ref="scroller" class="panel-body">
      <!-- 一層 -->
      <template v-if="mode === 'layer' && layer">
        <div class="meta-row"><span class="mono" style="font-size: 11px">Stage {{ String(layer.n).padStart(2, '0') }}</span><span>{{ layer.alt }}</span></div>
        <h2 id="panel-h" ref="heading" tabindex="-1" class="panel-title">{{ layer.name }}</h2>
        <p class="panel-sub">{{ layer.keywords }}</p>
        <ul class="plist">
          <li v-for="n in layerNodes" :key="n.id">
            <button type="button" class="prow" @click="emit('openKnowledge', n.id)">
              <span class="prow-top"><span class="dot" :class="n.status" aria-hidden="true" /><b>{{ n.title }}</b><span class="prow-st">{{ STATUS_LABEL[n.status] }}</span></span>
              <span class="prow-sum">{{ n.summary }}</span>
            </button>
          </li>
        </ul>
      </template>

      <!-- 全部 -->
      <template v-else-if="mode === 'all'">
        <h2 id="panel-h" ref="heading" tabindex="-1" class="panel-title">全部知識點</h2>
        <p class="panel-sub">由第 1 層往上{{ term ? `・搜尋「${q.trim()}」` : '' }}</p>
        <div class="pfilters" role="group" aria-label="狀態篩選">
          <button v-for="f in filters" :key="f.key" type="button" class="pfilter" :class="{ on: filter === f.key }" :aria-pressed="filter === f.key" @click="filter = f.key">
            <span v-if="f.key !== 'all'" class="dot" :class="f.key" aria-hidden="true" />{{ f.label }} <span class="n">{{ f.count }}</span>
          </button>
        </div>
        <template v-for="g in groups" :key="g.n">
          <h3 class="pgroup">第 {{ g.n }} 層・{{ g.name }}</h3>
          <ul class="plist">
            <li v-for="n in g.list" :key="n.id">
              <button type="button" class="prow" @click="emit('openKnowledge', n.id)">
                <span class="prow-top"><span class="dot" :class="n.status" aria-hidden="true" /><b>{{ n.title }}</b><span class="prow-st">{{ STATUS_LABEL[n.status] }}</span></span>
                <span class="prow-sum">{{ n.summary }}</span>
              </button>
            </li>
          </ul>
        </template>
        <p v-if="!groups.length" class="empty">沒有符合的知識點，換個關鍵字或狀態試試。</p>
      </template>

      <!-- 知識點 -->
      <template v-else-if="mode === 'k' && k">
        <div class="meta-row">
          <span class="pill" :class="k.status"><span class="dot" :class="k.status" aria-hidden="true" />{{ STATUS_LABEL[k.status] }}（{{ STATUS_LEVEL[k.status] }}）</span>
          <span>第 {{ k.layer }} 層・{{ layer?.name }}</span>
          <span class="mono" style="font-size: 11px">{{ k.id }}</span>
        </div>
        <h2 id="panel-h" ref="heading" tabindex="-1" class="panel-title">{{ k.title }}</h2>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="psummary" v-html="rendered.summary" />

        <dl class="kv">
          <dt>證據</dt>
          <dd>
            <template v-if="k.evidence.length">
              <span v-for="e in k.evidence" :key="e" class="ev-line">
                <b class="mono-id">{{ e }}</b> {{ evidenceMap.get(e)?.source }}
              </span>
            </template>
            <span v-else>尚無證據編號</span>
            <span v-if="k.evidenceNote" class="sub">{{ k.evidenceNote }}</span>
          </dd>
          <template v-if="k.related.length">
            <dt>相關</dt>
            <dd class="inline-links">
              <button v-for="r in k.related" :key="r" type="button" class="link-btn" @click="emit('openKnowledge', r)">{{ knowledgeMap.get(r)?.title ?? r }}</button>
            </dd>
          </template>
          <dt>出現在</dt>
          <dd>
            <span v-for="w in weeksSeen" :key="w.week" class="week-line">
              <b class="week-tag">W{{ w.week }}</b>
              <span class="inline-links"><RouterLink v-for="d in w.days" :key="d.date" :to="`/day/${d.date}`">{{ d.label }}</RouterLink></span>
            </span>
            <span v-if="!weeksSeen.length">還沒出現在每日筆記</span>
          </dd>
        </dl>

        <!-- eslint-disable-next-line vue/no-v-html -->
        <article class="prose" v-html="rendered.body" />

        <section v-if="k.abbr.length" class="psection">
          <h3>縮寫</h3>
          <ul>
            <li v-for="a in k.abbr" :key="a"><b>{{ a }}</b>　<span class="sub">{{ glossaryMap.get(a)?.full }}，{{ glossaryMap.get(a)?.zh }}</span></li>
          </ul>
        </section>
        <section v-if="sourceGroups.length" class="psection">
          <h3>來源</h3>
          <template v-for="g in sourceGroups" :key="g.kind">
            <h4 class="src-kind">{{ KIND_LABEL[g.kind] }}</h4>
            <ul>
              <li v-for="s in g.items" :key="s.title">
                <a v-if="s.url" :href="s.url" target="_blank" rel="noopener noreferrer">{{ s.title }}</a>
                <span v-else>{{ s.title }}</span>
              </li>
            </ul>
          </template>
        </section>
        <p class="sub" style="margin: 16px 0 0">更新於 {{ k.updated }}・{{ k.file }}</p>
      </template>
    </div>
  </aside>
</template>
