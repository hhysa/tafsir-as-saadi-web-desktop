import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const pagesBasePath = process.env.PAGES_BASE_PATH

export default defineConfig({
  plugins: [vue()],
  base: pagesBasePath === undefined ? './' : `${pagesBasePath.replace(/\/$/, '')}/`,
  server: { strictPort: true },
})
