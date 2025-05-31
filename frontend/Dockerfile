FROM node:22-slim AS builder
LABEL com.centurylinklabs.watchtower.enable="true"

WORKDIR /app


COPY package.json yarn.lock ./

RUN yarn install

COPY . .

ARG NEXT_PUBLIC_BACKEND_URI
ARG NEXT_PUBLIC_DYNAMIC_ENV_ID
ENV NEXT_PUBLIC_BACKEND_URI=https://api.zk-loans.aichallenge.fun
ENV NEXT_PUBLIC_DYNAMIC_ENV_ID=f7582e95-eb3d-4beb-bff1-6e94004f0000

# Build del frontend
RUN yarn build

# ---------- Runner ----------
FROM node:22-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*


COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 4500

CMD ["yarn", "start", "--port", "4500", "--hostname", "0.0.0.0"]