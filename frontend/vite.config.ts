import { sentryVitePlugin } from '@sentry/vite-plugin'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginSvgr from 'vite-plugin-svgr'
import viteTsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    viteTsconfigPaths(),
    vitePluginSvgr({ include: '**/*.svg?react' }),
    sentryVitePlugin({
      org: 'intertechnologies',
      project: 'ps-front',
    }),
  ],
  server: {
    port: 3000,
    watch: { usePolling: true },
  },
  build: {
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
        },
      },
    },

    sourcemap: true,
  },
})
