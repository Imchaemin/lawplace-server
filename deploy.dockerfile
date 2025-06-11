# 기본 이미지로 node:20.12.0 사용
FROM node:22.14.0-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /usr/src/app

COPY --chown=node:node package.json pnpm-lock.yaml ./

RUN npm install -g pnpm
RUN pnpm install

USER node

# Build the application
FROM base AS build
WORKDIR /usr/src/app

COPY --chown=node:node --from=deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node . .

# Load environment variables from .env.devnet
COPY --chown=node:node .env .env

RUN npm install -g pnpm

RUN pnpm prisma generate
RUN pnpm build

# Remove .env file after build
RUN rm -f .env

USER node

# Production image
FROM base AS production
WORKDIR /usr/src/app

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

# Copy and load environment variables for runtime
COPY --chown=node:node .env .env
RUN cat .env >> /etc/environment && rm -f .env

EXPOSE 8080

ENV HOSTNAME=0.0.0.0
ENV PORT=8080

CMD ["node", "dist/main.js"]