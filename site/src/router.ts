import { createRouter, createWebHashHistory } from 'vue-router';
import MountainView from './views/MountainView.vue';
import KnowledgeView from './views/KnowledgeView.vue';
import DayView from './views/DayView.vue';
import DaysView from './views/DaysView.vue';
import NotFoundView from './views/NotFoundView.vue';

// 用 hash 路由：GitHub Pages 這類靜態主機不需要額外的 404 轉址設定。
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/m/backend' },
    { path: '/m/:mountain', component: MountainView },
    { path: '/k/:id', component: KnowledgeView },
    { path: '/day/:date', component: DayView },
    { path: '/days', component: DaysView },
    { path: '/:rest(.*)*', component: NotFoundView },
  ],
  scrollBehavior: (to, from) => (to.path === from.path ? false : { top: 0 }),
});
