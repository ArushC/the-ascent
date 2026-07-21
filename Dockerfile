FROM node:22-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV LEADERBOARD_DB=/data/leaderboard.sqlite

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/src/game/rng ./src/game/rng
COPY --from=build /app/src/game/systems/difficultySystem/DifficultySystem.ts ./src/game/systems/difficultySystem/DifficultySystem.ts
COPY --from=build /app/src/game/systems/platformSpawner/platformExtras.ts ./src/game/systems/platformSpawner/platformExtras.ts
COPY --from=build /app/dist ./dist

EXPOSE 3001
CMD ["npm", "start"]
