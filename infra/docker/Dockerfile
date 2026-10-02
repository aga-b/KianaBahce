# Taban imaj sürüm + digest ile sabit; güncelleme bilinçli bir PR'dır (K01-07).
ARG NODE_IMAGE=node:24-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6

FROM ${NODE_IMAGE} AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install --global pnpm@11.25.0
COPY . .
RUN pnpm install --frozen-lockfile && pnpm build \
 && pnpm --filter @kiana/web deploy --prod --legacy /out/web

FROM ${NODE_IMAGE} AS web
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /out/web/package.json ./package.json
COPY --from=build --chown=node:node /out/web/node_modules ./node_modules
COPY --from=build --chown=node:node /app/apps/web/.next ./.next
COPY --from=build --chown=node:node /app/apps/web/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "node_modules/next/dist/bin/next", "start", "--hostname", "0.0.0.0"]

FROM ${NODE_IMAGE} AS worker
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/apps/worker/dist /app/dist
COPY --from=build --chown=node:node /app/apps/worker/package.json /app/package.json
USER node
EXPOSE 3101
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:3101/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]

FROM ${NODE_IMAGE} AS media-worker
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app/apps/media-worker/dist /app/dist
COPY --from=build --chown=node:node /app/apps/media-worker/package.json /app/package.json
USER node
EXPOSE 3102
HEALTHCHECK --interval=30s --timeout=3s CMD node -e "fetch('http://127.0.0.1:3102/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
