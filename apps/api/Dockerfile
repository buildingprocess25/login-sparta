FROM node:22-alpine

# Set pnpm environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies for the workspace
# We install all dependencies (including dev) because tsx is used to run the server
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma Client
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" pnpm --filter @sparta/api prisma:generate

WORKDIR /app/apps/api

EXPOSE 10000

# Start the API server
CMD ["pnpm", "start"]
