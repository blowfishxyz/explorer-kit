# syntax=docker/dockerfile:1

# Build stage: install the full workspace, compile the server and its workspace dependencies,
# and extract a production-only copy of the server package.
FROM node:20-bookworm AS build

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY packages/explorerkit-server/package.json ./packages/explorerkit-server/
COPY packages/explorerkit-idls/package.json ./packages/explorerkit-idls/
COPY packages/explorerkit-translator/package.json ./packages/explorerkit-translator/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config-explorerkit/package.json ./packages/eslint-config-explorerkit/

RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY packages/tsconfig/base.json ./packages/tsconfig/
COPY packages/explorerkit-server/tsconfig.json ./packages/explorerkit-server/
COPY packages/explorerkit-idls/tsconfig.json ./packages/explorerkit-idls/
COPY packages/explorerkit-translator/tsconfig.json ./packages/explorerkit-translator/
COPY packages/explorerkit-server/src ./packages/explorerkit-server/src
COPY packages/explorerkit-idls/src ./packages/explorerkit-idls/src
COPY packages/explorerkit-translator/src ./packages/explorerkit-translator/src

RUN pnpm --filter "@solanafm/explorer-kit-server..." run build

# `pnpm deploy` copies the server's `dist`, its production dependencies, and the built workspace
# packages into a standalone directory, without dev dependencies or the pnpm store.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm --filter @solanafm/explorer-kit-server deploy --prod /prod

# Distroless installs Node.js at /nodejs/bin/node only. The k8s deployment runs `node ./dist/index.js`,
# so the runtime image needs `node` on PATH. Distroless has no shell, so create the link here.
RUN mkdir -p /links && ln -s /nodejs/bin/node /links/node

# Runtime stage: Node.js and CA certificates only. No shell, no package manager, non-root user.
FROM gcr.io/distroless/nodejs20-debian12:nonroot

ENV NODE_ENV=production

WORKDIR /usr/src/app/packages/explorerkit-server

COPY --from=build /links/ /usr/local/bin/
COPY --from=build /prod ./

EXPOSE 3000

ENTRYPOINT []
CMD ["node", "./dist/index.js"]
