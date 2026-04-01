FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* tsconfig.json ./
RUN npm ci --ignore-scripts

COPY src ./src
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 expressjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

USER expressjs

EXPOSE 80

CMD ["node", "dist/index.js"]