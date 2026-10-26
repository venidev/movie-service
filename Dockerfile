# Build the React client
FROM node:20-slim AS client
WORKDIR /client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client ./
RUN npm run build

# Compile the TypeScript API
FROM node:20-slim AS api
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# Runtime: production deps + compiled output only
FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=api /app/dist ./dist
COPY --from=client /client/dist ./client/dist
COPY openapi.yaml ./
COPY db ./db

USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
