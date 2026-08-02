FROM node:20-alpine AS base

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci

COPY src ./src

FROM base AS test

ENV NODE_ENV=test
CMD ["npm", "test"]

FROM base AS runtime

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://localhost:5000').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["npm", "start"]
