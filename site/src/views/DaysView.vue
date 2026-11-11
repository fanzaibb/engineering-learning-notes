<script setup lang="ts">
import { watchEffect } from 'vue';
import { RouterLink } from 'vue-router';
import { days } from '../lib/content';

watchEffect(() => { document.title = '每日筆記｜山行・知識山域'; });
</script>

<template>
  <main id="main" class="dpage">
    <header>
      <div class="mono eyebrow">Daily notes</div>
      <h1 class="page-title">每日筆記</h1>
      <p class="lead">原始的上課紀錄，依日期排列。每一份都連到它碰到的知識點。</p>
    </header>
    <RouterLink v-for="d in days" :key="d.date" :to="`/day/${d.date}`" class="card day-card">
      <span class="mono eyebrow">{{ d.label }} · {{ d.date }}</span>
      <b style="font-size: 18px; font-family: var(--serif)">{{ d.title }}</b>
      <span style="font-size: 13px; color: var(--muted)">{{ d.topics.length }} 個知識點</span>
    </RouterLink>
    <p v-if="!days.length" class="empty">還沒有每日筆記。</p>
  </main>
</template>
