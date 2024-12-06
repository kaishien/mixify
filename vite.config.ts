import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    react({
      babel: {
        parserOpts: {
          plugins: ['decorators-legacy', 'classProperties']
        }
      }
    })
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src')
    },
  },
  esbuild: {
    target: 'es2020'
  }
})
