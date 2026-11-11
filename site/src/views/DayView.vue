<script setup lang="ts">
import { computed, watchEffect } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { dayByDate, days, knowledgeMap, STATUS_LABEL } from '../lib/content';
import { renderMarkdown, newEnv } from '../lib/markdown';
import NotFoundView from './NotFoundView.vue';

const route = useRoute();
const day = computed(() => dayByDate.get(String(route.params.date)));
const topics = computed(() => (day.value?.topics ?? []).map((id) => knowledgeMap.get(id)).filter((k) => !!k));
const html = computed(() => (day.value ? renderMarkdown(day.value.body, newEnv(`day-${day.value.date}`, true)) : ''));
const idx = computed(() => days.findIndex((d) => d.date === day.value?.date));
const prev = computed(() => (idx.value > 0 ? days[idx.value - 1] : undefined));
const next = computed(() => (idx.value >= 0 && idx.value < days.length - 1 ? days[idx.value + 1] : undefined));

watchEffect(() => {
  document.title = day.value ? `${day.value.label}｜山行・知識山域` : '找不到頁面｜山行・知識山域';
});
</script>

<template>
  <NotFoundView v-if="!day" />
  <main v-else id="main" class="dpage">
    <nav class="crumb" aria-label="麵包屑"><RouterLink to="/days">← 所有每日筆記</RouterLink></nav>
    <header style="display: flex; flex-direction: column; gap: 6px">
      <div class="mono eyebrow">{{ day.label }} · {{ day.date }}</div>
      <h1 class="page-title" style="margin: 0">{{ day.title }}</h1>
    </header>

    <section class="card" aria-labelledby="topics-h">
      <h2 id="topics-h" style="margin: 0 0 10px; font-size: 14px">當天的知識點（{{ topics.length }}）</h2>
      <ul class="topic-list">
        <li v-for="t in topics" :key="t.id">
          <RouterLink :to="`/k/${t.id}`">
            <span class="dot" :class="t.status" aria-hidden="true" />{{ t.title }}
            <span class="visually-hidden">，{{ STATUS_LABEL[t.status] }}</span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <article class="prose" v-html="html" />

    <nav aria-label="前後筆記" style="display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap">
      <RouterLink v-if="prev" :to="`/day/${prev.date}`" class="crumb">← {{ prev.label }}</RouterLink><span v-else />
      <RouterLink v-if="next" :to="`/day/${next.date}`" class="crumb">{{ next.label }} →</RouterLink>
    </nav>
  </main>
</template>
