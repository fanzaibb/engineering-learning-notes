<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import {
  knowledgeMap, mountainMap, evidenceMap, glossaryMap, daysForKnowledge,
  STATUS_LABEL, STATUS_LEVEL, KIND_LABEL, type SourceKind,
} from '../lib/content';
import { renderMarkdown, decorateText, newEnv } from '../lib/markdown';
import NotFoundView from './NotFoundView.vue';

const route = useRoute();
const k = computed(() => knowledgeMap.get(String(route.params.id)));
const mountain = computed(() => (k.value ? mountainMap.get(k.value.mountain) : undefined));
const layer = computed(() => mountain.value?.layers.find((l) => l.n === k.value?.layer));
const appearsIn = computed(() => (k.value ? daysForKnowledge(k.value.id) : []));

// 同一頁共用「已出現」集合：標題與結論只加 tooltip，本文第一次出現寫全名
const rendered = computed(() => {
  if (!k.value) return { summary: '', body: '' };
  const summary = decorateText(k.value.summary, newEnv(`${k.value.id}-sum`, false));
  const body = renderMarkdown(k.value.body, newEnv(`${k.value.id}-body`, true));
  return { summary, body };
});

const KIND_ORDER: SourceKind[] = ['official', 'engineering', 'course'];
const sourceGroups = computed(() =>
  KIND_ORDER.map((kind) => ({ kind, items: (k.value?.sources ?? []).filter((s) => s.kind === kind) }))
    .filter((g) => g.items.length));

watchEffect(() => {
  document.title = k.value ? `${k.value.title}｜山行・知識山域` : '找不到頁面｜山行・知識山域';
});
</script>

<template>
  <NotFoundView v-if="!k" />
  <main v-else id="main" class="kpage">
    <header class="kpage-head">
      <nav class="crumb" aria-label="麵包屑">
        <RouterLink :to="{ path: `/m/${k.mountain}`, query: { sel: k.id } }">← {{ mountain?.title }}地圖</RouterLink>
      </nav>
      <div class="meta-row">
        <span class="pill" :class="k.status"><span class="dot" :class="k.status" aria-hidden="true" />{{ STATUS_LABEL[k.status] }}（{{ STATUS_LEVEL[k.status] }}）</span>
        <span>{{ mountain?.title }}・第 {{ k.layer }} 層・{{ layer?.alt }}・{{ layer?.name }}</span>
        <span class="mono" style="font-size: 11px">{{ k.id }}</span>
      </div>
      <h1 class="page-title" style="margin: 0">{{ k.title }}</h1>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p class="ksummary" v-html="rendered.summary" />
    </header>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <article class="prose" v-html="rendered.body" />

    <aside class="kaside" aria-label="知識點資訊">
      <section>
        <h2>證據</h2>
        <ul v-if="k.evidence.length">
          <li v-for="e in k.evidence" :key="e">
            <span class="ev-id">{{ e }}</span>
            <template v-if="evidenceMap.get(e)">　{{ evidenceMap.get(e)!.source }}</template>
            <div v-if="evidenceMap.get(e)" class="sub">{{ evidenceMap.get(e)!.note }}</div>
          </li>
        </ul>
        <p v-else style="margin: 0">尚無證據編號</p>
        <p v-if="k.evidenceNote" class="sub" style="margin: 8px 0 0">{{ k.evidenceNote }}</p>
      </section>

      <section>
        <h2>週次</h2>
        <p style="margin: 0">{{ k.weeks.join('、') || '尚未排定' }}</p>
      </section>

      <section v-if="k.related.length">
        <h2>相關知識點</h2>
        <ul>
          <li v-for="r in k.related" :key="r">
            <RouterLink :to="`/k/${r}`">{{ knowledgeMap.get(r)?.title ?? r }}</RouterLink>
          </li>
        </ul>
      </section>

      <section>
        <h2>出現在</h2>
        <ul v-if="appearsIn.length" class="inline-links" style="flex-direction: row">
          <li v-for="d in appearsIn" :key="d.date"><RouterLink :to="`/day/${d.date}`">{{ d.label }}</RouterLink></li>
        </ul>
        <p v-else style="margin: 0">還沒有每日筆記連到這裡</p>
      </section>

      <section v-if="k.abbr.length">
        <h2>縮寫</h2>
        <ul>
          <li v-for="a in k.abbr" :key="a">
            <b>{{ a }}</b>
            <div class="sub">{{ glossaryMap.get(a)?.full }}，{{ glossaryMap.get(a)?.zh }}</div>
          </li>
        </ul>
      </section>

      <section v-if="sourceGroups.length">
        <h2>來源</h2>
        <template v-for="g in sourceGroups" :key="g.kind">
          <h3 class="src-kind">{{ KIND_LABEL[g.kind] }}</h3>
          <ul>
            <li v-for="s in g.items" :key="s.title">
              <a v-if="s.url" :href="s.url" target="_blank" rel="noopener noreferrer">{{ s.title }}</a>
              <span v-else>{{ s.title }}</span>
            </li>
          </ul>
        </template>
      </section>

      <p class="sub" style="margin: 0; font-size: 12px; color: var(--muted)">更新於 {{ k.updated }}・{{ k.file }}</p>
    </aside>
  </main>
</template>
