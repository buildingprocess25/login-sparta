FROM node:22-alpine AS builder

# Set pnpm environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies for the workspace
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Define build arguments
ARG VITE_API_BASE_URL
ARG VITE_APP_ENV
ARG VITE_SPARTA_SSO_ENABLED
ARG VITE_SPARTA_BUILDING_LOGIN_URL
ARG VITE_SPARTA_MAINTENANCE_LOGIN_URL
ARG VITE_SPARTA_ENERGY_LOGIN_URL

# Set environment variables for Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_SPARTA_SSO_ENABLED=$VITE_SPARTA_SSO_ENABLED
ENV VITE_SPARTA_BUILDING_LOGIN_URL=$VITE_SPARTA_BUILDING_LOGIN_URL
ENV VITE_SPARTA_MAINTENANCE_LOGIN_URL=$VITE_SPARTA_MAINTENANCE_LOGIN_URL
ENV VITE_SPARTA_ENERGY_LOGIN_URL=$VITE_SPARTA_ENERGY_LOGIN_URL

# Build the frontend web app
RUN pnpm --filter @sparta/web build

# Runner stage
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Configure Nginx for Single Page Application (SPA) routing
RUN sed -i 's/location \/ {/location \/ { try_files $uri $uri\/ \/index.html; /' /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
