<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <main id="main" class="dpage">
    <h1 class="page-title">找不到這一頁</h1>
    <p class="lead">網址可能打錯了，或這個知識點還沒建立。</p>
    <RouterLink to="/m/backend" class="btn-link">回到後端開發山</RouterLink>
  </main>
</template>
