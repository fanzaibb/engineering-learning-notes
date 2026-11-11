import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { installAbbrTooltips } from './lib/abbrTooltip';
import './styles.css';

installAbbrTooltips();
createApp(App).use(router).mount('#app');
