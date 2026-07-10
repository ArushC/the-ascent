import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const leaderboardApiOrigin =
  process.env.VITE_LEADERBOARD_API_ORIGIN ?? 'http://localhost:3001'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': leaderboardApiOrigin,
    },
  },
  test: {
    environment: 'node',
  },
})
