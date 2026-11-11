import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import MountainView from './views/MountainView.vue';
import DayView from './views/DayView.vue';
import DaysView from './views/DaysView.vue';
import NotFoundView from './views/NotFoundView.vue';
import { knowledgeMap } from './lib/content';

// 用 hash 路由：GitHub Pages 這類靜態主機不需要額外的 404 轉址設定。
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/m/:mountain', component: MountainView },
    // 知識點在路徑地圖的側欄打開；舊連結 /k/:id 轉過去
    {
      path: '/k/:id',
      redirect: (to) => {
        const k = knowledgeMap.get(String(to.params.id));
        return k ? { path: `/m/${k.mountain}`, query: { k: k.id } } : '/not-found';
      },
    },
    { path: '/day/:date', component: DayView },
    { path: '/days', component: DaysView },
    { path: '/:rest(.*)*', component: NotFoundView },
  ],
  scrollBehavior: (to, from) => (to.path === from.path ? false : { top: 0 }),
});
