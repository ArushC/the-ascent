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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json-summary'],
      include: ['src/**/*.{ts,tsx}', 'server/**/*.ts', 'shared/**/*.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,tsx}',
        '**/*.d.ts',
        'dist/**',
        'node_modules/**',
      ],
      thresholds: {
        statements: 67,
        branches: 67,
        functions: 73,
        lines: 67,
      },
    },
  },
})
