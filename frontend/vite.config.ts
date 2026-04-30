import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const httpsKeyPath = env.LOCAL_HTTPS_KEY
  const httpsCertPath = env.LOCAL_HTTPS_CERT

  const useHttps = Boolean(httpsKeyPath && httpsCertPath)

  return {
    plugins: [react()],

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },

    server: {
      host: 'localhost',
      port: 5173,
      https: useHttps
        ? {
            key: fs.readFileSync(path.resolve(httpsKeyPath)),
            cert: fs.readFileSync(path.resolve(httpsCertPath)),
          }
        : undefined,
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/ws': {
          target: 'http://localhost:8000',
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})
