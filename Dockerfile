#
# Builder
#
FROM node:18-alpine AS builder

WORKDIR /app

COPY . .

RUN apk add --update --upgrade --no-cache \
        alpine-sdk \
        python3 \
        ca-certificates \
    && \
    npm install -g pnpm@v8.6.10 && \
    pnpm install && \
    pnpm build

#
# Runner
#

FROM node:18-alpine

RUN apk add --update --upgrade --no-cache \
        ca-certificates

WORKDIR /app

COPY --from=builder /app .

CMD [ "node", "./packages/explorerkit-server/dist/index.js"]
