import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 內容在 site/ 外層（knowledge/、notes/、curriculum/），開發伺服器需允許讀取上一層。
export default defineConfig({
  base: './',
  plugins: [vue()],
  server: { fs: { allow: ['..'] } },
});
