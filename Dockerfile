# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# ---- deps: install all dependencies (incl. dev, needed for `prisma generate`) ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build: generate Prisma Client against the schema ----
FROM deps AS build
COPY . .
RUN npx prisma generate

# ---- dev: hot-reload with nodemon, source comes from a bind mount ----
FROM build AS dev
ENV NODE_ENV=development

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/prisma/data

EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# ---- runner: final image ----
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000

COPY --from=build /app ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /app/prisma/data \
    && addgroup -S app && adduser -S app -G app \
    && chown -R app:app /app

USER app
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
