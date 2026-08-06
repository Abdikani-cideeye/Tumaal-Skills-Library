# DOCKER AND CONTAINERIZATION

## IMAGE BUILDING

- **ALWAYS** use multi-stage Docker builds. Separate the build stage (with dev dependencies, compilers, build tools) from the production stage (with only runtime dependencies and compiled artifacts).
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main.js"]
```
- **ALWAYS** use specific, pinned base image tags (e.g., `node:20.11-alpine`). NEVER use `latest` — it creates non-reproducible builds.
- **ALWAYS** prefer Alpine-based images for minimal attack surface and smaller image sizes.
- **ALWAYS** use `.dockerignore` to exclude `node_modules`, `.git`, `.env`, test files, and documentation from the build context.

## SECURITY

- **NEVER** run containers as root. ALWAYS create and use a non-root user in the Dockerfile.
```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```
- **NEVER** store secrets in Docker images, Dockerfiles, or build arguments. Inject secrets at runtime via environment variables.
- **ALWAYS** scan images for vulnerabilities before deployment using tools like Trivy, Snyk, or Docker Scout.
- **ALWAYS** keep base images updated. Rebuild images regularly to pick up security patches.

## RUNTIME CONFIGURATION

- **ALWAYS** pass configuration via environment variables at runtime. NEVER bake configuration into the image.
- **ALWAYS** implement health check endpoints and configure Docker health checks:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```
- **ALWAYS** set resource limits (CPU, memory) on containers to prevent a single container from consuming all host resources.

## COMPOSE PATTERNS

- **ALWAYS** use Docker Compose for local development environments that require multiple services (app, database, cache, queue).
- **ALWAYS** separate Docker Compose configurations: `docker-compose.yml` for base services, `docker-compose.dev.yml` for development overrides, `docker-compose.prod.yml` for production overrides.
- **NEVER** use Docker Compose in production for multi-host deployments. Use orchestration platforms (Kubernetes, ECS, Cloud Run) instead.

## LAYER OPTIMIZATION

- **ALWAYS** order Dockerfile instructions from least-frequently-changed to most-frequently-changed. This maximizes layer caching.
- **ALWAYS** copy `package*.json` and install dependencies BEFORE copying application source code. This prevents re-installing dependencies on every code change.
- **ALWAYS** combine related `RUN` commands into a single layer using `&&` to reduce image size.

## LOGGING

- **ALWAYS** log to `stdout`/`stderr` from containerized applications. Let the container runtime (Docker, Kubernetes) handle log collection and routing.
- **NEVER** write logs to files inside the container. Container filesystems are ephemeral.
