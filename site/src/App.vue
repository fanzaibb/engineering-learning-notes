<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink, RouterView } from 'vue-router';

const route = useRoute();
const section = computed(() => (route.path.startsWith('/day') ? 'days' : 'map'));
</script>

<template>
  <a class="skip" href="#main">跳到主要內容</a>
  <header class="site-header">
    <RouterLink to="/m/backend" class="brand" aria-label="山行・知識山域 首頁">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18.5" fill="none" stroke="#2F4A36" stroke-width="1.5" /><path d="M9 27 L16 15 L20 21 L24 13 L31 27 Z" fill="none" stroke="#2F4A36" stroke-width="1.6" stroke-linejoin="round" /></svg>
      <span>
        <span class="brand-name">山行 · 知識山域</span>
        <span class="mono brand-sub">The Knowledge Range</span>
      </span>
    </RouterLink>
    <p class="tagline">從山腳的基礎往上走，每一層都踩在下一層上。</p>
    <nav aria-label="主要導覽" class="site-nav">
      <RouterLink to="/m/backend" class="navbtn" :class="{ on: section === 'map' }" :aria-current="section === 'map' ? 'page' : undefined">探索山域</RouterLink>
      <RouterLink to="/days" class="navbtn" :class="{ on: section === 'days' }" :aria-current="section === 'days' ? 'page' : undefined">每日筆記</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>
